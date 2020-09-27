import pymysql.cursors
from faker import Faker
import time


COUNT_ITEMS = 1_000_000
fake = Faker()
connection = pymysql.connect(host='localhost',
                             user='root',
                             password='root',
                             db='social_network',
                             charset='utf8mb4',
                             cursorclass=pymysql.cursors.DictCursor)


with connection.cursor() as cursor:
    for i in range(COUNT_ITEMS):
        name = fake.name().split(' ')
        time.sleep(0.000000001)
        login = str(time.time_ns())
        insert = """insert into users(login, password, firstName, lastName, birthDay) value('{0}', '{1}', '{2}',
        '{3}', '{4}')""".format(
            login,
            '$2a$10$qV7OVRQ1mud2hncbyzteO.OMlYwgyXTSOn7Y.RbgITXtL5xsOyOAi',
            name[0],
            name[1],
            '1988-01-01'
        )
        cursor.execute(insert)
        if i % 100:
            connection.commit()

connection.commit()
connection.close()
