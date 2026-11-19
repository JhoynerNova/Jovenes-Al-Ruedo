import psycopg2

DATABASE_URL = "postgresql://jar_user:jar_password@localhost:5433/jovenes_al_ruedo"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

cur.execute("SELECT id_conversacion, tipo, empresa_id, artista_id FROM conversacion")
rows = cur.fetchall()
print("Conversaciones:", rows)

cur.execute("SELECT id_msg, id_conversacion, remitente_id, contenido FROM mensaje")
msgs = cur.fetchall()
print("Mensajes:", msgs)

cur.close()
conn.close()
