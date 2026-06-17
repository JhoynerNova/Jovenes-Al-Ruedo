import sys
import os
import uuid
from datetime import datetime, date

# Add the current directory to python path
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models import User, Habilidad, RelUsrHab, Portafolio, DetPortafolio, Conv, DetConv, Inscripcion, Conversacion, Mensaje
from app.models.password_reset_token import PasswordResetToken

from app.utils.security import hash_password

# Contraseña para las cuentas de demo
PASSWORD_HASH = hash_password("Test1234")



print("--- INICIANDO SEMBRADO DE BASE DE DATOS WEB ---")

try:
    with SessionLocal() as db:
        # 1. Limpieza de tablas existentes en orden de restricciones
        print("1. Limpiando tablas existentes...")
        db.query(Mensaje).delete()
        db.query(Conversacion).delete()
        db.query(Inscripcion).delete()
        db.query(DetConv).delete()
        db.query(Conv).delete()
        db.query(DetPortafolio).delete()
        db.query(Portafolio).delete()
        db.query(RelUsrHab).delete()
        db.query(Habilidad).delete()
        db.query(PasswordResetToken).delete()
        db.query(User).delete()
        db.commit()
        print("   ¡Tablas limpiadas exitosamente!")

        # 2. Catálogo de Habilidades
        print("2. Insertando habilidades artísticas...")
        habilidades_list = [
            "Actuación teatral", "Canto lírico", "Canto popular", "Pintura al óleo", "Pintura acuarela",
            "Danza contemporánea", "Danza folclórica", "Guitarra clásica", "Guitarra eléctrica",
            "Fotografía artística", "Fotografía de moda", "Escritura creativa", "Guionismo",
            "Edición de video", "Dirección de cine", "Diseño gráfico", "Ilustración digital",
            "Percusión", "Piano", "Escultura"
        ]
        
        hab_objs = {}
        for h_name in habilidades_list:
            h = Habilidad(nombre=h_name)
            db.add(h)
            db.flush()
            hab_objs[h_name] = h
        db.commit()
        print(f"   ¡{len(habilidades_list)} habilidades insertadas!")

        # 3. Usuarios de prueba
        print("3. Insertando usuarios de prueba...")
        users_data = [
            # Administradores
            {
                "id": uuid.UUID("a1b2c3d4-0003-0003-0003-000000000003"),
                "email": "admin@ejemplo.com",
                "full_name": "Administrador Principal",
                "role": "admin",
                "hashed_password": PASSWORD_HASH,
                "is_active": True
            },
            {
                "id": uuid.UUID("a1b2c3d4-9999-9999-9999-999999999999"),
                "email": "admin@jovenes-al-ruedo.com",
                "full_name": "Administrador del Sistema",
                "role": "admin",
                "hashed_password": PASSWORD_HASH,
                "is_active": True
            },
            # Empresas
            {
                "id": uuid.UUID("a1b2c3d4-0002-0002-0002-000000000002"),
                "email": "empresa@ejemplo.com",
                "full_name": "Estudio Creativo 360",
                "sector": "Diseño y Publicidad",
                "bio": "Agencia creativa líder en diseño de marca y producción audiovisual para el sector cultural.",
                "location": "Chapinero, Bogotá",
                "role": "empresa",
                "hashed_password": PASSWORD_HASH,
                "is_active": True
            },
            {
                "id": uuid.UUID("2c71805d-e128-48ad-afc9-dec144481993"),
                "email": "Manuela@umb.com",
                "full_name": "umb S.A",
                "sector": "Educación y Cultura",
                "bio": "Institución de educación superior enfocada en fomentar proyectos de inclusión social y artística.",
                "location": "Usaquén, Bogotá",
                "role": "empresa",
                "hashed_password": PASSWORD_HASH,
                "is_active": True
            },
            # Artistas
            {
                "id": uuid.UUID("a1b2c3d4-0001-0001-0001-000000000001"),
                "email": "artista@ejemplo.com",
                "full_name": "Jhoyner Nova",
                "birth_date": date(2000, 5, 15),
                "artistic_area": "Diseño",
                "bio": "Artista visual apasionado por la ilustración digital, el branding y el arte callejero contemporáneo.",
                "location": "Bogotá, Colombia",
                "role": "artista",
                "hashed_password": PASSWORD_HASH,
                "is_active": True
            },
            {
                "id": uuid.UUID("2cb91d16-675d-4a5e-8e69-a0403dded865"),
                "email": "pepe@gmail.com",
                "full_name": "Pepe Lobo",
                "birth_date": date(2000, 3, 4),
                "artistic_area": "Música",
                "bio": "Guitarrista de sesión profesional y productor de pistas de jazz y rock progresivo en formato indie.",
                "location": "Cali, Colombia",
                "role": "artista",
                "hashed_password": PASSWORD_HASH,
                "is_active": True
            },
            {
                "id": uuid.UUID("fdef584f-df8a-4459-8f9d-2a2cc7843081"),
                "email": "franky@gmail.com",
                "full_name": "Franky Almario",
                "birth_date": date(1998, 4, 12),
                "artistic_area": "Teatro",
                "bio": "Actor de teatro clásico y contemporáneo con interés particular en doblaje, locución y radioteatro.",
                "location": "Medellín, Colombia",
                "role": "artista",
                "hashed_password": PASSWORD_HASH,
                "is_active": True
            },
            {
                "id": uuid.UUID("a1b2c3d4-0004-0004-0004-000000000004"),
                "email": "sofia.reyes@gmail.com",
                "full_name": "Sofía Reyes Morales",
                "birth_date": date(2001, 3, 15),
                "artistic_area": "Actuación",
                "bio": "Actriz dramática graduada con amplia experiencia en talleres de expresión corporal y pantomima.",
                "location": "Bogotá, Colombia",
                "role": "artista",
                "hashed_password": PASSWORD_HASH,
                "is_active": True
            },
            {
                "id": uuid.UUID("a1b2c3d4-0005-0005-0005-000000000005"),
                "email": "miguel.torres@hotmail.com",
                "full_name": "Miguel Torres Acosta",
                "birth_date": date(1999, 7, 22),
                "artistic_area": "Música",
                "bio": "Compositor, pianista clásico e instrumentista especializado en composición de bandas sonoras y orquestación.",
                "location": "Bogotá, Colombia",
                "role": "artista",
                "hashed_password": PASSWORD_HASH,
                "is_active": True
            },
            {
                "id": uuid.UUID("a1b2c3d4-0006-0006-0006-000000000006"),
                "email": "valentina.cruz@gmail.com",
                "full_name": "Valentina Cruz López",
                "birth_date": date(2000, 11, 8),
                "artistic_area": "Danza",
                "bio": "Bailarina y coreógrafa de danza folclórica colombiana y ballet contemporáneo.",
                "location": "Medellín, Colombia",
                "role": "artista",
                "hashed_password": PASSWORD_HASH,
                "is_active": True
            }
        ]

        user_objs = {}
        for u_data in users_data:
            u = User(**u_data)
            db.add(u)
            db.flush()
            user_objs[u.email] = u
        db.commit()
        print("   ¡Usuarios de prueba insertados!")

        # 4. Relación Usuario-Habilidad
        print("4. Asociando habilidades con artistas...")
        user_skills = [
            ("artista@ejemplo.com", ["Diseño gráfico", "Ilustración digital", "Pintura al óleo"]),
            ("pepe@gmail.com", ["Guitarra eléctrica", "Guitarra clásica", "Percusión"]),
            ("franky@gmail.com", ["Actuación teatral", "Guionismo"]),
            ("sofia.reyes@gmail.com", ["Actuación teatral"]),
            ("miguel.torres@hotmail.com", ["Piano", "Percusión"]),
            ("valentina.cruz@gmail.com", ["Danza contemporánea", "Danza folclórica"])
        ]

        for email, skills in user_skills:
            usr = user_objs[email]
            for sk_name in skills:
                if sk_name in hab_objs:
                    rel = RelUsrHab(usuario=usr, habilidad=hab_objs[sk_name])
                    db.add(rel)
        db.commit()
        print("   ¡Relación usuario-habilidad asociada!")

        # 5. Portafolios y Detalles de Portafolios
        print("5. Creando portafolios y obras...")
        portfolios_data = [
            {
                "user_email": "artista@ejemplo.com",
                "nombre": "Diseño y Pintura Urbana",
                "descripcion": "Mi portafolio artístico principal que recopila obras de diseño digital, branding, video y muralismo urbano.",
                "visibilidad": "Publico",
                "items": [
                    {
                        "titulo": "Mural Urbano 'Esperanza'",
                        "archivo": "/uploads/mural_esperanza.jpg",
                        "portada_url": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500",
                        "estado": "P",
                        "etiquetas": "mural, pintura, urbano",
                        "descripcion": "Mural realizado en acrílico y spray sobre concreto en la calle 26, Bogotá."
                    },
                    {
                        "titulo": "Identidad de Marca - Café Origen",
                        "archivo": "/uploads/cafe_origen.pdf",
                        "portada_url": "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500",
                        "estado": "P",
                        "etiquetas": "diseño, branding, logo",
                        "descripcion": "Propuesta de branding y empaques para una cooperativa de caficultores."
                    },
                    {
                        "titulo": "Melodía de Prueba - Cortometraje",
                        "archivo": "/uploads/melodia_intro.mp3",
                        "portada_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500",
                        "estado": "P",
                        "etiquetas": "audio, instrumental, banda-sonora",
                        "descripcion": "Demo instrumental de guitarra acústica para cortometraje independiente."
                    },
                    {
                        "titulo": "Cortometraje 'El Despertar'",
                        "archivo": "/uploads/cortometraje.mp4",
                        "portada_url": "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500",
                        "estado": "P",
                        "etiquetas": "video, cine, cortometraje",
                        "descripcion": "Fragmento de cortometraje dramático editado en Premiere Pro."
                    }
                ]
            },
            {
                "user_email": "pepe@gmail.com",
                "nombre": "Composiciones Acústicas",
                "descripcion": "Grabaciones de estudio y composiciones instrumentales.",
                "visibilidad": "Publico",
                "items": [
                    {
                        "titulo": "Melodías del viento",
                        "archivo": "/uploads/melodias_viento.mp3",
                        "portada_url": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500",
                        "estado": "P",
                        "etiquetas": "acustico, guitarra, instrumental",
                        "descripcion": "Grabación de guitarra clásica en estudio con reverberación natural."
                    }
                ]
            },
            {
                "user_email": "franky@gmail.com",
                "nombre": "Teatro y Monólogos",
                "descripcion": "Fragmentos y grabaciones de mis interpretaciones teatrales más destacadas.",
                "visibilidad": "Publico",
                "items": [
                    {
                        "titulo": "Monólogo de Hamlet",
                        "archivo": "/uploads/monologo_hamlet.mp4",
                        "portada_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500",
                        "estado": "P",
                        "etiquetas": "teatro, actuacion, monologo",
                        "descripcion": "Representación de la escena clásica 'Ser o no ser' grabada en el Teatro Colón."
                    }
                ]
            }
        ]

        port_objs = {}
        for p_data in portfolios_data:
            usr = user_objs[p_data["user_email"]]
            port = Portafolio(
                nombre=p_data["nombre"],
                descripcion=p_data["descripcion"],
                visibilidad=p_data["visibilidad"],
                usuario=usr
            )
            db.add(port)
            db.flush()
            
            for item in p_data["items"]:
                det = DetPortafolio(
                    portafolio=port,
                    titulo=item["titulo"],
                    archivo=item["archivo"],
                    portada_url=item["portada_url"],
                    estado=item["estado"],
                    etiquetas=item["etiquetas"],
                    descripcion=item["descripcion"]
                )
                db.add(det)
            port_objs[p_data["user_email"]] = port
        db.commit()
        print("   ¡Portafolios y obras creados!")

        # 6. Convocatorias (Ofertas de Empleo)
        print("6. Creando convocatorias de empresas...")
        convs_data = [
            {
                "id_conv": 101,
                "empresa_email": "empresa@ejemplo.com",
                "nombre": "Diseñador Gráfico Junior",
                "glue": "Buscamos un diseñador creativo con conocimiento en herramientas digitales de Adobe (Photoshop, Illustrator, InDesign), proactivo y dinámico para sumarse al equipo de diseño digital.",
                "nivel_experiencia": "Junior",
                "tipo_jornada": "Tiempo Completo",
                "rango_salarial": "$2.5M - $3.2M COP",
                "ubicacion": "Chapinero, Bogotá"
            },
            {
                "id_conv": 102,
                "empresa_email": "empresa@ejemplo.com",
                "nombre": "Actor / Actriz de Doblaje",
                "glue": "Se necesita voz de joven para doblaje de personaje principal en cortometraje de animación. Manejo de voz neutral, expresividad y disponibilidad inmediata.",
                "nivel_experiencia": "Sin Experiencia",
                "tipo_jornada": "Por Horas",
                "rango_salarial": "$800.000 COP / proyecto",
                "ubicacion": "Teusaquillo, Bogotá"
            },
            {
                "id_conv": 103,
                "empresa_email": "Manuela@umb.com",
                "nombre": "Pintor para Mural Colectivo",
                "glue": "Se buscan pintores muralistas para el desarrollo del proyecto de embellecimiento urbano colectivo en las fachadas principales del campus universitario.",
                "nivel_experiencia": "Intermedio",
                "tipo_jornada": "Temporal",
                "rango_salarial": "$4.0M COP total",
                "ubicacion": "Usaquén, Bogotá"
            },
            {
                "id_conv": 104,
                "empresa_email": "Manuela@umb.com",
                "nombre": "Guitarrista para Ensamble Musical",
                "glue": "Buscamos guitarrista con buen oído y excelente lectura de partituras para sumarse al ensamble instrumental cultural durante el ciclo de conciertos del presente año.",
                "nivel_experiencia": "Intermedio",
                "tipo_jornada": "Medio Tiempo",
                "rango_salarial": "$1.8M COP mensual",
                "ubicacion": "Bogotá"
            }
        ]

        conv_objs = {}
        for c_data in convs_data:
            emp = user_objs[c_data["empresa_email"]]
            c = Conv(
                id_conv=c_data["id_conv"],
                nombre=c_data["nombre"],
                glue=c_data["glue"],
                nivel_experiencia=c_data["nivel_experiencia"],
                tipo_jornada=c_data["tipo_jornada"],
                rango_salarial=c_data["rango_salarial"],
                ubicacion=c_data["ubicacion"],
                empresa=emp
            )
            db.add(c)
            db.flush()
            conv_objs[c_data["id_conv"]] = c
        db.commit()
        print("   ¡Convocatorias creadas!")

        # 7. Inscripciones / Postulaciones
        print("7. Postulando artistas a convocatorias...")
        inscs_data = [
            {
                "id_i": 501,
                "conv_id": 101,
                "user_email": "artista@ejemplo.com",
                "estado": "Revisando",
                "carta_presentacion": "Hola, soy apasionado por la ilustración digital y manejo perfectamente Illustrator, Photoshop y Figma.",
                "cv_url": "https://ejemplo.com/curriculum_jhoyner.pdf",
                "portafolio_id": port_objs["artista@ejemplo.com"].id_port
            },
            {
                "id_i": 502,
                "conv_id": 101,
                "user_email": "sofia.reyes@gmail.com",
                "estado": "Enviada",
                "carta_presentacion": "Me interesa mucho la vacante, tengo experiencia diseñando marcas e identidad visual corporativa en proyectos autónomos.",
                "cv_url": "https://ejemplo.com/sofia_reyes_cv.pdf",
                "portafolio_id": None
            },
            {
                "id_i": 503,
                "conv_id": 102,
                "user_email": "valentina.cruz@gmail.com",
                "estado": "Seleccionada",
                "carta_presentacion": "Hola! Hago teatro dramático hace 3 años y tengo una excelente modulación de voz neutra. Me encantaría participar.",
                "cv_url": "https://ejemplo.com/valentina_cruz_cv.pdf",
                "portafolio_id": None
            },
            {
                "id_i": 504,
                "conv_id": 104,
                "user_email": "miguel.torres@hotmail.com",
                "estado": "Rechazada",
                "carta_presentacion": "Soy guitarrista y bajista con banda propia. Adjunto mi curriculum para que lo tengan en cuenta.",
                "cv_url": "https://ejemplo.com/miguel_torres_cv.pdf",
                "portafolio_id": None
            },
            {
                "id_i": 505,
                "conv_id": 104,
                "user_email": "pepe@gmail.com",
                "estado": "Enviada",
                "carta_presentacion": "Tengo experiencia tocando guitarra acústica y de sesión en bandas de rock y jazz. Adjunto mi portafolio.",
                "cv_url": "https://ejemplo.com/pepe_lobo_cv.pdf",
                "portafolio_id": port_objs["pepe@gmail.com"].id_port
            }
        ]

        insc_objs = {}
        for i_data in inscs_data:
            usr = user_objs[i_data["user_email"]]
            conv = conv_objs[i_data["conv_id"]]
            insc = Inscripcion(
                id_i=i_data["id_i"],
                convocatoria=conv,
                usuario=usr,
                estado=i_data["estado"],
                carta_presentacion=i_data["carta_presentacion"],
                cv_url=i_data["cv_url"],
                id_portafolio_interno=i_data["portafolio_id"]
            )
            db.add(insc)
            db.flush()
            insc_objs[i_data["id_i"]] = insc
        db.commit()
        print("   ¡Inscripciones creadas exitosamente!")

        # 8. DetConv (Evaluaciones de candidatos)
        print("8. Creando observaciones y evaluaciones de candidatos...")
        eval_1 = DetConv(
            id_conv=101,
            id_usr=user_objs["artista@ejemplo.com"].id,
            obsr="Excelente manejo técnico en Illustrator y creatividad destacada. Portafolio verificado. Agendado para entrevista."
        )
        db.add(eval_1)
        db.commit()
        print("   ¡Evaluaciones de candidatos creadas!")

        # 9. Conversaciones y Mensajes de Chat
        print("9. Creando chats interactivos...")
        chats_data = [
            {
                "id_conversacion": 1,
                "tipo": "postulacion",
                "id_i": 501,
                "empresa_email": "empresa@ejemplo.com",
                "artista_email": "artista@ejemplo.com",
                "mensajes": [
                    {
                        "remitente_email": "empresa@ejemplo.com",
                        "contenido": "Hola Jhoyner, nos interesó mucho tu portafolio de diseño y muralismo. ¿Tienes disponibilidad para una entrevista corta esta semana?",
                        "leido": True
                    },
                    {
                        "remitente_email": "artista@ejemplo.com",
                        "contenido": "¡Hola! Claro que sí, muchas gracias por el interés. Estoy disponible todas las tardes a partir de las 2:00 PM.",
                        "leido": True
                    },
                    {
                        "remitente_email": "empresa@ejemplo.com",
                        "contenido": "Perfecto, programemos para el jueves a las 3:00 PM. Te enviaré el enlace por correo.",
                        "leido": False
                    }
                ]
            },
            {
                "id_conversacion": 2,
                "tipo": "directo",
                "id_i": None,
                "empresa_email": "Manuela@umb.com",
                "artista_email": "pepe@gmail.com",
                "mensajes": [
                    {
                        "remitente_email": "Manuela@umb.com",
                        "contenido": "Hola Pepe, vimos tu perfil y nos llamó la atención tu experiencia con la guitarra clásica. ¿Te interesaría presentarte a una audición del ensamble?",
                        "leido": True
                    },
                    {
                        "remitente_email": "pepe@gmail.com",
                        "contenido": "¡Hola buenas! Sí, me interesa muchísimo. ¿Me podrían dar más detalles sobre los requisitos y las piezas musicales de la audición?",
                        "leido": False
                    }
                ]
            }
        ]

        for c_data in chats_data:
            emp = user_objs[c_data["empresa_email"]]
            art = user_objs[c_data["artista_email"]]
            conv = Conversacion(
                id_conversacion=c_data["id_conversacion"],
                tipo=c_data["tipo"],
                id_i=c_data["id_i"],
                empresa_id=emp.id,
                artista_id=art.id
            )
            db.add(conv)
            db.flush()
            
            for m_data in c_data["mensajes"]:
                rem = user_objs[m_data["remitente_email"]]
                msg = Mensaje(
                    id_conversacion=conv.id_conversacion,
                    remitente_id=rem.id,
                    contenido=m_data["contenido"],
                    leido=m_data["leido"]
                )
                db.add(msg)
        db.commit()
        print("   ¡Chats y mensajes creados exitosamente!")

    print("\n--- SEMBRADO COMPLETADO EXITOSAMENTE ---")
    print("Las cuentas de demo creadas con contraseña 'Test1234' son:")
    print("  - Artista: artista@ejemplo.com")
    print("  - Artista: pepe@gmail.com")
    print("  - Artista: franky@gmail.com")
    print("  - Empresa: empresa@ejemplo.com")
    print("  - Empresa: Manuela@umb.com")
    print("  - Administrador: admin@ejemplo.com")
    print("  - Administrador: admin@jovenes-al-ruedo.com")

except Exception as e:
    print(f"\n❌ ERROR DURANTE EL SEMBRADO: {e}")
    sys.exit(1)
