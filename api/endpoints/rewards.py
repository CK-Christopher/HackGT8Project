from flask import Blueprint, current_app, request, make_response
from ..db import Database
from ..utils import error, authenticated
import sqlalchemy as sqla

rewards = Blueprint("rewards", __name__)

@rewards.route('/business/<bus_id>/rewards', methods=["GET", "INSERT"])
@authenticated
def list_or_add_rewards(session, bus_id):
    if request.method == 'GET':
        # don't bother checking session type
        # customers and businesses can both view this endpoint
        with Database.get_db() as db:
            rewards = db['rewards']
            results = db.query(
                rewards.select.where(
                    rewards.c.bus_id == bus_id
                )
            )
        return make_response(
            results.to_json(),
            200
        )
    else:
        if session['account_type'] != 'business':
            return error(
                "Invalid account type",
                context="This view requires a buisness account",
                code=400
            )
        if not request.is_json:
            return error(
                "POST request not in JSON format",
                code=400
            )
        data = request.get_json()
        if 'cost' not in data:
            return error("Missing required json parameter 'cost'", code=400)
        if 'name' not in data:
            return error("Missing required json parameter 'name'", code=400)
        if 'description' not in data:
            return error("Missing required json parameter 'description'", code=400)
        with Database.get_db() as db:
            db.insert(
                'rewards',
                bus_id=session['user'],
                cost=data['cost'], # FIXME sanitize
                name=data['name'], # FIXME sanitize
                description=data['description'] # FIXME sanitize
            )
            rewards = db['rewards']
            results = db.query(
                rewards.select(rewards.c.id).where(
                    (rewards.c.bus_id == session['user']) & (rewards.c.name == data['name']) & (rewards.c.cost == data['cost'])
                )
            )
            return make_response(max(results['id']), 200)

@rewards.route('/business/<bus_id>/rewards/<r_id>', methods=["GET", "POST", "DELETE"])
@authenticated
def view_modify_delete_rewards(session, bus_id, r_id):
    with Database.get_db() as db:
        rewards = db['rewards']
        images = db['rewards_images']
        results = db.query(
            rewards.select.where(
                (rewards.c.id == r_id) & (rewards.c.bus_id == bus_id)
            )
        )
        if not len(results):
            return error(
                "Not found",
                context="No such reward '{}'".format(r_id),
                code=404
            )
        if request.method == 'GET':
            # Don't check session type
            # Return reward info
            gallery = db.query(
                images.select.where(
                    images.c.reward_id == r_id
                )
            )
            return make_response(
                {
                    'id': r_id,
                    'business': bus_id,
                    'name': results['name'][0],
                    'cost': results['cost'][0],
                    'description': results['description'][0],
                    'gallery': [
                        {
                            'id': img['id'],
                            'url': img['url']
                        }
                        for idx, img in gallery.iterrows()
                    ]
                },
                200
            )
        elif request.method == 'POST':
            # check bus_id == session[user] to enforce ownership
            if bus_id != session['user']:
                return error(
                    "Not allowed",
                    context="You are not the owner of this object",
                    code=403
                )
            # Again, no need to check session type. Only Businesses can be owners
            if not request.is_json:
                return error(
                    "POST request not in JSON format",
                    code=400
                )
            data = request.get_json()
            updates = {}
            if 'cost' in data:
                updates['cost'] = data['cost']
            if 'name' in data:
                updates['name'] = data['name']
            if 'description' in data:
                updates['description'] = data['description']
            db.execute(rewards.update.where(rewards.c.id == r_id).values(**updates))
        else:
            # check bus_id == session[user] to enforce ownership
            if bus_id != session['user']:
                return error(
                    "Not allowed",
                    context="You are not the owner of this object",
                    code=403
                )
            # Again, no need to check session type. Only Businesses can be owners
            db.execute(images.delete.where(images.c.reward_id == r_id)) # FIXME should kill the images from storage
            db.execute(rewards.delete.where(rewards.c.id == r_id))
            return make_response('OK', 200)
