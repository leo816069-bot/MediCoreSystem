import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql

app = Flask(__name__)
CORS(app)

# 🌐 Configuración dinámica: Lee la nube si existe, si no, usa tu local
DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_USER = os.environ.get('DB_USER', 'root')
DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
DB_NAME = os.environ.get('DB_NAME', 'medicore_db')

def conectar_db():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor
    )

# 🔐 RUTA: INICIO DE SESIÓN CORREGIDA
@app.route('/api/login', methods=['POST']) # <-- Corregido a 'methods'
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
            return jsonify({"success": False, "message": "Credenciales incorrectas o rol no coincidente."}), 401
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
                return jsonify({"success": False, "message": "El correo ya existe."}), 400

            sql = "INSERT INTO usuarios (nombre, email, password, rol) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (nombre, email, password, rol))
            conexion.commit()
        conexion.close()
        return jsonify({"success": True, "message": "Usuario registrado."}), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == '__main__':
    # Producción asigna el puerto automáticamente
    puerto = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=puerto)