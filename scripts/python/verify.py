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
    
    # verify.py - add this query
cur.execute('''
    SELECT slug, "entryPoint", "pythonPrompt" 
    FROM "Problem" 
    WHERE slug = 'two-sum'
''')

row = cur.fetchone()
print("SLUG:", row[0])
print("ENTRY POINT:", row[1])
print("PYTHON PROMPT (first 200 chars):", row[2][:200] if row[2] else None)

cur.close()
conn.close()