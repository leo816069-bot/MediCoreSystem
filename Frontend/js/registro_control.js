// Frontend/js/registro_control.js

document.addEventListener('DOMContentLoaded', () => {
    const formRegistro = document.getElementById('formRegistroCompleto');

    if (formRegistro) {
        formRegistro.addEventListener('submit', (e) => {
            e.preventDefault();

            // Captura de los valores configurados
            const nombre = document.getElementById('regNombre').value.trim();
            const usuario = document.getElementById('regUsuario').value.trim();
            const consultorio = document.getElementById('regConsultorio').value.trim();
            const usuariosCantidad = document.getElementById('regCantidadUsuarios').value;
            const planSeleccionado = document.getElementById('regPlan').value.toUpperCase();

            // Simulación interactiva del procesamiento de la suscripción
            alert(`🚀 ¡Registro de Empresa Exitoso!\n\n` +
                  `• Doctor: ${nombre} (${usuario})\n` +
                  `• Clínica: ${consultorio}\n` +
                  `• Licencias Solicitadas: ${usuariosCantidad} Usuario(s)\n` +
                  `• Nivel de Plan: SUSCRIPCIÓN ${planSeleccionado}\n\n` +
                  `Tu entorno clínico ha sido configurado en MediCore System. Procediendo al inicio de sesión.`);

            // Guardamos temporalmente el nombre del consultorio en el navegador para personalizar el panel
            localStorage.setItem('clinicName', consultorio);

            // Redirigimos directo al login para que acceda con sus nuevas credenciales
            window.location.href = 'login.html';
        });
    }
});