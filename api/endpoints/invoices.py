from flask import Blueprint, current_app, request, make_response, send_file
from ..db import Database
from ..utils import error, authenticated
from Crypto.Random import get_random_bytes
from datetime import datetime
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



invoices = Blueprint("invoices", __name__)

@invoices.route('/business/<bus_id>/invoices', methods=['GET', 'POST'])
@authenticated
def list_add_invoice(session, bus_id):
    if session['account_type'] != 'business':
        return error(
            "Invalid account type",
            context="This view requires a buisness account",
            code=400
        )
    if not (bus_id == 'me' or bus_id == session['user']):
        return error(
            "Not Authorized",
            context="You cannot view invoices created by other businesses",
            code=403
        )
    if request.method == 'GET':
        with Database.get_db() as db:
            invoice = db['invoice']
            results = db.query(
                invoice.select.where(invoice.c.bus_id == session['user'])
            )
            return make_response(
                {
                    'invoices': [
                        {
                            'transaction_num': inv['transaction_num'],
                            'transaction_date': inv['transaction_date'],
                            'points': inv['points']
                        }
                        for idx, inv in results.iterrows()
                    ],
                },
                200
            )
    else:
        if not request.is_json:
            return error(
                "POST request not in JSON format",
                code=400
            )
        data = request.get_json()
        if 'transaction_num' not in data:
            return error("Missing required json parameter 'transaction_num'", code=400)
        if 'points' not in data:
            return error("Missing required json parameter 'json'", code=400)
        key = get_random_bytes(8).hex()
        with Database.get_db() as db:
            db.insert(
                'invoice',
                bus_id=session['user'],
                transaction_num=data['transaction_num'], # FIXME sanitize
                transaction_date=datetime.now(),
                user_access_key=key,
                points=data['points'], # FIXME sanitize
            )
            img = qrcode.make("/business/"+bus_id+"/invoices/"+key) # FIXME: Need frontend point
            bytes_io = BytesIO()
            img.save(bytes_io, 'PNG')
            bytes_io.seek(0)
            return send_file(bytes_io, mimetype="image/png", attachment_filename='qr.png')


@invoices.route('/business/<bus_id>/invoices/<inv_id>', methods=['GET', 'PATCH', 'DELETE'])
@authenticated
def view_accept_delete_invoices(session, bus_id, inv_id):
    if request.method == 'GET':
        # If customer: invoice id is the user_access_key
        # If business: invoice id is transaction or access key. bus_id must be invoice owner
        if session['account_type'] == 'customer':
            with Database.get_db() as db:
                invoice = db['invoice']
                results = db.query(
                    invoice.select.where((invoice.c.bus_id == bus_id) & (invoice.c.user_access_key == inv_id))
                )
        else:
            if not (bus_id == 'me' or bus_id == session['user']):
                return error(
                    "Not Authorized",
                    context="You cannot view invoices created by other businesses",
                    code=403
                )
            with Database.get_db() as db:
                invoice = db['invoice']
                results = db.query(
                    invoice.select.where((invoice.c.bus_id == session['user']) & (invoice.c.transaction_num == inv_id))
                )
        if not len(results):
            return error(
                "Invoice not found",
                context="The access key or id provided did not match any open invoices",
                code=404
            )
        return make_response(
            {
                'transaction_num': int(results['transaction_num'][0]),
                'transaction_date': results['transaction_date'][0],
                'user_access_key': inv_id,
                'points': int(results['points'][0]),
            },
            200
        )
    elif request.method == 'PATCH':
        # Must be customer
        if session['account_type'] != 'customer':
            return error(
                "Invalid account type",
                context="This action requires a customer account",
                code=400
            )
        # id must be access key
        with Database.get_db() as db:
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
            # claim points, then delete
            with db.session.begin():
                shops_at = db['shops_at']
                c_data = db.query(
                    shops_at.select.where(
                        (shops_at.c.cust_id == session['user']) & (shops_at.c.bus_id == bus_id)
                    )
                )
                if not len(c_data):
                    db.insert(
                        'shops_at',
                        bus_id=bus_id,
                        cust_id=session['user'],
                        points=results['points'][0]
                    )
                else:
                    db.execute(
                        shops_at.update.where(
                            (shops_at.c.cust_id == session['user']) & (shops_at.c.bus_id == bus_id)
                        ).values(
                            points=c_data['points'][0] + results['points'][0]
                        )
                    )
                db.execute(
                    invoice.delete.where((invoice.c.bus_id == bus_id) & (invoice.c.user_access_key == inv_id))
                )
            return make_response('OK', 200)
    else:
        # Must be business
        # must be owner
        if session['account_type'] != 'business':
            return error(
                "Invalid account type",
                context="This view requires a buisness account",
                code=400
            )
        if not (bus_id == 'me' or bus_id == session['user']):
            return error(
                "Not Authorized",
                context="You cannot view invoices created by other businesses",
                code=403
            )
        # must be transaction number
        # delete invoice
        with Database.get_db() as db:
            invoice = db['invoice']
            db.execute(
                invoice.delete.where(
                    (invoice.c.bus_id == session['user']) & (invoice.c.transaction_num == inv_id)
                )
            )
        return make_response('OK', 200)
