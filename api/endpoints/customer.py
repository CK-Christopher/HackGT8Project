from flask import Blueprint, current_app, request, make_response
from ..db import Database
from ..utils import error, authenticated
import sqlalchemy as sqla
import json

customer = Blueprint('customer', __name__, url_prefix="/customer")

@customer.route('/profile', methods=["GET", "POST"])
@authenticated
def profile(session):
    """
    GET: Gets all profile attributes except password and email hashes
    POST: Allows updates to all profile attributes except password
    """
    if session['account_type'] != 'customer':
        return error(
            "Invalid account type",
            context="This view requires a user account",
            code=400
        )
    if request.method == 'GET':
        with Database.get_db() as db:
            user = db['user']
            profile = db.query(
                user.select.where(user.c.id == session['user'])
            ).iloc[0].to_dict()
        return make_response(
            {
                'user': profile['id'],
                'email': profile['email'],
                'name': profile['name'],
            },
            200
        )
    else:
        account_updates = {}
        if not request.is_json:
            return error(
                "POST request not in JSON format",
                code=400
            )
        data = json.load(request.get_json())
        if 'name' in data:
            account_updates['name'] = data['name'] # FIXME sanitize
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
        if len(account_updates):
            with Database.get_db() as db:
                user = db['user']
                if len(account_updates):
                    db.execute(
                        user.update.where(
                            user.c.id == session['user']
                        ).values(**account_updates)
                    )
        return make_response("OK", 200)


@customer.route('/businesses')
@authenticated
def get_business(session):
    """
    This endpoint should list the business who the customer has shopped with and the current point values for each of the businesses.
    """
    with Database.get_db() as db:
        shops_at = db['shops_at']
        results = db.query(
            shops_at.select.where(shops_at.c.cust_id == session['user'])
        )
    for idx, row in results.iterrows():
        results[idx] = db.query(
            user.select.where(user.c.id == row['bus_id'])
        )

        return make_response(
            [
                {
                    'name': row['name'],
                    'points': row['points']
                }
                for idx, row in results.iterrows()
            ],
            200
        )
