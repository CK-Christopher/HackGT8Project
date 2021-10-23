from flask import make_response, request
import jwt
from functools import wraps

TIMESTAMP_FORMAT = "%Y-%m-%d %H:%M:%S"

def error(message, *, data=None, context=None, code=400):
    # Maybe log

    err = {'message': message, 'code': code}
    if data is not None:
        err['data'] = data

    if context is not None:
        err['context'] = data

    return make_response(err, code)

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
                session = jwt.decode(token, r.read(), algorithm="RS256")
            except: # FIXME figure out jwt's exception classes
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