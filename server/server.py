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

    return connection

@app.route('/')
def root():
    return 'Welcome to CRM'

@app.route('/auth_user', methods=['GET'])
def authenticate_user():
    global db_conn

    username = request.args.get('username')
    password = request.args.get('password')
    
    if db_conn is None:
        db_conn = connect_database()

    with db_conn.cursor() as cursor:
        query = "SELECT * FROM users WHERE username=%s AND password=%s"
        cursor.execute(query, (username, password))
        result = cursor.fetchone()

        if result is not None and result['is_active'] == 1:
            return jsonify(result)
        else:
            return jsonify("false")

def main():
    global db_conn
    # Connect to database
    db_conn = connect_database()

if __name__ == '__main__':
    main()
