from flask import Blueprint, make_response


internal = Blueprint('internal', __name__)

@internal.route("/marco")
def polo():
    return make_response("Polo", 200)
