import psycopg2

DATABASE_URL = "postgresql://postgres:password@localhost:5432/mydb"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

for lang in ["TYPESCRIPT", "RUST", "JAVASCRIPT", "C"]:
    print(f"\n====== {lang} failures ======")
    cur.execute('''
        SELECT p.slug, cs.template
        FROM "CodeSnippet" cs
        JOIN "Problem" p ON p.id = cs."problemId"
        WHERE cs.language = %s AND cs."entryPoint" IS NULL
        LIMIT 3
    ''', (lang,))
    for slug, template in cur.fetchall():
        print(f"\n--- {slug} ---")
        print(template[:300])

cur.close()
conn.close()