from flask import Blueprint, current_app, request, make_response, send_file
from ..db import Database
from ..utils import error, authenticated
import sqlalchemy as sqla
import qrcode
from io import BytesIO

qr = Blueprint('qr', __name__)

@qr.route('/business/<bus_id>/invoices/<inv_id>/qr', methods=['GET'])
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

    if request.method == 'GET':
        with Database.getdb() as db:
            invoice = db['invoice']
            results = db.query(
                invoice.select.where((invoice.c.bus_id == bus_id) & (invoice.c.user_access_key == inv_id))
            )
            if not len(results):
                return error(
                    "Invoice not found",
                    context="The access key or id provided did not match any open invoices",
                    code=404
                )
            #TODO make sure the link for the QR code is correct
        img = qrcode.make('/business/'+bus_id+'/invoices/'+inv_id)
        img.show()
        bytes_io = BytesIO()
        img.save(bytes_io, 'PNG')
        bytes_io.seek(0)
        return send_file(bytes_io, mimitype='/business/<bus_id>/invoices/<inv_id>/qr/png')
