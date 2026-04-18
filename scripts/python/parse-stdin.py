import ast
import re
import psycopg2
import os

DATABASE_URL = "postgresql://postgres:password@localhost:5432/mydb"

def parse_input_to_stdin(input_str: str) -> str:
    try:
        cleaned = input_str.replace("null", "None").replace("true", "True").replace("false", "False")
        dict_str = re.sub(r'(\w+)\s*=\s*', r'"\1": ', cleaned)
        dict_str = "{" + dict_str + "}"
        parsed = ast.literal_eval(dict_str)
        lines = [str(v) for v in parsed.values()]
        return "\n".join(lines)
    except:
        # fallback: just extract quoted strings or bare values
        # handles: equation = "5x+2=3x+1" or bare: depth
        parts = re.findall(r'"([^"]*)"|([\w\.\-]+)$', input_str)
        values = [m[0] or m[1] for m in parts if m[0] or m[1]]
        if values:
            return "\n".join(values)
        return input_str  # last resort, store as-is


def main():
    print("Connecting to DB...")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    print("Fetching test cases without stdin...")
    cur.execute('SELECT id, input FROM "TestCase" WHERE stdin IS NULL')
    rows = cur.fetchall()
    print(f"Found {len(rows)} test cases to process")

    updated = 0
    failed = 0

    for i, (tc_id, input_str) in enumerate(rows):
        stdin = parse_input_to_stdin(input_str)

        if stdin is None:
            failed += 1
            continue

        cur.execute(
            'UPDATE "TestCase" SET stdin = %s WHERE id = %s',
            (stdin, tc_id)
        )
        updated += 1

        if i % 1000 == 0:
            conn.commit()
            print(f"  Progress: {i}/{len(rows)}")

    conn.commit()
    cur.close()
    conn.close()

    print(f"\nDone! Updated {updated}, failed {failed}")


if __name__ == "__main__":
    main()