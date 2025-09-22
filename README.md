# Registro de Perfiles

Sistema de registro y control de perfiles TOP/BOT con límite de 60 registros por número de serie.

## Características

- ✅ Registro de perfiles con número de serie, modelo único, rol (TOP/BOT) y empleado
- ✅ Control automático de límite: máximo 60 registros por número de serie
- ✅ Validación de unicidad de modelo
- ✅ Fecha automática del sistema
- ✅ Interface moderna con fuente Poppins
- ✅ Estadísticas en tiempo real
- ✅ CRUD completo (Crear, Leer, Actualizar, Eliminar)
- ✅ Paginación en la lista de perfiles
- ✅ Validaciones del lado cliente y servidor

## Tecnologías

### Backend
- Node.js + Express
- MySQL
- Cors, dotenv

### Frontend
- React 18
- Vite
- CSS moderno con gradientes

## Instalación

### 1. Base de datos
```sql
-- Ejecutar el archivo init.sql en MySQL
-- Esto creará la base de datos y la tabla perfil
```

### 2. Backend
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Configuración

### Backend (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=registro_perfiles
PORT=3001
```

### Puertos
- Backend: http://localhost:3001
- Frontend: http://localhost:5173

## API Endpoints

### Perfiles
- `GET /api/perfiles` - Obtener todos los perfiles (con paginación)
- `POST /api/perfiles` - Crear nuevo perfil
- `GET /api/perfiles/:id` - Obtener perfil por ID
- `PUT /api/perfiles/:id` - Actualizar perfil
- `DELETE /api/perfiles/:id` - Eliminar perfil
- `GET /api/perfiles/count/:no_ser` - Obtener conteo por número de serie
- `GET /api/perfiles/stats/general` - Obtener estadísticas generales
- `GET /api/perfiles/models` - Obtener lista de modelos disponibles

## Validaciones

### Límite de registros
- Cada número de serie puede tener máximo 60 registros
- El sistema alertará cuando se acerque al límite
- Bloqueará registros adicionales cuando se alcance el límite

### Modelo único
- Cada modelo debe ser único en toda la base de datos
- Se valida tanto en cliente como servidor
- Campo con autocompletado de modelos sugeridos: MGH100 RCU, MGH100 BL7, IDB PLOCK, IDB MAIN, IDB IPTS, POWER PACK, MGH MOCI, MGH100 ESC, FCM 30W, MRR35, IAMM2, FRHC

### Campos requeridos
- Número de serie
- Modelo
- Rol (TOP/BOT)
- Empleado

## Base de datos

### Tabla: perfil
```sql
CREATE TABLE perfil(
    id INT AUTO_INCREMENT PRIMARY KEY,
    no_ser VARCHAR(250) NOT NULL,
    modelo VARCHAR(100) NOT NULL UNIQUE,
    rol ENUM('BOT','TOP') NOT NULL,
    fr DATE NOT NULL,
    empleado VARCHAR(250) NOT NULL
);
```

## Uso

1. **Registrar perfil**: Completar el formulario con todos los campos requeridos
2. **Ver lista**: Los perfiles se muestran en una tabla con paginación
3. **Editar**: Hacer clic en "Editar" en cualquier fila
4. **Eliminar**: Hacer clic en "Eliminar" (requiere confirmación)
5. **Estadísticas**: Se muestran automáticamente en la parte superior