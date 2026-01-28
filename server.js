const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar multer para guardar archivos
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB máximo por archivo
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|wmv|mp3|wav|ogg|m4a/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos multimedia (imágenes, videos, audios)'));
        }
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use('/uploads', express.static(uploadsDir));

// Inicializar base de datos
const dbPath = path.join(__dirname, 'denuncias.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('✅ Conectado a la base de datos SQLite');
        crearTabla();
    }
});

// Crear tablas si no existen
function crearTabla() {
    // Tabla de denuncias
    const queryDenuncias = `
        CREATE TABLE IF NOT EXISTS denuncias (
            id TEXT PRIMARY KEY,
            tipo TEXT NOT NULL,
            fecha TEXT NOT NULL,
            fechaRegistro TEXT NOT NULL,
            ubicacion TEXT NOT NULL,
            descripcion TEXT NOT NULL,
            personas TEXT,
            testigos TEXT,
            evidencia TEXT
        )
    `;
    
    db.run(queryDenuncias, (err) => {
        if (err) {
            console.error('Error al crear la tabla de denuncias:', err.message);
        } else {
            console.log('✅ Tabla de denuncias lista');
        }
    });
    
    // Tabla de usuarios
    const queryUsuarios = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            telefono TEXT,
            password TEXT NOT NULL,
            fechaCreacion TEXT NOT NULL
        )
    `;
    
    db.run(queryUsuarios, (err) => {
        if (err) {
            console.error('Error al crear la tabla de usuarios:', err.message);
        } else {
            console.log('✅ Tabla de usuarios lista');
        }
    });
}

// Endpoint para guardar una denuncia
app.post('/api/denuncias', upload.array('evidencia', 10), (req, res) => {
    const { id, tipo, fecha, fechaRegistro, ubicacion, descripcion, personas, testigos } = req.body;
    
    if (!id || !tipo || !fecha || !ubicacion || !descripcion) {
        return res.status(400).json({ 
            success: false, 
            message: 'Faltan campos requeridos' 
        });
    }
    
    // Procesar archivos subidos
    let archivosInfo = 'No especificado';
    if (req.files && req.files.length > 0) {
        archivosInfo = req.files.map(file => ({
            nombre: file.originalname,
            ruta: `/uploads/${file.filename}`,
            tipo: file.mimetype,
            tamaño: file.size
        })).map(f => `${f.nombre} (${(f.tamaño / 1024).toFixed(2)} KB)`).join(', ');
    }
    
    const query = `
        INSERT INTO denuncias (id, tipo, fecha, fechaRegistro, ubicacion, descripcion, personas, testigos, evidencia)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [id, tipo, fecha, fechaRegistro, ubicacion, descripcion, personas || 'No especificado', testigos || 'No especificado', archivosInfo], (err) => {
        if (err) {
            console.error('Error al guardar denuncia:', err.message);
            // Si hay error, eliminar archivos subidos
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    fs.unlinkSync(file.path);
                });
            }
            return res.status(500).json({ 
                success: false, 
                message: 'Error al guardar la denuncia' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Denuncia guardada exitosamente',
            id: id,
            archivos: req.files ? req.files.length : 0
        });
    });
});

// Endpoint para obtener todas las denuncias
app.get('/api/denuncias', (req, res) => {
    const tipo = req.query.tipo;
    
    let query = 'SELECT * FROM denuncias';
    let params = [];
    
    if (tipo) {
        query += ' WHERE tipo = ?';
        params.push(tipo);
    }
    
    query += ' ORDER BY fechaRegistro DESC';
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error al obtener denuncias:', err.message);
            return res.status(500).json({ 
                success: false, 
                message: 'Error al obtener las denuncias' 
            });
        }
        
        res.json({ 
            success: true, 
            denuncias: rows 
        });
    });
});

// Endpoint para obtener una denuncia por ID
app.get('/api/denuncias/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM denuncias WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error('Error al obtener denuncia:', err.message);
            return res.status(500).json({ 
                success: false, 
                message: 'Error al obtener la denuncia' 
            });
        }
        
        if (!row) {
            return res.status(404).json({ 
                success: false, 
                message: 'Denuncia no encontrada' 
            });
        }
        
        res.json({ 
            success: true, 
            denuncia: row 
        });
    });
});

// Endpoint para obtener estadísticas
app.get('/api/estadisticas', (req, res) => {
    const queries = {
        total: 'SELECT COUNT(*) as count FROM denuncias',
        porTipo: 'SELECT tipo, COUNT(*) as count FROM denuncias GROUP BY tipo'
    };
    
    db.get(queries.total, [], (err, totalRow) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
        }
        
        db.all(queries.porTipo, [], (err, tipoRows) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
            }
            
            res.json({
                success: true,
                estadisticas: {
                    total: totalRow.count,
                    porTipo: tipoRows
                }
            });
        });
    });
});

// Endpoint para crear un usuario
app.post('/api/usuarios', async (req, res) => {
    const { nombre, email, telefono, password } = req.body;
    
    if (!nombre || !email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Faltan campos requeridos (nombre, email, password)' 
        });
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false, 
            message: 'El formato del correo electrónico no es válido' 
        });
    }
    
    // Validar longitud de contraseña
    if (password.length < 6) {
        return res.status(400).json({ 
            success: false, 
            message: 'La contraseña debe tener al menos 6 caracteres' 
        });
    }
    
    // Verificar si el email ya existe
    db.get('SELECT * FROM usuarios WHERE email = ?', [email], async (err, row) => {
        if (err) {
            console.error('Error al verificar usuario:', err.message);
            return res.status(500).json({ 
                success: false, 
                message: 'Error al verificar el usuario' 
            });
        }
        
        if (row) {
            return res.status(400).json({ 
                success: false, 
                message: 'Este correo electrónico ya está registrado' 
            });
        }
        
        // Hashear la contraseña
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const fechaCreacion = new Date().toISOString();
            
            // Insertar usuario
            const query = `
                INSERT INTO usuarios (nombre, email, telefono, password, fechaCreacion)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            db.run(query, [nombre, email, telefono || null, hashedPassword, fechaCreacion], function(err) {
                if (err) {
                    console.error('Error al crear usuario:', err.message);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error al crear el usuario' 
                    });
                }
                
                res.json({ 
                    success: true, 
                    message: 'Usuario creado exitosamente',
                    usuarioId: this.lastID
                });
            });
        } catch (hashError) {
            console.error('Error al hashear contraseña:', hashError);
            return res.status(500).json({ 
                success: false, 
                message: 'Error al procesar la contraseña' 
            });
        }
    });
});

// Servir el archivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📝 Sistema de denuncias anónimas activo`);
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error al cerrar la base de datos:', err.message);
        } else {
            console.log('✅ Base de datos cerrada correctamente');
        }
        process.exit(0);
    });
});
