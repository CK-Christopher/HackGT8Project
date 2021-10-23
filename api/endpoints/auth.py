from flask import Blueprint, make_response, current_app, request
from ..db import Database
from ..utils import error, TIMESTAMP_FORMAT, authenticated, check_csrf
from hashlib import sha256
from Crypto.Protocol.KDF import bcrypt, bcrypt_check
from Crypto.Random import get_random_bytes
from datetime import datetime, timedelta
from base64 import b85encode
import jwt

auth = Blueprint('auth', __name__, url_prefix='/auth')

AUTH_COOKIE_LIFESPAN = 604800 # 1 week
CSRF_LIFESPAN = 3600 # 1 hour
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

@auth.route('/csrf', methods=['POST'])
@authenticated
def issue_csrf(session):
    """
    Issues a single use CSRF token
    """
    if not request.is_json:
        return error(
            "POST request not in JSON format",
            code=400
        )
    data = request.get_json()
    if 'endpoint' not in data:
        return error('Missing required JSON parameter "endpoint"', code=400)
    if len(data['endpoint']) > 255:
        return error("Endpoint too long", context="The endpoint parameter may only be 255 characters", code=400)
    token = get_random_bytes(8).hex()
    expires = datetime.now() + timedelta(seconds=CSRF_LIFESPAN)
    with Database.get_db() as db:
        csrf = db['csrf']
        db.execute(
            csrf.delete.where(
                (csrf.c.expires < datetime.now())
            )
        )
        db.insert(
            'csrf',
            id=session['user'],
            token=token,
            endpoint=data['endpoint'],
            ip=request.remote_addr,
            expires=expires
        )
    response = make_response('OK', 200)
    response.set_cookie(
        'csrf',
        token,
        max_age=CSRF_LIFESPAN,
        domain=current_app.config['DOMAIN'],
        secure=current_app.config['SECURE_AUTH_COOKIES'],
        httponly=True,
        samesite='Strict'
    )
    return response

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
    return make_response(userID, 200)

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
    return make_response(userID, 200)

@auth.route("/password", methods=["PATCH"])
@authenticated
@check_csrf('/auth/password')
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
    return make_response('"{}"'.format(session['user']), 200)

@auth.route('/delete-account', methods=['DELETE'])
@authenticated
@check_csrf('/auth/delete-account')
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
