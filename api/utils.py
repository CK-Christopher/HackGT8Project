from flask import make_response

TIMESTAMP_FORMAT = "%Y-%m-%d %H:%M:%S"

def error(message, *, data=None, context=None, code=400):
    # Maybe log

    err = {'message': message, 'code': code}
    if data is not None:
        err['data'] = data

    if context is not None:
        err['context'] = data

    return make_response(err, code)
