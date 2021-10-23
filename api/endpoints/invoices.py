from flask import Blueprint, current_app, request, make_response
from ..db import Database
from ..utils import error, authenticated
from Crypto.Random import get_random_bytes
from datetime import datetime
import sqlalchemy as sqla

invoices = Blueprint("invoices", __name__)

@invoices.route('/business/<bus_id>/invoices', methods=['GET', 'INSERT'])
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
        with Databases.get_db() as db:
            invoice = db['invoice']
            results = db.query(
                invoice.select.where(invoice.c.bus_id == session['user'])
            )
            return make_response(
                [
                    {
                        'transaction_num': inv['transaction_num'],
                        'transaction_date': inv['transaction_date'],
                        'points': inv['points']
                    }
                    for idx, inv in results.iterrows()
                ],
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
            return make_response('OK', 200)


@invoices.route('/businesses/<bus_id>/invoices/<inv_id>', methods=['GET', 'PATCH', 'DELETE'])
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
                'transaction_num': results['transaction_num'][0],
                'transaction_date': results['transaction_date'][0],
                'user_access_key': inv_id,
                'points': results['points'][0],
            },
            200
        )
    elif request.method == 'PATCH':
        # Must be customer
        # id must be access key
        # claim points, then delete
        pass
    else:
        # Must be business
        # must be owner
        # must be transaction number
        # delete invoice
        pass
