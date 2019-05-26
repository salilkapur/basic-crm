'''
NOTE: Server only understands UTC. All dates received and sent are assumed UTC
'''

from flask import Flask, request, jsonify,render_template
from flask_cors import CORS
from pymysql import cursors, connect
from datetime import datetime
from pytz import timezone, utc
from queries import Query

app = Flask(__name__)
CORS(app)

query = Query()




def get_utc_date():
    IN = datetime.now(timezone('Asia/Kolkata'))
    IN_UTC = str(IN.replace(hour=0, minute=0, second=0, microsecond=0).astimezone(utc))
    return IN_UTC

@app.after_request
def add_cors(resp):
    """ Ensure all responses have the CORS headers. This ensures any failures are also accessible
        by the client. """
    resp.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin','*')
    resp.headers['Access-Control-Allow-Credentials'] = 'true'
    resp.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS, GET'
    resp.headers['Access-Control-Allow-Headers'] = request.headers.get(
        'Access-Control-Request-Headers', 'Authorization' )
    # set low for debugging
    if app.debug:
        resp.headers['Access-Control-Max-Age'] = '1'
    return resp

@app.route('/')
def root():
    return 'Welcome to CRM'
    # return render_template("../client/main.html")


@app.route('/auth_user', methods=['GET'])
def authenticate_user():

    username = request.args.get('username')
    password = request.args.get('password')

    return query.get_username_pass(username, password)


@app.route('/get_all_services')
def get_all_services():

    return query.get_all_services()

@app.route('/get_all_staff')
def get_all_staff():

    return query.get_all_staff()

@app.route('/get_all_customers')
def get_all_customers():

    return query.get_all_customers()

@app.route('/get_today_customers')
def get_today_customers():

    return query.get_today_customers()

@app.route('/get_today_customer_services')
def get_today_customer_services():

    return query.get_today_customer_services()

@app.route('/get_today_stats')
def get_today_stats():

    return query.get_today_stats()

# This is the entry point for all search queries. It takes
# Key and value as input.
@app.route('/search_customer')
def search_customer():
    result = None

    search_key = request.args.get('key')
    search_value = request.args.get('value')
    # search_value_name = request.args.get('value')

    if search_key == 'phone':
        result = query.search_customer_by_phone(search_value)


    return jsonify(result)

@app.route('/client_search')
def client_search():
    result = None

    location = request.args.get('location')
    search_text = request.args.get('search_text')
    # search_value_name = request.args.get('value')

    if search_text == '' and location == 0:
        result = query.get_all_customers()
    else:
        result = query.get_search_customers(location, search_text)


    return jsonify(result)


@app.route('/add_new_customer', methods=['GET'])
def add_new_customer():
    args = request.args

    gender = None
    if args.get('cst_gender_idx') == '1':
        gender = 'MALE'
    elif args.get('cst_gender_idx') == '2':
        gender = 'FEMALE'

    if args.get('cst_dob') == '':
        dob = None
    else:
        dob = '-'.join(['9999', args.get('cst_dob').split('/')[1], args.get('cst_dob').split('/')[0]])

    if args.get('cst_anniversary') == '':
        anniversary = None
    else:
        anniversary = '-'.join(['9999', args.get('cst_anniversary').split('/')[1], args.get('cst_anniversary').split('/')[0]])

    ret = query.add_new_customer((args.get('cst_name'),args.get('cst_address'),args.get('cst_phone_1'),args.get('cst_phone_2'),dob,anniversary,gender))
    if (ret == None):
        return 'false'
    else:
        return 'true'

@app.route('/edit_customer', methods=['GET'])
def edit_customer():
    args = request.args

    gender = None
    if args.get('cst_gender_idx') == '1':
        gender = 'MALE'
    elif args.get('cst_gender_idx') == '2':
        gender = 'FEMALE'

    if args.get('cst_dob') == '':
        dob = None
    else:
        dob = '-'.join(['9999', args.get('cst_dob').split('/')[1], args.get('cst_dob').split('/')[0]])

    if args.get('cst_anniversary') == '':
        anniversary = None
    else:
        anniversary = '-'.join(['9999', args.get('cst_anniversary').split('/')[1], args.get('cst_anniversary').split('/')[0]])

    ret = query.edit_customer((args.get('cst_name'),args.get('cst_address'),args.get('cst_phone_1'),args.get('cst_phone_2'),dob,anniversary,gender, args['key1'], args['key2']))
    if (ret == None):
        return 'false'
    else:
        return 'true'

@app.route('/get_transaction_user', methods=['GET'])
def get_transaction_user():
    customer_id = request.args.get('cst_id');
    result = query.get_transaction_user(customer_id)

    return result

@app.route('/add_customer_transaction', methods=['GET'])
def add_customer_transaction():
    customer_id = request.args.get('customer_id')
    service_id = request.args.get('service_id')
    staff_id = request.args.get('staff_id')
    location = request.args.get('location')
    query.add_customer_transaction((customer_id, service_id, staff_id, location))

    return jsonify('true')

@app.route('/add_new_service', methods=['GET'])
def add_new_service():
    service_name = request.args.get('service_name');
    service_price = request.args.get('service_price');

    query.add_new_service((service_name, service_price))

    return jsonify('true')

@app.route('/delete_service', methods=['GET'])
def delete_service():
    service_name = request.args.get('service_name');

    query.delete_service((service_name))

    return jsonify('true')


@app.route('/edit_staff_info', methods=['GET'])
def edit_staff_info():
    args = request.args
    
    query.edit_staff_info((args.get('staff_name'),args.get('staff_address'),args.get('staff_phone_1'), args.get('key')), int(args.get('staff_active')))

    return jsonify('true')


@app.route('/add_new_staff', methods=['GET'])
def add_new_staff():
    args = request.args
    
    query.add_new_staff((args.get('staff_name'),args.get('staff_address'),args.get('staff_phone_1'),1))

    return jsonify('true')

def main():
    # Connect to database
    # db_conn = connect_database()
    pass
if __name__ == '__main__':
    main()
