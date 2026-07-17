# Backend/config/db_config.py
import mysql.connector
from mysql.connector import Error

def obtener_conexion():
    """
    Establece y retorna la conexión con la base de datos MySQL en la nube o local.
    """
    try:
        conexion = mysql.connector.connect(
            host='localhost',       # Cambiar por la IP de tu servidor en la nube si aplica
            user='root',            # Tu usuario de MySQL (ej. root)
            password='',            # Tu contraseña de MySQL
            database='medicore_db', # El nombre de la BD que creamos en el script SQL
            port=3306
        )
        
        if conexion.is_connected():
            return conexion

    except Error as e:
        print(f" Error al conectar a la base de datos: {e}")
        return None

# Prueba rápida de conexión (Solo se ejecuta si corres este archivo directamente)
if __name__ == "__main__":
    test_con = obtener_conexion()
    if test_con:
        print(" ¡Conexión exitosa a MediCore DB!")
        test_con.close()