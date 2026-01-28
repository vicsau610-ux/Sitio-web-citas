// Función para cambiar de pantalla
function cambiarPantalla(pantallaId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(pantallaId).classList.add('active');
}

// Gestión de selección de tipo de denuncia
document.querySelectorAll('.tipo-card').forEach(card => {
    card.addEventListener('click', () => {
        const tipo = card.getAttribute('data-tipo');
        const tipoNombres = {
            'laboral': 'Denuncia Laboral',
            'academico': 'Denuncia Académica',
            'comunitario': 'Denuncia Comunitaria'
        };
        
        // Establecer el tipo en el formulario
        document.getElementById('tipo').value = tipo;
        document.getElementById('tipoSeleccionadoTitulo').textContent = tipoNombres[tipo] || 'Denuncia';
        
        // Cambiar a la pantalla del formulario
        cambiarPantalla('denuncia-tab');
    });
});

// Botón volver al inicio desde el formulario
document.getElementById('volverBtn').addEventListener('click', () => {
    cambiarPantalla('inicio-screen');
    document.getElementById('denunciaForm').reset();
    document.getElementById('fecha').valueAsDate = new Date();
    document.getElementById('archivosSeleccionados').innerHTML = '';
});

// Botón ver denuncias
document.getElementById('verDenunciasBtn').addEventListener('click', () => {
    cambiarPantalla('ver-tab');
    mostrarDenuncias();
});

// Botón volver al inicio desde ver denuncias
document.getElementById('volverInicioBtn').addEventListener('click', () => {
    cambiarPantalla('inicio-screen');
});

// Botón crear usuario
document.getElementById('crearUsuarioBtn').addEventListener('click', () => {
    cambiarPantalla('crear-usuario-screen');
});

// Botón volver desde crear usuario
document.getElementById('volverUsuarioBtn').addEventListener('click', () => {
    cambiarPantalla('inicio-screen');
    document.getElementById('usuarioForm').reset();
});

// Manejo del formulario de usuario
document.getElementById('usuarioForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    
    // Validar que las contraseñas coincidan
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden. Por favor, verifica e intenta nuevamente.');
        return;
    }
    
    // Deshabilitar botón y mostrar carga
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creando...';
    
    try {
        const formData = {
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value || null,
            password: password
        };
        
        const response = await crearUsuario(formData);
        
        if (response.success) {
            alert('✅ Usuario creado exitosamente. Ya puedes iniciar sesión.');
            cambiarPantalla('inicio-screen');
            e.target.reset();
        } else {
            alert('Error: ' + (response.message || 'No se pudo crear el usuario'));
        }
    } catch (error) {
        console.error('Error:', error);
        try {
            const errorResponse = await error.response?.json();
            if (errorResponse && errorResponse.message) {
                alert('Error: ' + errorResponse.message);
            } else {
                alert('Error de conexión. Asegúrate de que el servidor esté corriendo.');
            }
        } catch {
            alert('Error de conexión. Asegúrate de que el servidor esté corriendo.');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Manejo del formulario
document.getElementById('denunciaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    
    // Deshabilitar botón y mostrar carga
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    
    try {
        const formData = new FormData(e.target);
        const denunciaId = generarId();
        
        // Agregar datos de la denuncia al FormData
        formData.append('id', denunciaId);
        formData.append('fechaRegistro', new Date().toISOString());
        
        // Si no hay archivos, agregar un valor por defecto
        const archivos = formData.getAll('evidencia');
        if (archivos.length === 0 || (archivos.length === 1 && archivos[0].size === 0)) {
            formData.delete('evidencia');
        }
        
        // Guardar denuncia en la base de datos con archivos
        const response = await guardarDenuncia(formData);
        
        if (response.success) {
            // Mostrar modal de confirmación
            document.getElementById('denunciaId').textContent = denunciaId;
            document.getElementById('successModal').style.display = 'block';
            
            // Limpiar formulario
            e.target.reset();
            document.getElementById('fecha').valueAsDate = new Date();
            document.getElementById('archivosSeleccionados').innerHTML = '';
        } else {
            alert('Error al guardar la denuncia. Por favor, intenta nuevamente.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión. Asegúrate de que el servidor esté corriendo.');
    } finally {
        // Restaurar botón
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Función para generar ID único
function generarId() {
    return 'DEN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// URL base de la API
const API_URL = 'http://localhost:3000/api';

// Crear usuario
async function crearUsuario(usuarioData) {
    try {
        const response = await fetch(`${API_URL}/usuarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(usuarioData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            // Crear un error con la respuesta para que pueda ser manejado
            const error = new Error(data.message || 'Error en la respuesta del servidor');
            error.response = { json: async () => data };
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error('Error al crear usuario:', error);
        throw error;
    }
}

// Guardar denuncia en la base de datos
async function guardarDenuncia(formData) {
    try {
        const response = await fetch(`${API_URL}/denuncias`, {
            method: 'POST',
            body: formData // No establecer Content-Type, el navegador lo hará automáticamente con FormData
        });
        
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error al guardar denuncia:', error);
        throw error;
    }
}

// Obtener todas las denuncias desde la base de datos
async function obtenerDenuncias(tipo = null) {
    try {
        let url = `${API_URL}/denuncias`;
        if (tipo) {
            url += `?tipo=${encodeURIComponent(tipo)}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Error al obtener las denuncias');
        }
        
        const data = await response.json();
        return data.success ? data.denuncias : [];
    } catch (error) {
        console.error('Error al obtener denuncias:', error);
        // Mostrar mensaje de error al usuario
        const denunciasList = document.getElementById('denunciasList');
        if (denunciasList) {
            denunciasList.innerHTML = '<p class="no-denuncias" style="color: #ff6b6b;">⚠️ Error al conectar con el servidor. Asegúrate de que el servidor esté corriendo.</p>';
        }
        return [];
    }
}

// Mostrar denuncias en la lista
async function mostrarDenuncias() {
    const filtroTipo = document.getElementById('filterTipo').value;
    const denunciasList = document.getElementById('denunciasList');
    
    // Mostrar indicador de carga
    denunciasList.innerHTML = '<p class="no-denuncias">Cargando denuncias...</p>';
    
    try {
        // Obtener denuncias desde la API (ya filtradas por tipo si es necesario)
        const denuncias = await obtenerDenuncias(filtroTipo || null);
        
        if (denuncias.length === 0) {
            denunciasList.innerHTML = '<p class="no-denuncias">No hay denuncias que coincidan con los filtros seleccionados.</p>';
            return;
        }
        
        denunciasList.innerHTML = denuncias.map(denuncia => `
            <div class="denuncia-card">
                <div class="denuncia-header">
                    <span class="denuncia-tipo">${denuncia.tipo}</span>
                    <div>
                        <div class="denuncia-fecha">📅 ${formatearFecha(denuncia.fecha)}</div>
                        <div class="denuncia-id">ID: ${denuncia.id}</div>
                    </div>
                </div>
                <div class="denuncia-info">
                    <strong>📍 Ubicación:</strong> ${denuncia.ubicacion}
                </div>
                <div class="denuncia-info">
                    <strong>👥 Personas Involucradas:</strong> ${denuncia.personas || 'No especificado'}
                </div>
                <div class="denuncia-info">
                    <strong>👁️ Testigos:</strong> ${denuncia.testigos || 'No especificado'}
                </div>
                <div class="denuncia-descripcion">
                    <strong>📝 Descripción:</strong><br>
                    ${denuncia.descripcion}
                </div>
                ${denuncia.evidencia && denuncia.evidencia !== 'No especificado' ? `
                <div class="denuncia-info" style="margin-top: 12px;">
                    <strong>ℹ️ Información Adicional:</strong> ${denuncia.evidencia}
                </div>
                ` : ''}
                <div class="denuncia-info" style="margin-top: 12px; color: #999; font-size: 0.85em;">
                    <strong>🕐 Registrada:</strong> ${formatearFechaCompleta(denuncia.fechaRegistro)}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error al mostrar denuncias:', error);
    }
}

// Formatear fecha
function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Formatear fecha completa con hora
function formatearFechaCompleta(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Filtro de tipo
document.getElementById('filterTipo').addEventListener('change', mostrarDenuncias);

// Botón limpiar filtros
document.getElementById('clearFilters').addEventListener('click', () => {
    document.getElementById('filterTipo').value = '';
    mostrarDenuncias();
});

// Cerrar modal
function closeModal() {
    document.getElementById('successModal').style.display = 'none';
    // Volver a la pantalla inicial después de cerrar el modal
    cambiarPantalla('inicio-screen');
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('successModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Cerrar modal con la X
document.querySelector('.close').addEventListener('click', closeModal);

// Establecer fecha de hoy por defecto en el campo de fecha
document.getElementById('fecha').valueAsDate = new Date();

// Mostrar archivos seleccionados
document.getElementById('evidencia').addEventListener('change', (e) => {
    const archivosSeleccionados = document.getElementById('archivosSeleccionados');
    const archivos = e.target.files;
    
    if (archivos.length === 0) {
        archivosSeleccionados.innerHTML = '';
        return;
    }
    
    let html = '<div style="margin-top: 10px; padding: 10px; background: #252525; border: 1px solid #333; border-radius: 6px;">';
    html += '<strong style="display: block; margin-bottom: 5px; color: #e0e0e0;">Archivos seleccionados (' + archivos.length + '):</strong>';
    
    Array.from(archivos).forEach((archivo, index) => {
        const tamañoMB = (archivo.size / (1024 * 1024)).toFixed(2);
        html += `<div style="font-size: 0.9em; color: #d0d0d0; margin: 3px 0;">
            ${index + 1}. ${archivo.name} (${tamañoMB} MB)
        </div>`;
    });
    
    html += '</div>';
    archivosSeleccionados.innerHTML = html;
});

// Manejo de botones de descarga
document.getElementById('downloadIOS').addEventListener('click', (e) => {
    // Aquí puedes cambiar la URL cuando tengas la app en App Store
    const iosUrl = 'https://apps.apple.com/app/your-app-id'; // Reemplazar con URL real
    // Por ahora, prevenir la navegación y mostrar mensaje
    e.preventDefault();
    alert('📱 La aplicación para iOS estará disponible pronto en el App Store.');
    // Cuando esté lista, descomentar la siguiente línea:
    // window.open(iosUrl, '_blank');
});

document.getElementById('downloadAndroid').addEventListener('click', (e) => {
    // Aquí puedes cambiar la URL cuando tengas la app en Google Play
    const androidUrl = 'https://play.google.com/store/apps/details?id=your.app.id'; // Reemplazar con URL real
    // Por ahora, prevenir la navegación y mostrar mensaje
    e.preventDefault();
    alert('📱 La aplicación para Android estará disponible pronto en Google Play.');
    // Cuando esté lista, descomentar la siguiente línea:
    // window.open(androidUrl, '_blank');
});

// Inicializar: asegurar que la pantalla inicial esté activa al cargar
if (!document.getElementById('inicio-screen').classList.contains('active')) {
    cambiarPantalla('inicio-screen');
}
