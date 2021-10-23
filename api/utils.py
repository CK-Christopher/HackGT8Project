from flask import make_response, request, current_app
import jwt
from functools import wraps
from google.cloud import storage

TIMESTAMP_FORMAT = "%Y-%m-%d %H:%M:%S"

def error(message, *, data=None, context=None, code=400):
    # Maybe log

    err = {'message': message, 'code': code}
    if data is not None:
        err['data'] = data

    if context is not None:
        err['context'] = context

    return make_response(err, code)

def getblob(gs_path):
    # Simplified from https://github.com/getzlab/dalmatian/blob/master/dalmatian/core.py#L991
    if not gs_path.startswith('gs://'):
        raise ValueError('getblob path must start with gs://')
    gs_path = gs_path[5:]
    components = gs_path.split('/')
    bucket_id = components[0]
    bucket_path = '/'.join(components[1:])
    print("Accessing", bucket_id, bucket_path)
    cli = storage.Client()
    print("client", cli)
    bucket = cli.bucket(bucket_id)
    print("bucket", bucket)
    blob = bucket.blob(bucket_path)
    print("blob", blob)
    return blob
    # return storage.Client().bucket(bucket_id).blob(bucket_path)

def authenticated(func):
    """
    Wrapper for authenticated endpoints. Provides user's authentication object
    as an argument.

    ex/
    @blueprint.route("/whatever")
    @authenticated
    def secure_endpoint(session):
        return session['user']
    """

    @wraps(func)
    def ensure_auth(*args, **kwargs):
        token = request.cookies.get('session', None)
        user = request.cookies.get('user', None)
        issued = request.cookies.get('loggedin', None)
        acct_type = request.cookies.get('acct_type', None)
        if token is None or user is None or issued is None or acct_type is None:
            return error(
                "Not logged in, or could not validate credentials",
                context="Must be logged in to access this endpoint",
                code=401
            )
        with open(current_app.config["RSA_KEY"]+'.pub') as r:
            try:
                session = jwt.decode(token, r.read(), algorithms=["RS256"])
            except: # FIXME figure out jwt's exception classes
                import traceback
                traceback.print_exc()
                return error(
                    "Not logged in, or could not validate credentials",
                    context="Must be logged in to access this endpoint",
                    code=401
                )
        if session['user'] != user or session['account_type'] != acct_type or session['issued'] != issued:
            return error(
                "Not logged in, or could not validate credentials",
                context="Must be logged in to access this endpoint",
                code=401
            )
        return func(session, *args, **kwargs)

    return ensure_auth
