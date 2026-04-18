import psycopg2

DATABASE_URL = "postgresql://postgres:password@localhost:5432/mydb"

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

cur.execute('''
    SELECT tc.input, tc.stdin, tc.expected 
    FROM "TestCase" tc
    JOIN "Problem" p ON p.id = tc."problemId"
    WHERE p.slug = 'two-sum'
    LIMIT 5
''')

rows = cur.fetchall()
for input_, stdin, expected in rows:
    print("INPUT:   ", input_)
    print("STDIN:   ", stdin)
    print("EXPECTED:", expected)
    print("---")

cur.close()
conn.close()