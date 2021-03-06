from flask import Blueprint, make_response, current_app, request
from ..db import Database
from ..utils import error, TIMESTAMP_FORMAT, authenticated
from hashlib import sha256
from Crypto.Protocol.KDF import bcrypt, bcrypt_check
from Crypto.Random import get_random_bytes
from datetime import datetime
from base64 import b85encode
import jwt

auth = Blueprint('auth', __name__, url_prefix='/auth')

AUTH_COOKIE_LIFESPAN = 604800 # 1 week
BCRYPT_COST = 12

def generate_session_token(user_id, account_type):
    now = datetime.now()
    with open(current_app.config['RSA_KEY']) as r:
        return jwt.encode(
            {
                'user': user_id,
                'account_type': account_type,
                'issued': now.strftime(TIMESTAMP_FORMAT),
                'session_id': get_random_bytes(4).hex(),
                'exp': int(now.timestamp() + AUTH_COOKIE_LIFESPAN)
            },
            r.read(),
            algorithm="RS256"
        ), now

@auth.route('/test')
def test():
    return generate_session_token('hello', 'blorp')

@auth.route("/login", methods=["POST"])
def login():
    """
    Checks for email & password in formdata
    """
    if 'email' not in request.form:
        return error("Missing required form parameter 'email'", code=400)
    if 'password' not in request.form:
        return error("Missing required form parameter 'password'", code=400)
    email_hash = sha256(request.form['email'].encode()).hexdigest()
    with Database.get_db() as db:
        user = db['user']
        results = db.query(
            user.select.where(
                user.c.email_hash == email_hash
            )
        )
    if not len(results):
        return error("No user found with that email/password combination", code=404)
    assert len(results) == 1, "Email hash collision!"
    try:
        bcrypt_check(
            b85encode(sha256(request.form['password'].encode()).digest()), # shorten to 40 bcryptable bytes
            results['pw_hash'][0]
        )
    except ValueError:
        return error("No user found with that email/password combination", code=404)
    with Database.get_db() as db:
        customer = db['customer']
        customer_results = db.query(
            customer.select.where(customer.c.id == results['id'][0])
        )
    token, now = generate_session_token(results['id'][0], 'customer' if len(customer_results) else 'business')
    response = make_response('OK', 200)
    response.set_cookie(
        'session',
        token,
        max_age=AUTH_COOKIE_LIFESPAN,
        domain=current_app.config['DOMAIN'],
        secure=current_app.config['SECURE_AUTH_COOKIES'],
        httponly=True,
        samesite='Strict'
    )
    response.set_cookie(
        'user',
        results['id'][0],
        domain=current_app.config['DOMAIN'],
        secure=current_app.config['SECURE_AUTH_COOKIES'],
        httponly=False,
        samesite='Lax'
    )
    response.set_cookie(
        'loggedin',
        now.strftime(TIMESTAMP_FORMAT),
        domain=current_app.config['DOMAIN'],
        secure=current_app.config['SECURE_AUTH_COOKIES'],
        httponly=False,
        samesite='Lax'
    )
    response.set_cookie(
        'acct_type',
        'customer' if len(customer_results) else 'business',
        domain=current_app.config['DOMAIN'],
        secure=current_app.config['SECURE_AUTH_COOKIES'],
        httponly=False,
        samesite='Lax'
    )
    return response

@auth.route("/register/customer", methods=["POST"])
def register_customer():
    if 'email' not in request.form:
        return error("Missing required form parameter 'email'", code=400)
    if 'password' not in request.form:
        return error("Missing required form parameter 'password'", code=400)
    if 'name' not in request.form:
        return error("Missing required form parameter 'name'", code=400)
    email_hash = sha256(request.form['email'].encode()).hexdigest()
    with Database.get_db() as db:
        user = db['user']
        results = db.query(
            user.select.where(
                user.c.email_hash == email_hash
            )
        )
    if len(results):
        return error("That email is already in use", code=409)
    userID = get_random_bytes(16).hex()
    with Database.get_db() as db:
        db.insert(
            'user',
            id=userID,
            pw_hash=bcrypt(
                b85encode(sha256(request.form['password'].encode()).digest()), # shorten to 40 bcryptable bytes
                BCRYPT_COST,
                # Use a random salt. We don't need to pick our own
            ),
            email=request.form['email'], # FIXME sanitize
            email_hash=email_hash,
            name=request.form['name'] # FIXME sanitize
        )
        db.insert(
            'customer',
            id=userID
        )
    token, now = generate_session_token(userID, 'customer')
    response = make_response(userID, 200)
    response.set_cookie(
        'session',
        token,
        max_age=AUTH_COOKIE_LIFESPAN,
        domain=current_app.config['DOMAIN'],
        secure=current_app.config['SECURE_AUTH_COOKIES'],
        httponly=True,
        samesite='Strict'
    )
    response.set_cookie(
        'user',
        userID,
        domain=current_app.config['DOMAIN'],
        secure=current_app.config['SECURE_AUTH_COOKIES'],
        httponly=False,
        samesite='Lax'
    )
    response.set_cookie(
        'loggedin',
        now.strftime(TIMESTAMP_FORMAT),
        domain=current_app.config['DOMAIN'],
        secure=current_app.config['SECURE_AUTH_COOKIES'],
        httponly=False,
        samesite='Lax'
    )
    response.set_cookie(
        'acct_type',
        'customer',
        domain=current_app.config['DOMAIN'],
        secure=current_app.config['SECURE_AUTH_COOKIES'],
        httponly=False,
        samesite='Lax'
    )
    return response

@auth.route("/register/business", methods=["POST"])
def register_business():
    if 'email' not in request.form:
        return error("Missing required form parameter 'email'", code=400)
    if 'password' not in request.form:
        return error("Missing required form parameter 'password'", code=400)
    if 'name' not in request.form:
        return error("Missing required form parameter 'name'", code=400)
    if 'location' not in request.form:
        return error("Missing required form parameter 'location'", code=400)
    email_hash = sha256(request.form['email'].encode()).hexdigest()
    with Database.get_db() as db:
        user = db['user']
        results = db.query(
            user.select.where(
                user.c.email_hash == email_hash
            )
        )
    if len(results):
        return error("That email is already in use", code=409)
    userID = get_random_bytes(16).hex()
    with Database.get_db() as db:
        db.insert(
            'user',
            id=userID,
            pw_hash=bcrypt(
                b85encode(sha256(request.form['password'].encode()).digest()), # shorten to 40 bcryptable bytes
                BCRYPT_COST,
                # Use a random salt. We don't need to pick our own
            ),
            email=request.form['email'], # FIXME sanitize
            email_hash=email_hash,
            name=request.form['name'] # FIXME sanitize
        )
        db.insert(
            'business',
            id=userID,
            location=request.form['location'] # FIXME sanitize
        )
    token, now = generate_session_token(userID, 'business')
    response = make_response(userID, 200)
    response.set_cookie(
        'session',
        token,
        max_age=AUTH_COOKIE_LIFESPAN,
        domain=current_app.config['DOMAIN'],
        secure=current_app.config['SECURE_AUTH_COOKIES'],
        httponly=True,
        samesite='Strict'
    )
    response.set_cookie(
        'user',
        userID,
        domain=current_app.config['DOMAIN'],
        secure=current_app.config['SECURE_AUTH_COOKIES'],
        httponly=False,
        samesite='Lax'
    )
    response.set_cookie(
        'loggedin',
        now.strftime(TIMESTAMP_FORMAT),
        domain=current_app.config['DOMAIN'],
        secure=current_app.config['SECURE_AUTH_COOKIES'],
        httponly=False,
        samesite='Lax'
    )
    response.set_cookie(
        'acct_type',
        'business',
        domain=current_app.config['DOMAIN'],
        secure=current_app.config['SECURE_AUTH_COOKIES'],
        httponly=False,
        samesite='Lax'
    )
    return response

@auth.route("/password", methods=["PATCH"])
@authenticated
def update_password(session):
    if 'password' not in request.form:
        return error("Missing required form parameter 'password'", code=400)
    with Database.get_db() as db:
        user = db['user']
        db.execute(
            user.update.where(user.c.id == session['user']).values(
                pw_hash=bcrypt(
                    b85encode(sha256(request.form['password'].encode()).digest()), # shorten to 40 bcryptable bytes
                    BCRYPT_COST,
                    # Use a random salt. We don't need to pick our own
                )
            )
        )
    return make_response('OK', 200)


@auth.route("/me")
@authenticated
def me(session):
    """
    If this method does not return 200, then the current session credentials are not reliable
    """
    return make_response('"{}"'.format(session['user']), 200)

@auth.route('/delete-account', methods=['DELETE'])
@authenticated
def delete_account(session):
    if session['account_type'] == 'customer':
        pass
    else:
        pass
    return make_response(
        "Not Implemented",
        context="Accounts can currently not be deleted",
        code=501
    )

@auth.route("/logout", methods=['POST'])
def logout():
    response = make_response('OK', 200)
    response.set_cookie(
        'session',
        '-',
        max_age=0,
        domain=current_app.config['DOMAIN'],
        secure=current_app.config['SECURE_AUTH_COOKIES'],
        httponly=True,
        samesite='Strict'
    )
    response.set_cookie(
        'user',
        '-',
        max_age=0,
        domain=current_app.config['DOMAIN'],
        secure=current_app.config['SECURE_AUTH_COOKIES'],
        httponly=False,
        samesite='Lax'
    )
    response.set_cookie(
        'loggedin',
        '-',
        max_age=0,
        domain=current_app.config['DOMAIN'],
        secure=current_app.config['SECURE_AUTH_COOKIES'],
        httponly=False,
        samesite='Lax'
    )
    response.set_cookie(
        'acct_type',
        '-',
        max_age=0,
        domain=current_app.config['DOMAIN'],
        secure=current_app.config['SECURE_AUTH_COOKIES'],
        httponly=False,
        samesite='Lax'
    )
    return response

@auth.route('/teapot')
@authenticated
def teapot(session):
    if session['account_type'] != 'teapot':
        return error(
            "Invalid account type",
            context="This view requires a teapot account",
            code=418
        )
