# Backend/Api/app.py
import os
import psycopg2
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Permitir peticiones desde tu frontend en GitHub Pages
CORS(app, resources={r"/api/*": {"origins": "*"}})

DATABASE_URL = os.environ.get('DATABASE_URL')

def conectar_db():
    if DATABASE_URL:
        return psycopg2.connect(DATABASE_URL, sslmode='require')
    else:
        # Caída local por si necesitas pruebas en desarrollo
        return psycopg2.connect(
            dbname="medicore_db",
            user="postgres",
            password="password",
            host="localhost",
            port="5432"
        )

def inicializar_base_de_datos():
    try:
        conexion = conectar_db()
        with conexion.cursor() as cur:
            # 1. Tabla de Usuarios / Personal Clínico
            cur.execute("""
                CREATE TABLE IF NOT EXISTS usuarios (
                    id SERIAL PRIMARY KEY,
                    nombre VARCHAR(150) NOT NULL,
                    email VARCHAR(150) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    rol VARCHAR(50) NOT NULL
                );
            """)
            
            # 2. ✨ NUEVA TABLA: Agenda de Citas Médicas
            cur.execute("""
                CREATE TABLE IF NOT EXISTS citas (
                    id SERIAL PRIMARY KEY,
                    horario VARCHAR(50) NOT NULL,
                    fecha DATE NOT NULL,
                    motivo VARCHAR(255) NOT NULL,
                    nombre_paciente VARCHAR(150) NOT NULL,
                    apellido_paciente VARCHAR(150) NOT NULL,
                    estado VARCHAR(50) NOT NULL DEFAULT 'Agendado'
                );
            """)
            conexion.commit()
        conexion.close()
        print("✅ Base de datos inicializada correctamente (Tablas: usuarios, citas).")
    except Exception as e:
        print(f"❌ Error al inicializar la base de datos: {str(e)}")

# Inicializar la estructura al levantar la app en Render
inicializar_base_de_datos()

# ==========================================================================
# RUTAS DE LA API (AUTENTICACIÓN Y PERSONAL)
# ==========================================================================

@app.route('/api/registro', methods=['POST'])
def registrar_usuario():
    datos = request.get_json()
    nombre = datos.get('nombre')
    email = datos.get('email')
    password = datos.get('password')
    role = datos.get('role')

    if not all([nombre, email, password, role]):
        return jsonify({"success": False, "message": "Faltan campos obligatorios."}), 400

    try:
        conexion = conectar_db()
        with conexion.cursor() as cursor:
            # Verificar si el correo ya existe para evitar duplicados indeseados
            cursor.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
            if cursor.fetchone():
                return jsonify({"success": False, "message": "El correo ya está registrado."}), 400

            sql = "INSERT INTO usuarios (nombre, email, password, rol) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (nombre, email, password, role))
            conexion.commit()
        conexion.close()
        return jsonify({"success": True, "message": "Usuario registrado exitosamente."}), 201
    except Exception as e:
        return jsonify({"success": False, "message": f"Error en el servidor: {str(e)}"}), 500

@app.route('/api/login', methods=['POST'])
def login_usuario():
    datos = request.get_json()
    email = datos.get('email')
    password = datos.get('password')
    role = datos.get('role')

    if not all([email, password, role]):
        return jsonify({"success": False, "message": "Faltan credenciales."}), 400

    try:
        conexion = conectar_db()
        with conexion.cursor() as cursor:
            # Búsqueda estricta basada en credenciales y rol homologado
            sql = "SELECT nombre, rol FROM usuarios WHERE email = %s AND password = %s AND rol = %s"
            cursor.execute(sql, (email, password, role))
            usuario = cursor.fetchone()
        conexion.close()

        if usuario:
            return jsonify({
                "success": True,
                "usuario": {
                    "nombre": usuario[0],
                    "role": usuario[1]
                }
            }), 200
        else:
            return jsonify({"success": False, "message": "Las credenciales o el rol seleccionado no coinciden."}), 401
    except Exception as e:
        return jsonify({"success": False, "message": f"Error en el servidor: {str(e)}"}), 500

# ==========================================================================
# RUTAS DE LA API (AGENDA MÉDICA - PERSISTENCIA REAL)
# ==========================================================================

@app.route('/api/citas', methods=['GET'])
def obtener_citas():
    try:
        conexion = conectar_db()
        with conexion.cursor() as cursor:
            # Retornar las citas con formato de fecha legible ISO
            sql = """SELECT id, horario, to_char(fecha, 'YYYY-MM-DD') as fecha, motivo, 
                     nombre_paciente, apellido_paciente, estado FROM citas 
                     ORDER BY fecha ASC, horario ASC"""
            cursor.execute(sql)
            columnas = [desc[0] for desc in cursor.description]
            citas_raw = cursor.fetchall()
            
            # Formatear la respuesta como una lista de diccionarios limpios
            resultado_citas = [dict(zip(columnas, fila)) for fila in citas_raw]
            
        conexion.close()
        return jsonify({"success": True, "citas": resultado_citas}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error al consultar citas: {str(e)}"}), 500

@app.route('/api/citas', methods=['POST'])
def crear_cita():
    datos = request.get_json()
    horario = datos.get('horario')
    fecha = datos.get('fecha')
    motivo = datos.get('motivo')
    nombre = datos.get('nombre')
    apellido = datos.get('apellido')
    estado = datos.get('estado', 'Agendado')

    if not all([horario, fecha, motivo, nombre, apellido]):
        return jsonify({"success": False, "message": "Campos de cita incompletos."}), 400

    try:
        conexion = conectar_db()
        with conexion.cursor() as cursor:
            sql = """INSERT INTO citas (horario, fecha, motivo, nombre_paciente, apellido_paciente, estado) 
                     VALUES (%s, %s, %s, %s, %s, %s)"""
            cursor.execute(sql, (horario, fecha, motivo, nombre, apellido, estado))
            conexion.commit()
        conexion.close()
        return jsonify({"success": True, "message": "Cita almacenada exitosamente."}), 201
    except Exception as e:
        return jsonify({"success": False, "message": f"Error al insertar cita: {str(e)}"}), 500

if __name__ == '__main__':
    # Render asigna dinámicamente el puerto mediante variable de entorno
    puerto = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=puerto)