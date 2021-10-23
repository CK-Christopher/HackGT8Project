from flask import Blueprint, make_response, current_app
from ..db import Database
from ..utils import error, TIMESTAMP_FORMAT
from hashlib import sha256
from Crypto.Protocol.KDF import bcrypt_check
from Crypto.Random import get_random_bytes
from datetime import datetime
from base64 import b85encode
import jwt

auth = Blueprint('auth', __name__, url_prefix='/auth')

AUTH_COOKIE_LIFESPAN = 604800 # 1 week

def generate_session_token(user_id, account_type):
    now
    with open(current_app.config['RSA_KEY']) as r:
        return jwt.encode(
            {
                'user': user_id,
                'account_type': account_type,
                'issued': now.strftime(TIMESTAMP_FORMAT),
                'session_id': get_random_bytes(4).hex()
            },
            r.read(),
            algorithm="RS256"
        ), now

@auth.route('/test')
def test():
    return generate_session_token('hello', 'blorp')

@auth.route("/login")
def login():
    """
    Checks for email & password in formdata
    """
    if 'email' not in request.form:
        return utils.error("Missing required form parameter 'email'", code=400)
    if 'password' not in request.form:
        return utils.error("Missing required form parameter 'password'", code=400)
    email_hash = hashlib.sha256(request.form['email'].encode()).hexdigest()
    with Database.get_db() as db:
        user = db['user']
        results = db.query(
            user.select.where(
                user.c.email_hash == email_hash
            )
        )
    if not len(results):
        return utils.error("No user found with that email/password combination", code=404)
    assert len(results) == 1, "Email hash collision!"
    print(request.form)
    try:
        bcrypt_check(
            b85encode(hashlib.sha256(request.form['password'].encode()).digest()), # shorten to 40 bcryptable bytes
            results['pw_hash'][0]
        )
    except ValueError:
        return utils.error("No user found with that email/password combination", code=404)
    with Database.get_db() as db:
        customer = db['customer']
        results = db.query(
            customer.select.where(customer.c.id == results['id'][0])
        )
    token, now = generate_session_token(results['id'][0], 'customer' if len(results) else 'business')
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
        'customer' if len(results) else 'business',
        domain=current_app.config['DOMAIN'],
        secure=current_app.config['SECURE_AUTH_COOKIES'],
        httponly=False,
        samesite='Lax'
    )
