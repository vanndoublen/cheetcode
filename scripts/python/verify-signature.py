import psycopg2

DATABASE_URL = "postgresql://postgres:password@localhost:5432/mydb"

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

cur.execute('''
    SELECT p.slug, cs.template
    FROM "Problem" p
    JOIN "CodeSnippet" cs ON cs."problemId" = p.id AND cs.language = 'PYTHON3'
    WHERE p."inputSignature" LIKE '%unknown%' OR p."inputSignature" = ''
    LIMIT 10
''')

rows = cur.fetchall()
for slug, template in rows:
    print("SLUG:    ", slug)
    print("TEMPLATE:")
    print(template)
    print("---")

cur.close()
conn.close()