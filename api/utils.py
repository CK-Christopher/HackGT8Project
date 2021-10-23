from flask import make_response, request, current_app
from .db import Database
import jwt
from functools import wraps
from datetime import datetime

TIMESTAMP_FORMAT = "%Y-%m-%d %H:%M:%S"

def error(message, *, data=None, context=None, code=400):
    # Maybe log

    err = {'message': message, 'code': code}
    if data is not None:
        err['data'] = data

    if context is not None:
        err['context'] = context

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


def check_csrf(endpoint, skip_methods=None):
    """
    Wrapper to enforce CSRF tokens.
    Always use UNDER @authenticated decorator
    """

    def wrapper(func):

        @wraps(func)
        def ensure_csrf(session, *args, **kwargs):
            if skip_methods is None or request.method not in skip_methods:
                token = request.cookies.get('csrf', None)
                if token is None:
                    return error(
                        'CSRF attack prevented',
                        context="No CSRF token was present on the request",
                        code=401
                    )
                with Database.get_db() as db:
                    csrf = db['csrf']
                    results = db.query(
                        csrf.select.where(
                            (csrf.c.id == session['user'])
                            & (csrf.c.token == token)
                            & (csrf.c.endpoint == endpoint)
                            & (csrf.c.ip == request.remote_addr)
                            & (csrf.c.expires >= datetime.now())
                        )
                    )
                    if not len(results):
                        return error(
                            'CSRF attack prevented',
                            context="Forged/Expired CSRF token presented",
                            code=401
                        )
                    db.execute(
                        csrf.delete.where(
                            (csrf.c.expires < datetime.now())
                            | (
                                (csrf.c.id == session['user'])
                                & (csrf.c.token == token)
                            )
                        )
                    )
            return func(session, *args, **kwargs)

        return ensure_csrf

    return wrapper
