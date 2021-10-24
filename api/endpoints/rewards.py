from flask import Blueprint, current_app, request, make_response
from ..db import Database
from ..utils import error, authenticated, getblob
import sqlalchemy as sqla
from Crypto.Random import get_random_bytes

rewards = Blueprint("rewards", __name__)

@rewards.route('/business/<bus_id>/rewards', methods=["GET", "POST"])
@authenticated
def list_or_add_rewards(session, bus_id):
    if bus_id == 'me' and session['account_type'] == 'business':
        bus_id = session['user']
    if request.method == 'GET':
        # don't bother checking session type
        # customers and businesses can both view this endpoint
        with Database.get_db() as db:
            rewards = db['rewards']
            results = db.query(
                rewards.select.where(
                    rewards.c.bus_id == bus_id
                )
            ).rename({'bus_id': 'business'}, axis='columns')
        return make_response(
            {
                'rewards': [
                    row.to_dict()
                    for idx, row in results.iterrows()
                ]
            },
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
                sqla.select(rewards.c.id).where(
                    (rewards.c.bus_id == session['user']) & (rewards.c.name == data['name']) & (rewards.c.cost == data['cost'])
                )
            )
            return make_response(
                {
                    'id': max(results['id'])
                },
                200
            )

@rewards.route('/business/<bus_id>/rewards/<r_id>', methods=["GET", "PATCH", "DELETE"])
@authenticated
def view_modify_delete_rewards(session, bus_id, r_id):
    if bus_id == 'me' and session['account_type'] == 'business':
        bus_id = session['user']
    try:
        r_id = int(r_id)
    except ValueError:
        return error(
            "Invalid Reward ID",
            context='Reward ID must be an integer, not "{}"'.format(type(r_id)),
            code=400
        )
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
                    'cost': int(results['cost'][0]),
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
        elif request.method == 'PATCH':
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

@rewards.route('/business/<bus_id>/rewards/<r_id>/images', methods=["POST"])
@authenticated
def add_image(session, bus_id, r_id):
    image_types = {
        'image/jpeg': '.jpeg',
        'image/png': '.png'
    }
    if bus_id == 'me' and session['account_type'] == 'business':
        bus_id = session['user']
    if bus_id != session['user']:
        return error(
            "Not allowed",
            context="You are not the owner of this object",
            code=403
        )
    if 'image' not in request.files:
        return error(
            "No image provided",
            context="Must provide a file with name 'image'",
            code=400
        )
    if 'Content-Length' not in request.headers or int(request.headers['Content-Length']) > 1048**2:
        return error(
            "Image too large",
            context="Image must not exceed 1 Mib",
            code=400
        )
    image_file = request.files['image']
    if image_file.content_type is None and '.' in image_file.filename:
        # Fallback content_type inference
        # Shouldn't be too unsafe, just might prevent images displaying if faked
        ext = image_file.filename.split('.')[-1]
        image_file.content_type = 'image/{}'.format(ext)
    if image_file.content_type not in image_types:
        return error(
            "Unsupported content type",
            context="Uploaded image must be png or jpeg",
            code=400
        )
    with Database.get_db() as db:
        rewards = db['rewards']
        results = db.query(
            rewards.select.where(rewards.c.id == r_id)
        )
        if not len(results):
            return error("Reward id '{}' not found".format(r_id), code=404)
    image_id = get_random_bytes(16).hex()
    path = 'gs://{}/business/{}/reward_images/{}{}'.format(
        current_app.config['IMAGE_BUCKET'],
        session['user'],
        image_id,
        image_types[image_file.content_type]
    )
    image = getblob(path)
    image.upload_from_file(image_file, content_type=image_file.content_type)
    image.reload()
    with Database.get_db() as db:
        db.insert(
            'rewards_images',
            reward_id=r_id,
            bus_id=bus_id,
            url=image.public_url
        )
    return make_response(image.public_url, 200)
