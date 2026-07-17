import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
CORS(app)

# 🌐 Configuración dinámica de la base de datos
DATABASE_URL = os.environ.get('DATABASE_URL')

def inicializar_base_de_datos():
    """Crea la tabla usuarios automáticamente si no existe al arrancar la app."""
    if not DATABASE_URL:
        print("⚠️ DATABASE_URL no encontrada. Saltando inicialización automática.")
        return
        
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Ejecuta la creación de la tabla de forma automática si no existe
        cur.execute("""
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(150) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                rol VARCHAR(50) NOT NULL DEFAULT 'medico'
            );
        """)
        
        conn.commit()
        cur.close()
        conn.close()
        print("✅ Estructura de la base de datos verificada/creada correctamente.")
    except Exception as e:
        print(f"❌ Error al inicializar la base de datos: {e}")

def conectar_db():
    if DATABASE_URL:
        # Conexión directa en la nube de Render
        return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    else:
        # Conexión local de respaldo (por si pruebas en tu computadora)
        return psycopg2.connect(
            host=os.environ.get('DB_HOST', 'localhost'),
            user=os.environ.get('DB_USER', 'postgres'),
            password=os.environ.get('DB_PASSWORD', 'password'),
            database=os.environ.get('DB_NAME', 'medicore_db'),
            cursor_factory=RealDictCursor
        )

# 🔐 RUTA: INICIO DE SESIÓN
@app.route('/api/login', methods=['POST'])
def login():
    datos = request.get_json()
    email = datos.get('email')
    password = datos.get('password')
    rol_seleccionado = datos.get('role')

    try:
        conexion = conectar_db()
        with conexion.cursor() as cursor:
            sql = "SELECT id, nombre, email, rol, password FROM usuarios WHERE email = %s AND rol = %s"
            cursor.execute(sql, (email, rol_seleccionado))
            usuario = cursor.fetchone()
        conexion.close()

        if usuario and usuario['password'] == password:
            return jsonify({
                "success": True,
                "usuario": {
                    "nombre": usuario['nombre'],
                    "email": usuario['email'],
                    "role": usuario['rol']
                }
            }), 200
        else:
            return jsonify({"success": False, "message": "Credenciales incorrectas o el rol seleccionado no coincide."}), 401
    except Exception as e:
        return jsonify({"success": False, "message": f"Error en el servidor: {str(e)}"}), 500

# 📝 RUTA: REGISTRO DE USUARIOS
@app.route('/api/registro', methods=['POST'])
def registro():
    datos = request.get_json()
    nombre = datos.get('nombre')
    email = datos.get('email')
    password = datos.get('password')
    rol = datos.get('role', 'medico')

    try:
        conexion = conectar_db()
        with conexion.cursor() as cursor:
            cursor.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
            if cursor.fetchone():
                return jsonify({"success": False, "message": "El correo electrónico ya está registrado."}), 400

            sql = "INSERT INTO usuarios (nombre, email, password, rol) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (nombre, email, password, rol))
            conexion.commit()
        conexion.close()
        return jsonify({"success": True, "message": "Usuario registrado exitosamente."}), 201
    except Exception as e:
        return jsonify({"success": False, "message": f"Error al registrar: {str(e)}"}), 500

# 🚀 Inicializar la base de datos antes de arrancar el servidor web
inicializar_base_de_datos()

if __name__ == '__main__':
    puerto = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=puerto)