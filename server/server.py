'''
NOTE: Server only understands UTC. All dates received and sent are assumed UTC
'''

from flask import Flask, request, jsonify
from flask_cors import CORS
from pymysql import cursors, connect

app = Flask(__name__)
CORS(app)

db_conn = None # For connection to sql database

def connect_database():
    connection = connect(host='localhost',
                         user='salil',
                         password='s',
                         db='CRM',
                         cursorclass=cursors.DictCursor)

    # This is to avoid repeatable read in mysql server
    connection.autocommit(True)

    return connection

def execute_query(query, args, ret_type):
    global db_conn

    if db_conn is None:
        db_conn = connect_database()

    with db_conn.cursor() as cursor:
        cursor.execute(query, args)
        if ret_type == 'all':
            result = cursor.fetchall()
        elif ret_type == 'one':
            result = cursor.fetchone()
        else:
            result = cursor.fetchall()

    return result

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


@app.route('/auth_user', methods=['GET'])
def authenticate_user():

    username = request.args.get('username')
    password = request.args.get('password')
    
    query = "SELECT * FROM users WHERE username=%s AND password=%s"
    result = execute_query(query, (username, password), 'one')

    if result is not None and result['is_active'] == 1:
        return jsonify(result)
    else:
        return jsonify("false")


@app.route('/get_all_services')
def get_all_services():

    query = "SELECT * FROM services ORDER BY name"
    result = execute_query(query, (), 'all')
    return jsonify(result)

@app.route('/get_all_staff')
def get_all_staff():

    query = "SELECT * FROM staff ORDER BY name"
    result = execute_query(query, (), 'all')

    return jsonify(result)

@app.route('/get_all_customers')
def get_all_customers():

    query = "SELECT name, phone_1, phone_2 FROM customers ORDER BY name"
    result = execute_query(query, (), 'all')

    return jsonify(result)

# This is the entry point for all search queries. It takes
# Key and value as input.
@app.route('/search_customer')
def search_customer():
    result = None
    
    search_key = request.args.get('key')
    search_value = request.args.get('value')
    
    if search_key == 'phone':
        result = search_customer_by_phone(search_value)
    
    return jsonify(result)

def search_customer_by_phone(search_value):
    
    query = "SELECT customer_id, name, address, phone_1, phone_2, CAST(dob as char) as dob, IF(anniversary IS NULL, '', CAST(anniversary as char)) as anniversary, gender from customers WHERE phone_1=%s OR phone_2=%s"
    result = execute_query(query, (search_value, search_value), 'one')

    return result

@app.route('/add_new_customer', methods=['GET'])
def add_new_customer():
    args = request.args
    query = "INSERT INTO customers (name, address, phone_1, phone_2, dob, anniversary, gender) VALUES (%s, %s, %s, %s, %s, %s, %s)"
    
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

    execute_query(query, (args.get('cst_name'),
                          args.get('cst_address'),
                          args.get('cst_phone_1'),
                          args.get('cst_phone_2'),
                          dob,
                          anniversary,
                          gender)
                      , 'one')

    return jsonify('true')
    
@app.route('/add_customer_transaction', methods=['GET'])
def add_customer_transaction():
    customer_id = request.args.get('customer_id')
    service_id = request.args.get('service_id')
    staff_id = request.args.get('staff_id')
    location = request.args.get('location')

    query = "INSERT INTO transactions (customer_id, service_id, staff_id, location, txn_time) VALUES (%s, %s, %s, %s, UTC_TIMESTAMP)"
    execute_query(query, (customer_id, service_id, staff_id, location), 'one')

    return jsonify('true')

@app.route('/add_new_service', methods=['GET'])
def add_new_service():
    service_name = request.args.get('service_name');
    service_price = request.args.get('service_price');
    
    query = "INSERT INTO services (name, price) VALUES (%s, %s)"
    execute_query(query, (service_name, service_price), 'one')

    return jsonify('true')

def main():
    global db_conn
    # Connect to database
    db_conn = connect_database()

if __name__ == '__main__':
    main()
