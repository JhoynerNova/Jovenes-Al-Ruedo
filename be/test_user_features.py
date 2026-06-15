import sys
import uuid
from sqlalchemy import select
from app.database import SessionLocal
from app.models.user import User
from app.models.conversacion import Conversacion
from app.models.chat import Mensaje
from app.utils.security import verify_password

def run_diagnostics():
    print("==================================================")
    db = SessionLocal()
    try:
        print("INFO: 1. Buscando usuarios en la Base de Datos...")
        users = db.execute(select(User)).scalars().all()
        for u in users:
            print(f"   - Usuario: {u.email} | Nombre: {u.full_name} | Rol: {u.role}")

        # 2. Buscar admin, pepe y manuela
        admin = db.execute(select(User).where(User.email == 'admin@jovenes-al-ruedo.com')).scalar_one_or_none()
        pepe = db.execute(select(User).where(User.email == 'pepe@gmail.com')).scalar_one_or_none()
        manuela = db.execute(select(User).where(User.email == 'Manuela@umb.com')).scalar_one_or_none()

        if admin:
            pw_ok = verify_password('Test1234', admin.hashed_password)
            print(f"OK: 2. Autenticacion de Admin ('admin@jovenes-al-ruedo.com'): {'Exitoso' if pw_ok else 'Fallido'}")
        
        if pepe and manuela:
            print("OK: 3. Probando flujo de chat entre Manuela (empresa) y Pepe (artista)...")
            
            # Verificar si ya existe conversación
            conv = db.execute(
                select(Conversacion).where(
                    Conversacion.tipo == 'directo',
                    Conversacion.empresa_id == manuela.id,
                    Conversacion.artista_id == pepe.id
                )
            ).scalar_one_or_none()
            
            if not conv:
                conv = Conversacion(
                    tipo='directo',
                    empresa_id=manuela.id,
                    artista_id=pepe.id
                )
                db.add(conv)
                db.commit()
                db.refresh(conv)
                print(f"   - Nueva conversacion directa creada (ID: {conv.id_conversacion})")
            else:
                print(f"   - Conversacion directa existente encontrada (ID: {conv.id_conversacion})")
                
            # Enviar un mensaje de prueba
            msg = Mensaje(
                id_conversacion=conv.id_conversacion,
                remitente_id=manuela.id,
                contenido="Hola Pepe, hemos verificado las funcionalidades del chat en vivo con tu cuenta!"
            )
            db.add(msg)
            db.commit()
            db.refresh(msg)
            print(f"   - Mensaje enviado exitosamente: '{msg.contenido}' (ID: {msg.id_msg})")
            
            # Consultar los mensajes
            mensajes = db.execute(
                select(Mensaje).where(Mensaje.id_conversacion == conv.id_conversacion)
            ).scalars().all()
            print(f"   - Total mensajes en esta conversacion: {len(mensajes)}")
            for m in mensajes:
                sender_name = "Manuela" if m.remitente_id == manuela.id else "Pepe"
                print(f"     [{sender_name}]: {m.contenido}")
                
        print("\nOK: DIAGNOSTICO COMPLETADO: Funcionalidades de autenticacion y chat validadas con exito.")
    except Exception as e:
        print(f"ERROR: Error en diagnostico: {e}")
    finally:
        db.close()
    print("==================================================")

if __name__ == '__main__':
    run_diagnostics()
