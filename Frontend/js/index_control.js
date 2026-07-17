// Frontend/js/index_control.js

document.addEventListener('DOMContentLoaded', () => {
    const btnAbrir = document.getElementById('btnAbrirRegistro');
    const btnCerrar = document.getElementById('btnCerrarRegistro');
    const modal = document.getElementById('modalRegistro');
    const formRegistro = document.getElementById('formRegistroIndex');

    // Abrir Modal
    if (btnAbrir && modal) {
        btnAbrir.addEventListener('click', () => {
            modal.classList.add('active');
        });
    }

    // Cerrar Modal al dar clic en la (X)
    if (btnCerrar && modal) {
        btnCerrar.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // Cerrar Modal si dan clic afuera de la tarjeta blanca
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // Procesar el Registro
    if (formRegistro) {
        formRegistro.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('regNombre').value.trim();
            const correo = document.getElementById('regCorreo').value.trim();

            // Aquí simulamos que se guarda de manera exitosa antes de conectarlo con Python
            alert(`🎉 ¡Felicidades Dr(a). ${nombre}!\nTu solicitud de registro para el correo [${correo}] ha sido pre-aprobada en MediCore Systems.\n\nYa puedes proceder a iniciar sesión.`);
            
            formRegistro.reset();
            modal.classList.remove('active');
        });
    }
});