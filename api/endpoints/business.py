import ast

from flask import Blueprint, current_app, request, make_response
from ..db import Database
from ..utils import error, authenticated
from ..fill_tables import fill_tables
import sqlalchemy as sqla

from deepface import DeepFace
from deepface.commons import distance as dst
import time
import traceback

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
            ).iloc[0].to_dict() # If there's not exactly 1 entry here, something has gone *CATACLYSMICALLY* wrong
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


@business.route('/customers')
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
            {
                'customers': [
                    {
                        'user': row['cust_id'], # anonymize?
                        'points': row['points']
                    }
                    for idx, row in results.iterrows()
                ],
            },
            200
        )

# curl --data "username=user&b64image=data:image/jpeg;base64,$( base64 /Users/andrew/Downloads/testimage.jpeg)" "http://127.0.0.1:8888/business/update_profile_image"
@business.route("/update_profile_image", methods=['POST'])
def update_profile_image():
    if not ("username" in request.form and "b64image" in request.form):
        return "Please add username and b64image fields (create_user POST)", 404

    username = request.form["username"]
    b64image = request.form["b64image"]

    if len(username.strip()) == 0:
        return "Username is empty (create_user POST)", 404
    elif len(b64image.strip()) == 0:
        return "b64 image is empty (create_user POST)", 404

    st = time.time()
    embedding = b64image_to_embedding(b64image)
    print(f"b64image_to_embedding took {time.time() - st} sec")
    if embedding is None:
        return "Error while converting base 64 to embedding (create_user POST)", 404

    with Database.get_db() as db:
        db.insert('user_faces', cust_id='id' + '2' + '0' * 29, url=str(embedding))

    return "success"

def b64image_to_embedding(b64image):
    model_param = {'model_name': 'VGG-Face',
                   'detector_backend': 'opencv'}  # 'distance_metric': 'cosine'

    if not (len(b64image) > 11 and b64image[0:11] == "data:image/"):
        print("invalid image passed")
        return None

    try:
        embedding = DeepFace.represent(b64image, **model_param)
    except Exception:
        traceback.print_exc()
        return None
    return embedding

# curl -X PUT -d "base64image=data:image/jpeg;base64,$( base64 /Users/andrew/Downloads/testimage.jpeg)" "http://127.0.0.1:8888/business/recognize_face"
@business.route("/recognize_face", methods=['PUT'])
def recognize_face():
    base64image = request.form['base64image']
    with Database.get_db() as db:
        all_user_faces = db.query(sqla.select(db['user_faces'].c.cust_id, db['user_faces'].c.url).select_from(db['user_faces'].table))

    identity = find_identity(base64image, all_user_faces)

    return "success"

def find_identity(b64image, all_user_faces):
    st = time.time()
    # model = DeepFace.build_model('VGG-Face')
    target_embedding = b64image_to_embedding(b64image)

    distances = []
    for i, row in all_user_faces.iterrows():
        ref_embedding = ast.literal_eval(row['url'])
        distances.append(dst.findCosineDistance(target_embedding, ref_embedding))
    all_user_faces['distances'] = distances
    print(distances)

    threshold = 0.3751  # dst.findThreshold('VGG-Face', 'euclidean')

    df = all_user_faces[all_user_faces['distances'] < threshold]
    df = df.sort_values('distances', ascending=False)
    print(df)
    print(f"find identity took {time.time() - st} sec")
    if len(df) == 0:
        return None
    return df.iloc[0]

@business.route("/test_fill", methods=['GET'])
def test_fill():
    fill_tables()
    return "success";