// Frontend/js/login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form') || document.querySelector('form');

    // ==========================================================================
    // FUNCIÓN PARA MOSTRAR / OCULTAR CONTRASEÑA
    // ==========================================================================
    const btnTogglePassword = document.getElementById('btnTogglePassword');
    const loginPasswordInput = document.getElementById('loginPassword');

    if (btnTogglePassword && loginPasswordInput) {
        btnTogglePassword.addEventListener('click', () => {
            // Alternar el tipo de input
            const type = loginPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            loginPasswordInput.setAttribute('type', type);
            
            // Alternar el icono visual
            btnTogglePassword.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }

    // ==========================================================================
    // CONTROL DEL ENVÍO DEL FORMULARIO (LOGIN)
    // ==========================================================================
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('email') || document.querySelector('input[type="email"]');
            // ✨ CORREGIDO: Cambiado de 'password' a 'loginPassword' para emparejar tu HTML
            const passwordInput = document.getElementById('loginPassword') || document.querySelector('input[type="password"]');
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
                if (emailInput) emailInput.focus();
                return;
            }

            if (!passwordRegex.test(password)) {
                alert('La contraseña debe tener 8 o más caracteres, incluir letras mayúsculas, minúsculas y números, sin caracteres especiales.');
                if (passwordInput) passwordInput.focus();
                return;
            }

            try {
                // 🌐 Conexión directa a la API en producción dentro de Render
                const respuesta = await fetch('https://medicore-backend-g1p2.onrender.com/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, password: password, role: role })
                });

                const resultado = await respuesta.json();

                if (resultado.success) {
                    alert(`¡Bienvenido, ${resultado.usuario.nombre}!`);
                    // Se almacena 'role' para emparejar la estructura del backend de Python
                    localStorage.setItem('userRole', resultado.usuario.role || role);
                    localStorage.setItem('userName', resultado.usuario.nombre);
                    localStorage.setItem('userEmail', email);
                    window.location.href = 'dashboard.html';
                } else {
                    alert(resultado.message);
                }

            } catch (error) {
                console.error('Error en la conexión con la API:', error);
                console.warn('⚠️ Activando Entorno Clínico de Simulación Local (Offline Mode).');
                
                // Asegurar persistencia limpia antes de saltar de página en modo offline
                localStorage.setItem('userRole', role);
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userName', email.split('@')[0]);

                alert(`🔧 Modo Demostración Activo:\nAccediendo localmente con el perfil de: ${role.toUpperCase()}`);
                window.location.href = 'dashboard.html';
            }
        });
    }
});