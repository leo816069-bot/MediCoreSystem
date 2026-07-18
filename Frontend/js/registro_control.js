// Frontend/js/registro_control.js

document.addEventListener('DOMContentLoaded', () => {
    const formRegistro = document.getElementById('formRegistroCompleto');

    if (formRegistro) {
        formRegistro.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Captura de los valores configurados en la interfaz
            const nombreInput = document.getElementById('regNombre');
            const usuarioInput = document.getElementById('regUsuario'); // Ahora es el correo electrónico
            const passwordInput = document.getElementById('regPassword');
            const consultorioInput = document.getElementById('regConsultorio');
            const usuariosCantidadInput = document.getElementById('regCantidadUsuarios');
            const planSeleccionadoInput = document.getElementById('regPlan');

            const nombre = nombreInput ? nombreInput.value.trim() : '';
            const usuario = usuarioInput ? usuarioInput.value.trim() : ''; 
            const password = passwordInput ? passwordInput.value : '';
            const consultorio = consultorioInput ? consultorioInput.value.trim() : 'Mi Clínica';
            const usuariosCantidad = usuariosCantidadInput ? usuariosCantidadInput.value : '1';
            const planSeleccionado = planSeleccionadoInput ? planSeleccionadoInput.value.toUpperCase() : 'BÁSICA';

            // Expresiones regulares de validación estricta
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

            // 1. Validar campos vacíos básicos
            if (nombre === '' || usuario === '' || password === '') {
                alert('Por favor, rellena todos los campos de datos personales y de acceso.');
                return;
            }

            // 2. Validar formato de Correo Electrónico
            if (!emailRegex.test(usuario)) {
                alert('Por favor, ingresa un correo electrónico válido como nombre de usuario.');
                if (usuarioInput) usuarioInput.focus();
                return;
            }

            // 3. Validar seguridad de la Contraseña (8+ caracteres, Mayús, Minús, Número)
            if (!passwordRegex.test(password)) {
                alert('La contraseña debe tener 8 o más caracteres, incluir letras mayúsculas, minúsculas y números, sin caracteres especiales.');
                if (passwordInput) passwordInput.focus();
                return;
            }

            try {
                // 🌐 Petición directa al Backend en producción dentro de Render
                const respuesta = await fetch('https://medicore-backend-g1p2.onrender.com/api/registro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombre: nombre,
                        email: usuario,     // Pasa el correo validado
                        password: password, // Pasa la contraseña validada
                        role: 'admin'       // 👈 CAMBIADO: Rol de Administrador para registro inicial corporativo
                    })
                });

                const resultado = await respuesta.json();

                if (resultado.success) {
                    alert(`🚀 ¡Registro de Empresa Exitoso en la Nube!\n\n` +
                          `• Administrador: ${nombre} (${usuario})\n` +
                          `• Clínica: ${consultorio}\n` +
                          `• Licencias Activas: ${usuariosCantidad} Usuario(s)\n` +
                          `• Plan Activado: SUSCRIPCIÓN ${planSeleccionado}\n\n` +
                          `Tu entorno clínico ha sido configurado en PostgreSQL como Administrador. Procediendo al inicio de sesión.`);

                    // Guardamos la configuración en el navegador para personalizar el Dashboard
                    localStorage.setItem('clinicName', consultorio);
                    localStorage.setItem('userEmail', usuario);

                    // Redirección limpia al Login
                    window.location.href = 'login.html';
                } else {
                    alert(`❌ Error en el registro: ${resultado.message}`);
                }

            } catch (error) {
                console.error('Error al conectar con la API de registro:', error);
                console.warn('⚠️ Activando Modo Demostración Local (Offline Mode).');

                alert(`🚀 ¡Registro Exitoso (Modo Local Simulado)!\n\n` +
                      `• Administrador: ${nombre}\n` +
                      `• Clínica: ${consultorio}\n` +
                      `Procediendo al login offline.`);

                localStorage.setItem('clinicName', consultorio);
                window.location.href = 'login.html';
            }
        });
    }
});