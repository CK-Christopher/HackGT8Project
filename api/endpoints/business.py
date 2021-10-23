from flask import Blueprint, current_app, request, make_response
from ..db import Database
from ..utils import error, authenticated
import sqlalchemy as sqla

business = Blueprint('business', __name__, url_prefix="/business")

@business.route('/profile', methods=["GET", "POST"])
@authenticated
def profile(session):
    """
    GET: Gets all profile attributes except password and email hashes
    POST: Allows updates to all profile attributes except password
    """
    if session['account_type'] != 'business':
        return error(
            "Invalid account type",
            context="This view requires a buisness account",
            code=400
        )
    if request.method == 'GET':
        with Database.get_db() as db:
            business = db['business']
            user = db['user']
            profile = db.query(
                sqla.select(
                    business.table,
                    user.table
                ).select_from(
                    user.table.join(business.table)
                ).where(user.c.id == session['user'])
            )[0].to_json() # If there's not exactly 1 entry here, something has gone *CATACLYSMICALLY* wrong
        return make_response(
            {
                'user': profile['id'],
                'email': profile['email'],
                'name': profile['name'],
                'location': profile['location']
            },
            200
        )
    else:
        business_updates = {}
        account_updates = {}
        if not request.is_json:
            return error(
                "POST request not in JSON format",
                code=400
            )
        data = request.get_json()
        if 'name' in data:
            account_updates['name'] = data['name'] # FIXME sanitize
        if 'location' in data:
            business_updates['location'] = data['location'] # FIXME sanitize
        if 'email' in data:
            email_hash = sha256(data['email'].encode()).hexdigest()
            with Database.get_db() as db:
                user = db['user']
                results = db.query(
                    user.select.where(user.c.email_hash == email_hash)
                )
                if len(results):
                    return error("That email is already in use", code=409)
            account_updates['email'] = data['email'] # FIXME sanitize
        if len(account_updates) or len(business_updates):
            with Database.get_db() as db:
                user = db['user']
                business = db['business']
                if len(account_updates):
                    db.execute(
                        user.update.where(
                            user.c.id == session['user']
                        ).values(**account_updates)
                    )
                if len(business_updates):
                    db.execute(
                        business.update.where(
                            business.c.id == session['user']
                        ).values(**business_updates)
                    )
        return make_response("OK", 200)


@business.route('/users')
@authenticated
def get_users(session):
    """
    This endpoint should list the users who have a relationship with this business, and their current point values
    """
    with Database.get_db() as db:
        shops_at = db['shops_at']
        results = db.query(
            shops_at.select.where(shops_at.c.bus_id == session['user'])
        )
        return make_response(
            [
                {
                    'user': row['cust_id'], # anonymize?
                    'points': row['points']
                }
                for idx, row in results.iterrows()
            ],
            200
        )
