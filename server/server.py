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


@app.route('/get_all_services', methods=['GET'])
def get_all_services():

    query = "SELECT * FROM services ORDER BY name"
    result = execute_query(query, (), 'all')
    return jsonify(result)

@app.route('/get_all_staff', methods=['GET'])
def get_all_staff():

    query = "SELECT * FROM staff ORDER BY name"
    result = execute_query(query, (), 'all')

    return jsonify(result)

# This is the entry point for all search queries. It takes
# Key and value as input.
@app.route('/search_customer', methods=['GET'])
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

def main():
    global db_conn
    # Connect to database
    db_conn = connect_database()

if __name__ == '__main__':
    main()
