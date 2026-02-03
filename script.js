// ================== CONFIGURACIÓN ==================
const API_URL = 'http://localhost/amonsafe'; // 👈 CAMBIA SOLO ESTO SI ES NECESARIO

// ================== CAMBIO DE PANTALLAS ==================
function cambiarPantalla(pantallaId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(pantallaId).classList.add('active');
}

// ================== SELECCIÓN DE TIPO ==================
document.querySelectorAll('.tipo-card').forEach(card => {
    card.addEventListener('click', () => {
        document.getElementById('tipo').value = card.dataset.tipo;
        cambiarPantalla('denuncia-tab');
    });
});

// ================== BOTONES ==================
document.getElementById('volverBtn').onclick = () => cambiarPantalla('inicio-screen');
document.getElementById('verDenunciasBtn').onclick = () => {
    cambiarPantalla('ver-tab');
    mostrarDenuncias();
};
document.getElementById('volverInicioBtn').onclick = () => cambiarPantalla('inicio-screen');
document.getElementById('crearUsuarioBtn').onclick = () => cambiarPantalla('crear-usuario-screen');
document.getElementById('volverUsuarioBtn').onclick = () => cambiarPantalla('inicio-screen');

// ================== CREAR USUARIO ==================
document.getElementById('usuarioForm').addEventListener('submit', async e => {
    e.preventDefault();

    const fd = new FormData(e.target);

    const res = await fetch(`${API_URL}/crear_usuario.php`, {
        method: 'POST',
        body: fd
    });

    const data = await res.json();

    if (data.success) {
        alert('Usuario creado');
        e.target.reset();
        cambiarPantalla('inicio-screen');
    } else {
        alert('Error al crear usuario');
    }
});

// ================== GUARDAR DENUNCIA ==================
document.getElementById('denunciaForm').addEventListener('submit', async e => {
    e.preventDefault();

    const fd = new FormData(e.target);
    fd.append('id_usuario', 1); // fijo para proyecto escolar

    const res = await fetch(`${API_URL}/guardar_denuncia.php`, {
        method: 'POST',
        body: fd
    });

    const data = await res.json();

    if (data.success) {
        document.getElementById('successModal').style.display = 'block';
        e.target.reset();
    } else {
        alert('Error al guardar denuncia');
    }
});

// ================== OBTENER DENUNCIAS ==================
async function obtenerDenuncias() {
    const res = await fetch(`${API_URL}/obtener_denuncias.php`);
    const data = await res.json();
    return data.denuncias || [];
}

// ================== MOSTRAR DENUNCIAS ==================
async function mostrarDenuncias() {
    const lista = document.getElementById('denunciasList');
    lista.innerHTML = 'Cargando...';

    const denuncias = await obtenerDenuncias();

    if (denuncias.length === 0) {
        lista.innerHTML = 'No hay denuncias';
        return;
    }

    lista.innerHTML = denuncias.map(d => `
        <div class="denuncia-card">
            <b>${d.categoria}</b><br>
            ${d.descripcion}<br>
            <small>${d.fecha}</small>
        </div>
    `).join('');
}

// ================== MODAL ==================
function closeModal() {
    document.getElementById('successModal').style.display = 'none';
    cambiarPantalla('inicio-screen');
}
document.querySelector('.close').onclick = closeModal;
window.onclick = e => {
    if (e.target.id === 'successModal') closeModal();
};

// ================== FECHA POR DEFECTO ==================
document.getElementById('fecha').valueAsDate = new Date();
