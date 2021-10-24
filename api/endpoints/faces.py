from flask import Blueprint, current_app, request, make_response
from ..db import Database
from ..utils import error, authenticated
from ..fill_tables import fill_tables
import sqlalchemy as sqla

from deepface import DeepFace
from deepface.commons import distance as dst
import time
import traceback
import pickle

faces = Blueprint('faces', __name__, url_prefix="/faces")

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

def find_identity(b64image, all_user_faces):
    st = time.time()
    # model = DeepFace.build_model('VGG-Face')
    target_embedding = b64image_to_embedding(b64image)

    distances = []
    for i, row in all_user_faces.iterrows():
        ref_embedding = pickle.loads(bytes.from_hex(row['data']))
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

@faces.route('/me', methods=['POST'])
@authenticated
def profile_image(session):
    if session['account_type'] != 'customer':
        return error(
            'Only customers may access this resource',
            code=403
        )
    if request.method=='POST':
        if not ("username" in request.form and "b64image" in request.form):
            return make_response(
                "Please add username and b64image fields (create_user POST)",
                404
            )

        username = request.form["username"]
        b64image = request.form["b64image"]

        if len(username.strip()) == 0:
            return make_response(
                "Username is empty (create_user POST)",
                404
            )
        elif len(b64image.strip()) == 0:
            return make_response(
                "b64 image is empty (create_user POST)",
                404
            )

        st = time.time()
        embedding = b64image_to_embedding(b64image)
        print(f"b64image_to_embedding took {time.time() - st} sec")
        if embedding is None:
            return make_response("Error while converting base 64 to embedding (create_user POST)", 404)
        with Database.get_db() as db:
            db.insert(
                'user_faces',
                cust_id=session['user'],
                data=pickle.dumps(embedding).hex()
            )
    return make_response('OK', 200)

def recognize_face(base64image):
    with Database.get_db() as db:
        all_user_faces = db.query(sqla.select(db['user_faces'].c.cust_id, db['user_faces'].c.data).select_from(db['user_faces'].table))

    return find_identity(base64image, all_user_faces)