// Frontend/js/login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form') || document.querySelector('form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('email') || document.querySelector('input[type="email"]');
            const passwordInput = document.getElementById('password') || document.querySelector('input[type="password"]');
            const roleSelect = document.getElementById('role') || document.querySelector('select'); 
            
            if (!emailInput || !passwordInput) return;

            const email = emailInput.value.trim();
            const password = passwordInput.value;
            
            // Forzar un rol limpio para el enrutador del dashboard
            let role = 'medico';
            if (roleSelect && roleSelect.value) {
                role = roleSelect.value;
            } else {
                // Si el diseño usa texto o valores alternativos (ej: "Control de Caja y Finanzas")
                const textoSeleccionado = roleSelect ? roleSelect.options[roleSelect.selectedIndex].text.toLowerCase() : '';
                if (textoSeleccionado.includes('finanzas') || textoSeleccionado.includes('caja')) role = 'finanzas';
                if (textoSeleccionado.includes('admin')) role = 'admin';
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

            if (email === '' || password === '') {
                alert('Por favor, rellena todos los campos.');
                return;
            }

            if (!emailRegex.test(email)) {
                alert('Por favor, ingresa un correo electrónico válido.');
                emailInput.focus();
                return;
            }

            if (!passwordRegex.test(password)) {
                alert('La contraseña debe tener 8 o más caracteres, incluir letras mayúsculas, minúsculas y números, sin caracteres especiales.');
                passwordInput.focus();
                return;
            }

            try {
                const respuesta = await fetch('http://127.0.0.1:5000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, password: password, role: role })
                });

                const resultado = await respuesta.json();

                if (resultado.success) {
                    alert(`¡Bienvenido, ${resultado.usuario.nombre}!`);
                    localStorage.setItem('userRole', resultado.usuario.rol || role);
                    localStorage.setItem('userName', resultado.usuario.nombre);
                    localStorage.setItem('userEmail', email);
                    window.location.href = 'dashboard.html';
                } else {
                    alert(resultado.message);
                }

            } catch (error) {
                console.error('Error en la conexión con la API:', error);
                console.warn('⚠️ Activando Entorno Clínico de Simulación Local (Offline Mode).');
                
                // Asegurar persistencia limpia antes de saltar de página
                localStorage.setItem('userRole', role);
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userName', email.split('@')[0]);

                alert(`🔧 Modo Demostración Activo:\nAccediendo localmente con el perfil de: ${role.toUpperCase()}`);
                window.location.href = 'dashboard.html';
            }
        });
    }
});