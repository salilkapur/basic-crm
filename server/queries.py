
from pymysql import cursors, connect
from datetime import datetime
from pytz import timezone, utc
from flask import Flask, request, jsonify,render_template,make_response
import numpy as np

def min_edit(seq1, seq2):
    size_x = len(seq1) + 1
    size_y = len(seq2) + 1
    matrix = np.zeros ((size_x, size_y))
    for x in range(size_x):
        matrix [x, 0] = x
    for y in range(size_y):
        matrix [0, y] = y

    for x in range(1, size_x):
        for y in range(1, size_y):
            if seq1[x-1] == seq2[y-1]:
                matrix [x,y] = min(
                    matrix[x-1, y] + 1,
                    matrix[x-1, y-1],
                    matrix[x, y-1] + 1
                )
            else:
                matrix [x,y] = min(
                    matrix[x-1,y] + 1,
                    matrix[x-1,y-1] + 1,
                    matrix[x,y-1] + 1
                )
    return (matrix[size_x - 1, size_y - 1])

def get_utc_date():
    IN = datetime.now(timezone('Asia/Kolkata'))
    IN_UTC = str(IN.replace(hour=0, minute=0, second=0, microsecond=0).astimezone(utc))
    return IN_UTC

class Query:
	def __init__(self):
		pass



	def connect_database(self):
		connection = connect(host='localhost',
							 user='server',
							 password='server',
							 db='CRM',
							 cursorclass=cursors.DictCursor)

		# This is to avoid repeatable read in mysql server
		connection.autocommit(True)

		return connection

	def execute_query(self,query, args, ret_type):
		db_conn = self.connect_database()

		with db_conn.cursor() as cursor:
			cursor.execute(query, args)
			if ret_type == 'all':
				result = cursor.fetchall()
			elif ret_type == 'one':
				result = cursor.fetchone()
			else:
				result = cursor.fetchall()
			cursor.close()

		db_conn.close()

		return result

	def get_all_users(self):
		query = "SELECT * FROM users"
		result = self.execute_query(query, (), 'all')

		out = {}
		for user in result:
			temp = {}
			temp['password'] = user['password']
			temp['is_admin'] = user['is_admin']
			out[user['username']] = temp

		return out
	
	def get_username_pass(self, username, password):
		query = "SELECT * FROM users WHERE username=%s AND password=%s"
		result = self.execute_query(query, (username, password), 'one')

		if result is not None and result['is_active'] == 1:
			return jsonify(result)
		else:
			return jsonify("false")

	def get_all_services(self):
		query = "SELECT * FROM services ORDER BY name"
		result = self.execute_query(query, (), 'all')
		return jsonify(result)

	def get_all_staff(self):
		query = "SELECT staff_id, name, address, phone_1, joined_on, CAST(is_active AS UNSIGNED) as is_active FROM staff ORDER BY name"
		result = self.execute_query(query, (), 'all')

		return jsonify(result)

	def get_transaction_user(self, customer_id):
		# query = "SELECT DISTINCT txn.transaction_id, txn.staff_id, customer_id, service_id, location FROM transactions AS txn INNER JOIN customers AS cst ON cst.customer_id = txn.customer_id WHERE cst.customer_id=%s";
		query = "SELECT txn.transaction_id as transaction_id, txn.staff_id, txn.customer_id, txn.service_id, txn.location as location, txn.txn_time as txn_time, srv.name as srv_name, srv.price as srv_price, st.name as staff_name From transactions txn, customers cst, services srv, staff st WHERE txn.customer_id = cst.customer_id AND txn.service_id = srv.service_id AND txn.staff_id = st.staff_id AND cst.customer_id = %s ORDER BY txn.txn_time DESC "
		result = self.execute_query(query, (customer_id), 'all')

		return jsonify(result)

	def get_all_customers(self):
		query = "SELECT customer_id, name, address, phone_1, phone_2, CAST(dob as char) as dob, IF(anniversary IS NULL, '', CAST(anniversary as char)) as anniversary, gender FROM customers ORDER BY name"
		result = self.execute_query(query, (), 'all')


		return jsonify(result)

	def get_customer_bylocation(self, location):
		query = "SELECT cst.customer_id as customer_id FROM customers cst, transactions txn WHERE cst.customer_id = txn.customer_id AND txn.location = %s"
		result = self.execute_query(query, (location), 'all')

		return result

	def get_search_customers(self, location, txt):
		query = "SELECT customer_id, name, address, phone_1, phone_2, CAST(dob as char) as dob, IF(anniversary IS NULL, '', CAST(anniversary as char)) as anniversary, gender FROM customers ORDER BY name"
		result = self.execute_query(query, (), 'all')
		result2 = result[:]
		out  = [-1 for i in range(len(result2))]
		for  i in range(len(result2)):
			out[i] = min_edit(result2[i]['name'].lower(), txt.lower())
		out = np.array(out)
		out_arr = np.argsort(out)
		out_result = []
		location_res = self.get_customer_bylocation(location)
		location_res = [i['customer_id'] for i in location_res]
		if (len(location_res) == 0):
			for i in out_arr:
				out_result.append(result[i])
		else:
			for i in out_arr:
				if result[i]['customer_id'] in location_res:
					out_result.append(result[i])

		return out_result

	def get_today_customers(self):
		query = "SELECT DISTINCT cst.customer_id as customer_id, cst.name as name, cst.address as address, cst.phone_1 as phone_1, cst.phone_2 as phone_2, CAST(cst.dob as char) as dob, IF(cst.anniversary IS NULL, '', CAST(cst.anniversary as char)) as anniversary, cst.gender as gender FROM transactions AS txn INNER JOIN customers AS cst ON cst.customer_id = txn.customer_id WHERE DATE(txn_time)=UTC_DATE";
		result = self.execute_query(query, (), 'all')

		return jsonify(result)

	def get_today_customer_services(self):
		customer_id = request.args.get('customer_id');
		query = "SELECT DISTINCT svc.name FROM transactions AS txn INNER JOIN customers AS cst ON cst.customer_id = txn.customer_id INNER JOIN services AS svc ON svc.service_id = txn.service_id WHERE txn.txn_time=%s AND cst.customer_id = %s";
		result = self.execute_query(query, (get_utc_date(), customer_id), 'all')

		return jsonify(result)

	def get_today_stats(self):
		final_result = {}
		query = "SELECT COUNT(DISTINCT customer_id) as customers from transactions WHERE DATE(txn_time)=UTC_DATE"
		result = self.execute_query(query, (), 'all')
		final_result['customers'] = result[0]['customers']

		query = "SELECT COUNT(*) AS total_customers FROM customers WHERE DATE(created_on)=UTC_DATE"
		result = self.execute_query(query, (), 'all')
		final_result['new_customers'] = result[0]['total_customers']

		query = "SELECT COUNT(*) AS total_txn FROM transactions WHERE DATE(txn_time)=UTC_DATE"
		result = self.execute_query(query, (), 'all')
		final_result['txn'] = result[0]['total_txn']

		return jsonify(final_result)

	def search_customer_by_phone(self, search_value):
		query = "SELECT customer_id, name, address, phone_1, phone_2, CAST(dob as char) as dob, IF(anniversary IS NULL, '', CAST(anniversary as char)) as anniversary, gender from customers WHERE (phone_1=%s AND phone_1!='') OR (phone_2=%s AND phone_2!='')"
		result = self.execute_query(query, (search_value, search_value), 'one')

		return result

	def search_customer_by_name(self, search_value):
		query = "SELECT customer_id, name, address, phone_1, phone_2, CAST(dob as char) as dob, IF(anniversary IS NULL, '', CAST(anniversary as char)) as anniversary, gender from customers WHERE name=%s"
		result = self.execute_query(query, (search_value), 'all')

		return result

	def add_new_customer(self, arg):
		query = "SELECT customer_id from customers WHERE (phone_1=%s AND phone_1!='') OR (phone_2=%s AND phone_2!='')"
		result = self.execute_query(query, (arg[2], arg[3]), 'one')
		if (result == None):
			query = "INSERT INTO customers (name, address, phone_1, phone_2, dob, anniversary, gender, created_on) VALUES (%s, %s, %s, %s, %s, %s, %s, UTC_TIMESTAMP)"
			self.execute_query(query, arg, 'one')

			return "yes"
		else:

			return None

	def edit_customer(self, arg):
		query = "SELECT customer_id from customers WHERE (phone_1=%s AND phone_1!='') OR (phone_2=%s AND phone_2!='')"
		result1 = self.execute_query(query, (arg[2], arg[3]), 'one')
		result2 = self.execute_query(query, (arg[-2], arg[-1]), 'one')
		print(arg[-2], arg[-1])
		print(result2)
		if (result1 == None or result1['customer_id'] == result2['customer_id']):
			query = "UPDATE customers SET name = %s, address = %s, phone_1 = %s, phone_2 = %s, dob = %s, anniversary = %s, gender = %s WHERE (phone_1=%s AND phone_1!='') OR (phone_2=%s AND phone_2!='')"
			self.execute_query(query, arg, 'one')

			return "yes"
		else:

			return None

	def add_customer_transaction(self, arg):
		query = "INSERT INTO transactions (customer_id, service_id, staff_id, location, txn_time) VALUES (%s, %s, %s, %s, UTC_TIMESTAMP)"
		self.execute_query(query, arg, 'one')

	def add_new_service(self, arg):
		query = "INSERT INTO services (name, price) VALUES (%s, %s)"
		self.execute_query(query, arg, 'one')

	def delete_service(self, arg):
		query = "DELETE FROM services WHERE name=%s"
		self.execute_query(query, arg, 'one')

	def add_new_staff(self, arg):
		query = "INSERT INTO staff (name, address, phone_1, joined_on, is_active) VALUES (%s, %s, %s, UTC_TIMESTAMP, %s)"
		self.execute_query(query, arg, 'one')

	def edit_staff_info(self, arg, is_active):
		if (is_active == 1):
			query = "UPDATE staff SET name = %s, address = %s, phone_1 = %s, is_active = b'1' WHERE (phone_1=%s AND phone_1!='')"
		elif (is_active == 0):
			query = "UPDATE staff SET name = %s, address = %s, phone_1 = %s, is_active = b'0' WHERE (phone_1=%s AND phone_1!='')"
		self.execute_query(query, arg, 'one')

	def get_transaction_staff(self, arg):
		query = "SELECT txn.transaction_id as transaction_id, txn.staff_id, txn.customer_id, txn.service_id, txn.location as location, txn.txn_time as txn_time, srv.name as srv_name, srv.price as srv_price, st.name as staff_name, cst.name as cust_name From transactions txn, customers cst, services srv, staff st WHERE txn.customer_id = cst.customer_id AND txn.service_id = srv.service_id AND txn.staff_id = st.staff_id AND st.staff_id = %s ORDER BY txn.txn_time DESC "
		result = self.execute_query(query, (arg), 'all')

		return result


