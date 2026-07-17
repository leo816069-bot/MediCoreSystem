import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
CORS(app)

# 🌐 Configuración dinámica: En Render lee la nube; localmente usa valores por defecto
# Nota: Render te dará un enlace completo llamado DATABASE_URL que incluye todo automáticamente
DATABASE_URL = os.environ.get('DATABASE_URL')

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

if __name__ == '__main__':
    puerto = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=puerto)