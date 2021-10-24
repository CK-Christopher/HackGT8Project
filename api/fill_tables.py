from .db import Database


def fill_tables():
    with Database.get_db() as db:
        # Add users
        for i in range(10):
            #db.insert('user', id='id' + str(i) + '0' * 29, pw_hash='pwhash',
            #          email='email', email_hash=str(i) + ' email_hash', name='text')
            db.insert('customer', id='id' + str(i) + '0' * 29)

