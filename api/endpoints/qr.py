from flask import Blueprint, current_app, request, make_response
from ..db import Database
from ..utils import error, authenticated
import sqlalchemy as sqla
import json

qr = Blueprint("qr", __name__)

@qr.route('/business/<bus_id>/invoices/<inv_id>/qr, methods=["GET", "POST"])
@authenticated
def getQRcode(session, bus_id, inv_id):
    if session['account_type'] != 'business':
        return error(
            "Invalid account type",
            context="This view requires a buisness account",
            code=400
        )

    if not (bus_id == 'me' or bus_id == session['user']):
        return error(
            "Not Authorized",
            context="You cannot access the QR codes of invoices created by other businesses",
            code=403
        )

    if request.method == 'POST':
        

