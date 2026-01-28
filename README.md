# AmonSafe - Sistema de Denuncias Anónimas

Sistema web completo para recibir y gestionar denuncias anónimas de una comunidad con base de datos SQLite.

## Características

- ✅ **Completamente anónimo**: No se guarda ninguna información personal
- 📝 **Formulario completo**: Captura todos los detalles relevantes del incidente
- 🔍 **Sistema de filtros**: Filtra denuncias por tipo
- 💾 **Base de datos SQLite**: Las denuncias se guardan de forma permanente
- 🚀 **API REST**: Backend con Node.js y Express
- 📱 **Diseño responsive**: Funciona en dispositivos móviles y escritorio
- 🎨 **Interfaz moderna**: Diseño atractivo y fácil de usar

## Requisitos Previos

- Node.js (versión 14 o superior)
- npm (viene incluido con Node.js)

## Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar el servidor:**
   ```bash
   npm start
   ```

3. **Abrir en el navegador:**
   - El servidor se iniciará en `http://localhost:3000`
   - Abre tu navegador y ve a esa dirección

## Cómo usar

1. Asegúrate de que el servidor esté corriendo (`npm start`)
2. Abre `http://localhost:3000` en tu navegador
3. Completa el formulario de denuncia con los detalles del incidente
4. Haz clic en "Enviar Denuncia"
5. Recibirás un ID de referencia único para tu denuncia
6. Usa la pestaña "Ver Denuncias" para revisar todas las denuncias registradas

## Tipos de Denuncias

- Acoso
- Violencia
- Discriminación
- Fraude
- Maltrato
- Negligencia
- Otro

## API Endpoints

El servidor expone los siguientes endpoints:

- `POST /api/denuncias` - Crear una nueva denuncia
- `GET /api/denuncias` - Obtener todas las denuncias (opcional: `?tipo=acoso` para filtrar)
- `GET /api/denuncias/:id` - Obtener una denuncia específica por ID
- `GET /api/estadisticas` - Obtener estadísticas de denuncias

## Estructura de Archivos

```
Sitio web citas/
├── index.html          # Página principal
├── styles.css          # Estilos del sitio
├── script.js           # Lógica del frontend
├── server.js            # Servidor Node.js/Express
├── package.json         # Dependencias del proyecto
├── denuncias.db        # Base de datos SQLite (se crea automáticamente)
└── README.md           # Este archivo
```

## Base de Datos

La aplicación usa SQLite, que se crea automáticamente al iniciar el servidor por primera vez. El archivo `denuncias.db` contendrá todas las denuncias.

### Estructura de la tabla `denuncias`:

- `id` (TEXT, PRIMARY KEY) - ID único de la denuncia
- `tipo` (TEXT) - Tipo de denuncia
- `fecha` (TEXT) - Fecha del incidente
- `fechaRegistro` (TEXT) - Fecha y hora de registro
- `ubicacion` (TEXT) - Ubicación del incidente
- `descripcion` (TEXT) - Descripción detallada
- `personas` (TEXT) - Personas involucradas
- `testigos` (TEXT) - Información de testigos
- `evidencia` (TEXT) - Información adicional

## Notas Importantes

- Las denuncias se guardan en la base de datos SQLite de forma permanente
- El archivo `denuncias.db` contiene todos los datos
- Todas las denuncias son completamente anónimas
- El servidor debe estar corriendo para que la aplicación funcione

## Solución de Problemas

**Error: "Error de conexión"**
- Asegúrate de que el servidor esté corriendo (`npm start`)
- Verifica que el puerto 3000 no esté siendo usado por otra aplicación

**Error al instalar dependencias**
- Asegúrate de tener Node.js instalado: `node --version`
- Intenta eliminar `node_modules` y `package-lock.json` y ejecuta `npm install` nuevamente

## Próximos Pasos (Opcional)

Para mejorar el sistema, podrías considerar:
- Agregar autenticación para administradores
- Sistema de notificaciones por email
- Exportación de denuncias a PDF/Excel
- Panel de administración con estadísticas
- Migración a PostgreSQL o MySQL para producción
- Implementar HTTPS para mayor seguridad
