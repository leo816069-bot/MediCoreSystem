// Frontend/js/dashboard_modules.js

document.addEventListener('DOMContentLoaded', () => {
    const sidebarNav = document.querySelector('.dashboard-sidebar nav');
    const mainContainer = document.querySelector('.table-card'); 
    
    const pageTitle = document.querySelector('.content-header h2') || document.querySelector('.welcome-box h2') || document.querySelector('.dashboard-body h2');
    const pageSubTitle = document.querySelector('.content-header p') || document.querySelector('.welcome-box p') || document.querySelector('.dashboard-body p');

    if (!mainContainer || !sidebarNav) return;

    // ==========================================================================
    // DATA CORE (Persistencia en memoria local simulada)
    // ==========================================================================
    if (!localStorage.getItem('dbPacientes')) {
        const pacientesIniciales = [
            { id: "1042", nombre: "Carlos", apellido: "Mendoza Ruiz", edad: 45, nacimiento: "1981-05-12", ingreso: "2026-07-10", egreso: "2026-07-12", diagIngreso: "Crisis Hipertensiva", diagEgreso: "Hipertensión Arterial Esencial", condiciones: "Hipertensión, Alergia a Penicilina" }
        ];
        localStorage.setItem('dbPacientes', JSON.stringify(pacientesIniciales));
    }

    if (!localStorage.getItem('dbNotas')) {
        const notasIniciales = [
            { idPaciente: "1042", fecha: "2026-07-16", texto: "Paciente refiere apego al tratamiento con Losartán. Cifras tensionales en rangos estables (120/80 mmHg)." }
        ];
        localStorage.setItem('dbNotas', JSON.stringify(notasIniciales));
    }

    // Detectar el rol guardado (médico, finanzas o admin)
    const usuarioRol = localStorage.getItem('userRole') || 'medico'; 

    const nombreLegibleRol = usuarioRol === 'admin' ? 'Administrador' : (usuarioRol === 'finanzas' ? 'Control de Caja y Finanzas' : 'Médico / Especialista');
    const bannerRol = document.createElement('div');
    bannerRol.className = 'role-notification-banner';
    bannerRol.innerHTML = `¡Bienvenido! Estás navegando en el sistema con el perfil de: <strong>${nombreLegibleRol}</strong>`;
    
    const bannerViejo = document.querySelector('.role-notification-banner');
    if (bannerViejo) bannerViejo.remove();
    mainContainer.parentNode.insertBefore(bannerRol, mainContainer);

    const bodyElement = document.body;
    bodyElement.classList.remove('bg-medico', 'bg-admin', 'bg-finanzas');
    if (usuarioRol === 'admin') {
        bodyElement.classList.add('bg-admin');
    } else if (usuarioRol === 'finanzas') {
        bodyElement.classList.add('bg-finanzas');
    } else {
        bodyElement.classList.add('bg-medico');
    }

    // INYECTAMOS LAS OPCIONES DEL MENÚ
    if (usuarioRol === 'admin') {
        sidebarNav.innerHTML = `
            <a href="#" class="active">Auditoría Global</a>
            <a href="#">Agenda Médica General</a>
            <a href="#">Gestión de Personal</a>
            <a href="#">Historial de Caja Chica</a>
            <a href="#">Expedientes Clínicos (Lectura)</a>
            <a href="#">Configuración de Clínica</a>
        `;
    } else if (usuarioRol === 'finanzas') {
        sidebarNav.innerHTML = `
            <a href="#" class="active">Agenda de Turno</a>
            <a href="#">Operaciones de Caja</a>
            <a href="#">Reporte de Ingresos</a>
        `;
    } else {
        sidebarNav.innerHTML = `
            <a href="#" class="active">Mi Agenda Médica</a>
            <a href="#">Expedientes Clínicos</a>
            <a href="#">Notas de Evolución (SOAP)</a>
            <a href="#">Receta Digital</a>
        `;
    }

    // ENRUTADOR DE PESTAÑAS (SPA)
    const actualizarEnlacesMenu = () => {
        const menuLinks = sidebarNav.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                menuLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                const opcion = link.textContent.trim();

                switch(opcion) {
                    case "Auditoría Global":
                        pageTitle.textContent = "Auditoría y Rendimiento Global";
                        pageSubTitle.textContent = "Panel de supervisión general: Monitoreo de todo lo registrado en el sistema";
                        mainContainer.innerHTML = obtenerModuloAdminDashboard();
                        break;
                    case "Agenda Médica General":
                    case "Agenda de Turno":
                    case "Mi Agenda Médica":
                        pageTitle.textContent = "Agenda Médica Colectiva";
                        pageSubTitle.textContent = "Horarios de citas, consultas y estado de pacientes en sala de espera";
                        mainContainer.innerHTML = obtenerModuloAgendaMedico();
                        break;
                    case "Gestión de Personal":
                        pageTitle.textContent = "Gestión de Personal";
                        pageSubTitle.textContent = "Alta, baja y asignación de roles del equipo clínico corporativo";
                        mainContainer.innerHTML = obtenerModuloGestionPersonal();
                        break;
                    case "Historial de Caja Chica":
                    case "Operaciones de Caja":
                        pageTitle.textContent = "Operaciones de Caja";
                        pageSubTitle.textContent = "Gestión de cobros de servicios y registro de gastos del consultorio clínico";
                        mainContainer.innerHTML = obtenerModuloCaja();
                        inicializarGraficaOperacionesCaja(); 
                        break;
                    case "Reporte de Ingresos":
                        pageTitle.textContent = "Reporte de Ingresos Analítico";
                        pageSubTitle.textContent = "Métricas avanzadas de recaudación y auditoría de ingresos por día, semana y mes";
                        mainContainer.innerHTML = obtenerModuloFinanzasReportes();
                        inicializarGraficaReporteIngresos("semana");
                        break;
                    case "Expedientes Clínicos (Lectura)":
                    case "Expedientes Clínicos":
                        pageTitle.textContent = "Expedientes Clínicos Digitales";
                        pageSubTitle.textContent = "Historial médico completo, altas de pacientes y asignación de ID único";
                        mainContainer.innerHTML = obtenerModuloExpedientes();
                        break;
                    case "Notas de Evolución (SOAP)":
                        pageTitle.textContent = "Historial de Notas de Evolución";
                        pageSubTitle.textContent = "Búsqueda centralizada de notas clínicas y evolución por ID de paciente";
                        mainContainer.innerHTML = obtenerModuloNotas();
                        break;
                    case "Receta Digital":
                        pageTitle.textContent = "Prescripción Médica Electrónica";
                        pageSubTitle.textContent = "Generación, previsualización e impresión automatizada de recetas médicas";
                        mainContainer.innerHTML = obtenerModuloRecetaDigital();
                        break;
                    case "Configuración de Clínica":
                        pageTitle.textContent = "Configuración del Sistema";
                        pageSubTitle.textContent = "Parametrización horaria de la agenda y días de jornada laboral clínica";
                        mainContainer.innerHTML = obtenerModuloConfigClinica();
                        break;
                }
            });
        });
    };

    // CARGA DE LA PANTALLA INICIAL AUTOMÁTICA
    if (usuarioRol === 'admin') {
        pageTitle.textContent = "Auditoría y Rendimiento Global";
        mainContainer.innerHTML = obtenerModuloAdminDashboard();
    } else if (usuarioRol === 'finanzas') {
        pageTitle.textContent = "Agenda Médica Colectiva";
        mainContainer.innerHTML = obtenerModuloAgendaMedico();
    } else {
        pageTitle.textContent = "Agenda Médica Colectiva";
        mainContainer.innerHTML = obtenerModuloAgendaMedico();
    }

    actualizarEnlacesMenu();

    // ==========================================================================
    // 🕹️ ESCUCHADORES INTERACTIVOS GLOBAL
    // ==========================================================================
    const modalCita = document.getElementById('modalCitaElegante');
    const modalExp = document.getElementById('modalNuevoExpediente');
    const btnCancelarModal = document.getElementById('btnCancelarCitaModal');
    const formCitaModal = document.getElementById('formNuevaCitaModal');

    let datosGraficaCaja = [650, -1200];
    let etiquetasGraficaCaja = ['09:45', '11:00'];
    let miGraficaCaja = null;

    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('btn-trigger-appointment')) {
            e.preventDefault();
            const selectHora = document.getElementById('citaHora');
            if (selectHora) {
                selectHora.innerHTML = `<option value="09:00">09:00 hrs</option><option value="09:30">09:30 hrs</option><option value="10:00">10:00 hrs</option><option value="10:30">10:30 hrs</option><option value="11:00">11:00 hrs</option>`;
            }
            if (modalCita) modalCita.classList.add('active');
        }

        if (e.target && e.target.id === 'btnAbrirExpModal') {
            e.preventDefault();
            if (modalExp) modalExp.classList.add('active');
        }

        if (e.target && e.target.id === 'btnCancelarExpModal') {
            if (modalExp) modalExp.classList.remove('active');
            document.getElementById('formNuevoExpedienteModal').reset();
        }

        if (e.target && e.target.classList.contains('btn-baja-empleado')) {
            const fila = e.target.closest('tr');
            fila.remove();
        }

        if (e.target && e.target.classList.contains('btn-ver-expediente')) {
            const paciente = e.target.getAttribute('data-paciente');
            const historial = e.target.getAttribute('data-historial');
            alert(`📂 HISTORIAL CLÍNICO AUDITADO\n\nPaciente: ${paciente}\n\nResumen Clínico:\n${historial}`);
        }

        if (e.target && e.target.classList.contains('btn-filter-reporte')) {
            const todosLosBotones = document.querySelectorAll('.btn-filter-reporte');
            todosLosBotones.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            const lapso = e.target.getAttribute('data-lapso');
            inicializarGraficaReporteIngresos(lapso);
        }

        if (e.target && e.target.id === 'btnBuscarNotas') {
            const query = document.getElementById('searchPacienteNota').value.trim().toLowerCase();
            const dbPacientes = JSON.parse(localStorage.getItem('dbPacientes') || '[]');
            const dbNotas = JSON.parse(localStorage.getItem('dbNotas') || '[]');
            const contenedorResultados = document.getElementById('resultadosNotasHistorial');

            const pacienteEncontrado = dbPacientes.find(p => p.id === query || p.nombre.toLowerCase().includes(query));

            if (!pacienteEncontrado) {
                contenedorResultados.innerHTML = `<p style="color:#ef4444; font-weight:600; padding:1rem;">No se encontró ningún expediente clínico.</p>`;
                return;
            }

            const notesFiltradas = dbNotas.filter(n => n.idPaciente === pacienteEncontrado.id);
            let htmlNotas = `
                <div style="background:#f8fafc; padding:1rem; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:1rem;">
                    <strong>Paciente:</strong> ${pacienteEncontrado.nombre} ${pacienteEncontrado.apellido} (ID: #${pacienteEncontrado.id})<br>
                    <strong>Antecedentes:</strong> ${pacienteEncontrado.condiciones || 'Ninguno'}
                </div>
            `;

            if (notesFiltradas.length === 0) {
                htmlNotas += `<p style="color:#64748b; font-style:italic;">No hay notas de evolución registradas para este paciente.</p>`;
            } else {
                notesFiltradas.forEach(n => {
                    htmlNotas += `
                        <div style="background:#ffffff; padding:1rem; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:0.75rem;">
                            <small style="color:#0284c7; font-weight:700;">Fecha: ${n.fecha}</small>
                            <p style="margin:0.5rem 0 0 0; color:#334155;">${n.texto}</p>
                        </div>
                    `;
                });
            }
            contenedorResultados.innerHTML = htmlNotas;
        }

        if (e.target && e.target.id === 'btnBuscarRecetaPaciente') {
            const query = document.getElementById('recetaIdPaciente').value.trim();
            const dbPacientes = JSON.parse(localStorage.getItem('dbPacientes') || '[]');
            const paciente = dbPacientes.find(p => p.id === query);

            if (paciente) {
                document.getElementById('recetaNombreCompleto').value = `${paciente.nombre} ${paciente.apellido}`;
                document.getElementById('recetaEdad').value = paciente.edad;
                document.getElementById('recetaAntecedentes').value = paciente.condiciones;
                alert("Datos clínicos del expediente cargados automáticamente.");
            } else {
                alert("No se encontró el ID de paciente.");
            }
        }

        if (e.target && e.target.id === 'btnImprimirRecetaCompleta') {
            const nombre = document.getElementById('recetaNombreCompleto').value;
            const edad = document.getElementById('recetaEdad').value;
            const sintomas = document.getElementById('recetaSintomas').value;
            const tratamiento = document.getElementById('recetaTratamiento').value;

            if (nombre && sintomas && tratamiento) {
                const ventanaImpresion = window.open('', '_blank');
                ventanaImpresion.document.write(`<html><head><title>MediCore Systems - Receta Médica</title><style>body { font-family: sans-serif; padding: 3rem; color: #333; } .header { border-bottom: 2px solid #0284c7; padding-bottom: 1rem; margin-bottom: 2rem; } .section { margin-bottom: 1.5rem; } .label { font-weight: bold; color: #0284c7; }</style></head><body><div class="header"><h2>MEDICORE SYSTEMS - RECETA MÉDICA</h2><p>Atención Médica Especializada</p></div><div class="section"><strong>Paciente:</strong> ${nombre} &nbsp;&nbsp;&nbsp;&nbsp; <strong>Edad:</strong> ${edad} años</div><div class="section"><p class="label">Sintomatología Actual:</p><p>${sintomas}</p></div><div class="section"><p class="label">Tratamiento e Indicaciones:</p><p style="white-space: pre-line;">${treatment}</p></div><script>window.print();</script></body></html>`);
                ventanaImpresion.document.close();
            } else {
                alert("Por favor rellene los campos obligatorios de la receta.");
            }
        }
    });

    document.addEventListener('submit', async (e) => {
        if (e.target && e.target.id === 'formConfigAgenda') {
            e.preventDefault();
            alert(`⚙️ Configuración Guardada con éxito.`);
        }

        // 👑 SECCIÓN MODIFICADA: ALTA DE EMPLEADOS CONECTADA A LA API DE RENDER
        if (e.target && e.target.id === 'formAltaPersonal') {
            e.preventDefault();
            
            const nombre = document.getElementById('empNombre').value.trim();
            const email = document.getElementById('empEmail').value.trim();
            const password = document.getElementById('empPassword').value;
            const rol = document.getElementById('empRol').value;
            const area = document.getElementById('empArea').value.trim();
            const tabla = document.querySelector('.modular-table tbody');

            // Expresiones regulares de validación estricta corporativa
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

            if (!emailRegex.test(email)) {
                alert('Por favor, ingresa un correo electrónico corporativo válido.');
                document.getElementById('empEmail').focus();
                return;
            }

            if (!passwordRegex.test(password)) {
                alert('La contraseña provisional debe contener mínimo 8 caracteres, una mayúscula, una minúscula y un número.');
                document.getElementById('empPassword').focus();
                return;
            }

            // ✨ NUEVA FUNCIÓN: Homologar roles estrictamente para evitar fallos de login por mayúsculas o acentos
            let rolLimpio = 'medico';
            if (rol.toLowerCase().includes('admin')) rolLimpio = 'admin';
            if (rol.toLowerCase().includes('finan')) rolLimpio = 'finanzas';

            try {
                // Envío asíncrono en tiempo real a PostgreSQL en Render
                const respuesta = await fetch('https://medicore-backend-g1p2.onrender.com/api/registro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombre: nombre,
                        email: email,
                        password: password,
                        role: rolLimpio // 👈 Envía estrictamente 'admin', 'medico' o 'finanzas'
                    })
                });

                const resultado = await respuesta.json();

                if (resultado.success) {
                    alert(`✅ Empleado registrado con éxito en la nube.\nEl usuario '${email}' ya tiene autorización para ingresar al sistema.`);
                    
                    if (tabla) {
                        const nuevaFila = document.createElement('tr');
                        nuevaFila.innerHTML = `<td><strong>${rol.toUpperCase()}</strong></td><td>${nombre}</td><td>${area}</td><td><span style="color:#16a34a; font-weight:600;">Activo</span></td><td><button class="btn-action-view btn-baja-empleado" style="border:1px solid #ef4444; color:#ef4444; background:transparent; padding:4px 8px; border-radius:6px; cursor:pointer;">Dar de Baja</button></td>`;
                        tabla.appendChild(nuevaFila);
                    }
                    e.target.reset();
                } else {
                    alert(`❌ Error al guardar en la nube: ${resultado.message}`);
                }

            } catch (error) {
                console.error('Error al conectar con la API de Render:', error);
                alert('❌ Error de red: No se pudo conectar con el servidor en Render. Comprueba que el backend no esté dormido.');
            }
        }

        if (e.target && e.target.id === 'formAltaFinanzas') {
            e.preventDefault();
            const tipo = document.getElementById('finTipo').value;
            const servicio = document.getElementById('finServicio').value.trim();
            const hora = document.getElementById('finHora').value;
            const monto = parseFloat(document.getElementById('finMonto').value);
            const tabla = document.querySelector('.modular-table tbody');
            if (tabla) {
                const nuevaFila = document.createElement('tr');
                const colorMonto = tipo === 'cobro' ? '#16a34a' : '#ef4444';
                const signo = tipo === 'cobro' ? '+' : '-';
                nuevaFila.innerHTML = `<td>${hora} hrs</td><td>${tipo === 'cobro' ? 'Cobro:' : 'Gasto:'} ${servicio}</td><td><strong style="color:${colorMonto}">${signo} $${monto.toFixed(2)} MXN</strong></td>`;
                tabla.appendChild(nuevaFila);
                e.target.reset();
            }
        }

        if (e.target && e.target.id === 'formNuevoExpedienteModal') {
            e.preventDefault();
            const nombre = document.getElementById('expNombre').value.trim();
            const apellido = document.getElementById('expApellido').value.trim();
            const edad = document.getElementById('expEdad').value;
            const nacimiento = document.getElementById('expNacimiento').value;
            const ingreso = document.getElementById('expIngreso').value;
            const egreso = document.getElementById('expEgreso').value;
            const diagIngreso = document.getElementById('expDiagIngreso').value.trim();
            const diagEgreso = document.getElementById('expDiagEgreso').value.trim();
            const otros = document.getElementById('expOtros').value.trim();

            let checkboxes = document.querySelectorAll('.expAlergiaCheck:checked');
            let condicionesArr = [];
            checkboxes.forEach(cb => condicionesArr.push(cb.value));
            if (otros) condicionesArr.push(otros);

            const nuevoId = Math.floor(1000 + Math.random() * 9000).toString();
            const nuevoPaciente = {
                id: nuevoId, nombre, apellido, edad, nacimiento, ingreso, egreso: egreso || 'N/A', diagIngreso, diagEgreso: diagEgreso || 'En Tratamiento', condiciones: condicionesArr.join(', ') || 'Ninguna'
            };

            const dbPacientes = JSON.parse(localStorage.getItem('dbPacientes') || '[]');
            dbPacientes.push(nuevoPaciente);
            localStorage.setItem('dbPacientes', JSON.stringify(dbPacientes));

            alert(`✅ Expediente creado con éxito.\nNúmero de Paciente: #${nuevoId}`);
            if (modalExp) modalExp.classList.remove('active');
            e.target.reset();

            const tablaExp = document.getElementById('cuerpoTablaExpedientes');
            if (tablaExp) {
                tablaExp.innerHTML += `<tr><td><strong>#${nuevoPaciente.id}</strong></td><td>${nuevoPaciente.nombre} ${nuevoPaciente.apellido}</td><td>${nuevoPaciente.diagIngreso}</td><td><button class="btn-action-view btn-ver-expediente" data-paciente="${nuevoPaciente.nombre} ${nuevoPaciente.apellido}" data-historial="Ingreso: ${nuevoPaciente.ingreso}." style="background:#0284c7; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer;">Auditar Historial</button></td></tr>`;
            }
        }

        if (e.target && e.target.id === 'formGuardarNotaEvolucion') {
            e.preventDefault();
            const query = document.getElementById('searchPacienteNota').value.trim().toLowerCase();
            const textoNota = document.getElementById('txtAreaEvolucionSOAP').value.trim();
            const dbPacientes = JSON.parse(localStorage.getItem('dbPacientes') || '[]');
            const paciente = dbPacientes.find(p => p.id === query || p.nombre.toLowerCase().includes(query));

            if (!paciente) {
                alert("Por favor busque un paciente válido.");
                return;
            }

            const nuevaNota = { idPaciente: paciente.id, fecha: new Date().toLocaleDateString('es-MX'), texto: textoNota };
            const dbNotas = JSON.parse(localStorage.getItem('dbNotas') || '[]');
            dbNotas.push(nuevaNota);
            localStorage.setItem('dbNotas', JSON.stringify(dbNotas));

            alert("✅ Nota firmada y guardada.");
            document.getElementById('txtAreaEvolucionSOAP').value = '';
            document.getElementById('btnBuscarNotas').click();
        }
    });

    if (btnCancelarModal) {
        btnCancelarModal.addEventListener('click', () => {
            modalCita.classList.remove('active');
            formCitaModal.reset();
        });
    }

    if (formCitaModal) {
        formCitaModal.addEventListener('submit', (e) => {
            e.preventDefault();
            modalCita.classList.remove('active');
            formCitaModal.reset();
        });
    }

    function inicializarGraficaOperacionesCaja() {
        const ctx = document.getElementById('graficaOperacionesCaja');
        if (!ctx) return;
        miGraficaCaja = new Chart(ctx, {
            type: 'line',
            data: {
                labels: etiquetasGraficaCaja,
                datasets: [{ label: 'Flujo Neto ($)', data: datosGraficaCaja, backgroundColor: 'rgba(2,132,199,0.1)', borderColor: '#0284c7', borderWidth: 2, tension: 0.3, fill: true }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    let miGraficaReportes = null;
    function inicializarGraficaReporteIngresos(lapso) {
        const ctx = document.getElementById('graficaReporteIngresosGlobal');
        if (!ctx) return;
        if (miGraficaReportes) miGraficaReportes.destroy();

        miGraficaReportes = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                datasets: [{ label: 'Ingresos ($)', data: [8500, 9200, 7400, 11000, 13400, 5000], backgroundColor: 'rgba(20,184,166,0.8)' }, { label: 'Gastos ($)', data: [4200, 1800, 5100, 2300, 6800, 1200], backgroundColor: 'rgba(239,68,68,0.8)' }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
});

// ==========================================================================
// VISTAS Y PLANTILLAS RENDERIZABLES (SPA CORE)
// ==========================================================================
function obtenerModuloExpedientes() {
    const dbPacientes = JSON.parse(localStorage.getItem('dbPacientes') || '[]');
    let filas = '';
    dbPacientes.forEach(p => {
        filas += `<tr><td><strong>#${p.id}</strong></td><td>${p.nombre} ${p.apellido}</td><td>${p.diagIngreso || p.diagEgreso}</td><td><button class="btn-action-view btn-ver-expediente" data-paciente="${p.nombre} ${p.apellido}" data-historial="Ingreso: ${p.ingreso}. Diagnóstico base: ${p.diagIngreso}. Condiciones: ${p.condiciones}" style="background:#0284c7; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:600;">Auditar Historial</button></td></tr>`;
    });

    return `
        <div class="module-wrapper">
            <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
                <button id="btnAbrirExpModal" style="background-color: #0284c7; color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer;">+ Crear Expediente</button>
            </div>
            <table class="modular-table" style="width:100%; text-align:left;">
                <thead><tr><th>ID Exp</th><th>Paciente</th><th>Diagnóstico Base</th><th>Historial de Consultas</th></tr></thead>
                <tbody id="cuerpoTablaExpedientes">${filas}</tbody>
            </table>
        </div>
    `;
}

function obtenerModuloRecetaDigital() {
    return `
        <div class="module-wrapper" style="background:#ffffff; padding:2rem; border-radius:12px; border:1px solid #e2e8f0;">
            <h4 style="margin:0 0 1rem 0; color:#1e293b; font-weight:700;">Prescripción de Medicamentos y Tratamiento</h4>
            <div style="display:flex; gap:1rem; margin-bottom:1.5rem; background:#f8fafc; padding:1rem; border-radius:8px; border:1px solid #e2e8f0;">
                <input type="text" id="recetaIdPaciente" placeholder="ID de Paciente (Opcional)" style="padding:8px; border-radius:6px; border:1px solid #ccc; width:200px;">
                <button id="btnBuscarRecetaPaciente" style="background:#1e293b; color:white; padding:8px 16px; border:none; border-radius:6px; cursor:pointer; font-weight:600;">Autocompletar Datos</button>
            </div>
            <form id="formRecetaDigitalEstructurada">
                <div style="display:grid; grid-template-columns:2fr 1fr 2fr; gap:1rem; margin-bottom:1.25rem;">
                    <div><label style="font-size:0.85rem; font-weight:600;">Nombre Completo</label><input type="text" id="recetaNombreCompleto" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc; margin-top:4px;" required></div>
                    <div><label style="font-size:0.85rem; font-weight:600;">Edad (Años)</label><input type="number" id="recetaEdad" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc; margin-top:4px;" required></div>
                    <div><label style="font-size:0.85rem; font-weight:600;">Antecedentes</label><input type="text" id="recetaAntecedentes" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc; margin-top:4px; background:#f1f5f9;" readonly></div>
                </div>
                <div style="display:flex; flex-direction:column; gap:0.4rem; margin-bottom:1.25rem;">
                    <label style="font-size:0.85rem; font-weight:600;">Sintomatología Actual</label>
                    <input type="text" id="recetaSintomas" style="padding:8px; border-radius:6px; border:1px solid #ccc;" placeholder="Ej. Dolor de cabeza, fiebre..." required>
                </div>
                <div style="display:flex; flex-direction:column; gap:0.4rem; margin-bottom:1.5rem;">
                    <label style="font-size:0.85rem; font-weight:600;">Medicamentos y Tratamientos</label>
                    <textarea id="recetaTratamiento" style="width:100%; height:100px; padding:8px; border-radius:6px; border:1px solid #ccc; resize:none; font-family:inherit;" placeholder="Dosificación e indicaciones..." required></textarea>
                </div>
                <button type="button" id="btnImprimirRecetaCompleta" style="background:#14b8a6; color:white; border:none; padding:10px 20px; border-radius:8px; font-weight:700; cursor:pointer;">Crear Documento e Imprimir Receta</button>
            </form>
        </div>
    `;
}

function obtenerModuloNotas() { 
    return `
        <div class="module-wrapper" style="background:#ffffff; padding:1.5rem; border-radius:12px; border:1px solid #e2e8f0;">
            <h4 style="margin:0 0 1rem 0; color:#1e293b;">Búsqueda e Historial Clínico de Notas</h4>
            <div style="display:flex; gap:1rem; margin-bottom:1.5rem;">
                <input type="text" id="searchPacienteNota" placeholder="ID de Paciente o Nombre..." style="flex:1; padding:10px; border-radius:8px; border:1px solid #ccc;"><button id="btnBuscarNotas" style="background:#0284c7; color:white; padding:10px 20px; border:none; border-radius:8px; font-weight:700; cursor:pointer;">Buscar Historial</button>
            </div>
            <div id="resultadosNotasHistorial" style="margin-bottom:1.5rem;"><p style="color:#64748b; font-style:italic;">Realice una búsqueda para auditar o añadir notas.</p></div>
            <h4 style="margin:1.5rem 0 0.5rem 0; color:#1e293b;">Nueva Nota de Evolución (SOAP)</h4>
            <form id="formGuardarNotaEvolucion">
                <textarea id="txtAreaEvolucionSOAP" placeholder="Redacte la evolución clínica..." style="width:100%; height:120px; padding:10px; border-radius:8px; border:1px solid #ccc; font-family:inherit; resize:none; margin-bottom:1rem;" required></textarea>
                <button type="submit" style="background:#14b8a6; color:white; padding:10px 20px; border:none; border-radius:8px; font-weight:700; cursor:pointer;">Firmar y Anexar Nota</button>
            </form>
        </div>
    `; 
}

function obtenerModuloGestionPersonal() {
    return `
        <div class="module-wrapper">
            <div style="background:#ffffff; padding:1.5rem; border-radius:12px; border:1px solid #e2e8f0; margin-bottom:1.5rem;">
                <h4 style="margin:0 0 1rem 0; color:#1e293b; font-weight:700;">Dar de Alta Nuevo Empleado</h4>
                <form id="formAltaPersonal" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; align-items:end;">
                    <div><label style="font-size:0.8rem; font-weight:600;">Nombre Completo</label><input type="text" id="empNombre" placeholder="Dr. Felipe Galván" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc; margin-top:4px;" required></div>
                    <div><label style="font-size:0.8rem; font-weight:600;">Correo Electrónico (Usuario)</label><input type="email" id="empEmail" placeholder="felipe@medicore.com" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc; margin-top:4px;" required></div>
                    <div><label style="font-size:0.8rem; font-weight:600;">Contraseña Acceso</label><input type="password" id="empPassword" placeholder="Contraseña de 8+ carac." style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc; margin-top:4px;" required></div>
                    <div><label style="font-size:0.8rem; font-weight:600;">Rol Asignado</label><select id="empRol" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc; margin-top:4px;"><option value="Médico">Médico</option><option value="Finanzas">Finanzas</option><option value="Admin">Admin</option></select></div>
                    <div><label style="font-size:0.8rem; font-weight:600;">Área / Especialidad</label><input type="text" id="empArea" placeholder="Pediatría" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc; margin-top:4px;" required></div>
                    <button type="submit" style="background:#0284c7; color:white; border:none; padding:10px 16px; border-radius:6px; font-weight:600; cursor:pointer; height:38px;">Registrar</button>
                </form>
            </div>
            <table class="modular-table" style="width:100%; text-align:left; border-collapse:collapse;">
                <thead><tr><th style="padding:10px;">Rol</th><th style="padding:10px;">Nombre del Empleado</th><th style="padding:10px;">Especialidad</th><th style="padding:10px;">Estado</th><th style="padding:10px;">Acciones</th></tr></thead>
                <tbody>
                    <tr><td style="padding:10px;"><strong>ADMINISTRADOR</strong></td><td style="padding:10px;">Dr. Leobardo Farías Hernández</td><td style="padding:10px;">Traumatología</td><td><span style="color:#16a34a; font-weight:600;">Activo</span></td><td><button class="btn-action-view" style="border:1px solid #ccc; color:#777; background:transparent; padding:4px 8px; border-radius:6px; cursor:not-allowed;" disabled>Principal</button></td></tr>
                </tbody>
            </table>
        </div>
    `;
}

function obtenerModuloFinanzasReportes() {
    return `
        <div class="module-wrapper">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                <div class="table-filters-bar" style="display:flex; gap:0.5rem;">
                    <button class="filter-btn btn-filter-reporte" data-lapso="dia" style="padding:6px 12px; cursor:pointer; font-weight:600; border-radius:6px; border:1px solid #ccc;">Por Día</button>
                    <button class="filter-btn btn-filter-reporte active" data-lapso="semana" style="padding:6px 12px; cursor:pointer; font-weight:600; border-radius:6px; border:1px solid #ccc; background:#14b8a6; color:white;">Por Semana</button>
                    <button class="filter-btn btn-filter-reporte" data-lapso="mes" style="padding:6px 12px; cursor:pointer; font-weight:600; border-radius:6px; border:1px solid #ccc;">Por Mes</button>
                </div>
                <button style="background:#1e293b; color:white; padding:8px 16px; border:none; border-radius:6px; font-weight:600; cursor:pointer;" onclick="alert('Balance exportado.')">Exportar Balance</button>
            </div>
            <div style="background:#ffffff; padding:1.5rem; border-radius:12px; border:1px solid #e2e8f0; height:320px; margin-bottom:1.5rem;"><canvas id="graficaReporteIngresosGlobal"></canvas></div>
        </div>
    `;
}

function obtenerModuloAgendaMedico() { return `<div class="module-wrapper"><div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;"><button class="btn-trigger-appointment" style="background-color: #0284c7; color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer;">+ Nueva Cita</button></div><table class="modular-table" style="width:100%; text-align:left; border-collapse:collapse;"><thead><tr><th>Horario</th><th>Paciente / Expediente</th><th>Motivo de Consulta</th><th>Estado</th></tr></thead><tbody><tr><td><strong style="color:#0284c7;">09:00 hrs</strong></td><td>Carlos Mendoza Ruiz <br><small style="color:var(--text-muted)">Exp: #1042</small></td><td>Consulta de seguimiento general</td><td><span style="background:#dcfce7; color:#15803d; padding:4px 8px; border-radius:4px; font-size:0.8rem; font-weight:600;">Atendido</span></td></tr></tbody></table></div>`; }
function obtenerModuloCaja() { return `<div class="module-wrapper"><div style="background:#ffffff; padding:1.5rem; border-radius:12px; border:1px solid #e2e8f0; margin-bottom:1.5rem;"><h4 style="margin:0 0 1rem 0; color:#1e293b; font-weight:700;">Registrar Operación de Caja</h4><form id="formAltaFinanzas" style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr auto; gap:1rem; align-items:end;"><div><label style="font-size:0.8rem; font-weight:600;">Tipo Movimiento</label><select id="finTipo" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc; margin-top:4px;"><option value="cobro">Cobro (Ingreso)</option><option value="gasto">Gasto (Egreso)</option></select></div><div><label style="font-size:0.8rem; font-weight:600;">Servicio / Concepto</label><input type="text" id="finServicio" placeholder="Ej. Consulta General" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc; margin-top:4px;" required></div><div><label style="font-size:0.8rem; font-weight:600;">Horario</label><input type="time" id="finHora" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc; margin-top:4px;" required></div><div><label style="font-size:0.8rem; font-weight:600;">Monto</label><input type="number" id="finMonto" placeholder="650" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc; margin-top:4px;" required></div><button type="submit" style="background:#0284c7; color:white; border:none; padding:10px 16px; border-radius:6px; font-weight:600; cursor:pointer;">Procesar</button></form></div><div style="background:#ffffff; padding:1rem; border-radius:12px; border:1px solid #e2e8f0; margin-bottom:1.5rem; height:240px;"><canvas id="graficaOperacionesCaja"></canvas></div></div>`; }
function obtenerModuloConfigClinica() { return `<div class="module-wrapper" style="background:#ffffff; padding:2rem; border-radius:12px; border:1px solid #e2e8f0;"><h4 style="margin:0 0 1rem 0; color:#1e293b;">Parametrización Operativa de la Agenda</h4><form id="formConfigAgenda" style="display:flex; flex-direction:column; gap:1.25rem; max-width:400px;"><div style="display:flex; flex-direction:column; gap:0.4rem;"><label style="font-weight:600; font-size:0.85rem;">Jornada de Trabajo</label><select id="cfgDias" style="padding:8px; border-radius:6px; border:1px solid #ccc;"><option value="lunes a viernes">Lunes a Viernes</option></select></div><div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;"><div style="display:flex; flex-direction:column; gap:0.4rem;"><label style="font-weight:600; font-size:0.85rem;">Hora Apertura</label><input type="time" id="cfgInicio" value="08:00" style="padding:8px; border-radius:6px; border:1px solid #ccc;"></div><div style="display:flex; flex-direction:column; gap:0.4rem;"><label style="font-weight:600; font-size:0.85rem;">Hora Cierre</label><input type="time" id="cfgFin" value="18:00" style="padding:8px; border-radius:6px; border:1px solid #ccc;"></div></div><button type="submit" style="background:#0284c7; color:white; border:none; padding:10px; border-radius:6px; font-weight:700; cursor:pointer; margin-top:0.5rem;">Guardar Parámetros de Agenda</button></form></div>`; }
function obtenerModuloAdminDashboard() { return `<div class="module-wrapper"><div style="display:flex; gap:1rem; margin-bottom:1.5rem;"><div style="background:#f8fafc; padding:1rem; border:1px solid #e2e8f0; border-radius:8px; flex:1;"><span>Pacientes en Sistema</span><br><strong>1,240 Casos</strong></div><div style="background:#f8fafc; padding:1rem; border:1px solid #e2e8f0; border-radius:8px; flex:1;"><span>Personal Activo</span><br><strong>14 Profesionales</strong></div><div style="background:#f8fafc; padding:1rem; border:1px solid #e2e8f0; border-radius:8px; flex:1;"><span>Recaudación Total</span><br><strong style="color:#14b8a6;">$92,300.00 MXN</strong></div></div><div style="padding:1.5rem; background:#f0fdf4; border:1px dashed #16a34a; border-radius:8px; color:#166534; font-size:0.9rem;">Consola de Supervisión Central: MediCore Systems.</div></div>`; }