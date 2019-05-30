from pymysql import cursors, connect

def connect_database():
    connection = connect(host='localhost',
                         user='server',
                         password='server',
                         db='CRM',
                         cursorclass=cursors.DictCursor)

    # This is to avoid repeatable read in mysql server
    connection.autocommit(True)

    return connection
def execute_query(query, args, ret_type):

    db_conn = connect_database()

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

def add_new_service(service_name, service_price):
    query = "INSERT INTO services (name, price) VALUES (%s, %s)"
    execute_query(query, (service_name, service_price), 'one')

def add_all_services(services, cost):
    for idx in range(len(services)):
        add_new_service(services[idx], cost[idx])

if __name__ == '__main__':
    services = open('services.txt').readlines()
    services = [x.strip('\n') for x in services]

    cost = open('services_cost.txt').readlines()
    cost = [int(x.strip('\n')) for x in cost]

    add_all_services(services, cost)
