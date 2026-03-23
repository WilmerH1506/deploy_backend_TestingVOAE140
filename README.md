# API Artículo 140 - Sistema de Gestión de Horas VOAE

## 📋 Descripción del Proyecto

Este proyecto es una API REST desarrollada en Node.js con Express para la gestión del Sistema de Gestión de Horas VOAE (Vinculación con la Sociedad) de la Universidad Nacional Autónoma de Honduras (UNAH). El sistema permite la administración de actividades extracurriculares, registro de estudiantes, control de asistencias y cálculo de horas VOAE.

## 🏗️ Arquitectura del Sistema

El sistema está organizado siguiendo el patrón MVC (Model-View-Controller) y cuenta con las siguientes funcionalidades principales:

- **Gestión de Usuarios**: Administradores, estudiantes y supervisores
- **Gestión de Actividades**: Creación, modificación y seguimiento de actividades VOAE
- **Control de Asistencias**: Registro de entrada y salida con cálculo automático de horas
- **Sistema de Archivos**: Subida y gestión de documentos relacionados con actividades
- **Autenticación JWT**: Sistema seguro de autenticación y autorización
- **Documentación Swagger**: API documentada automáticamente

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución de JavaScript
- **Express.js** - Framework web minimalista
- **MySQL** - Base de datos relacional
- **JWT** - Autenticación y autorización
- **Bcrypt** - Encriptación de contraseñas
- **Zod** - Validación de esquemas

### Utilidades
- **Swagger** - Documentación automática de API
- **CORS** - Configuración de políticas de origen cruzado
- **Day.js** - Manipulación de fechas
- **UUID** - Generación de identificadores únicos
- **Resend** - Servicio de envío de emails

### DevOps
- **Docker** - Contenedorización de la base de datos
- **Docker Compose** - Orquestación de servicios

## 📁 Estructura del Proyecto

```
api-articulo140/
├── api/
│   ├── config/           # Configuraciones (DB, Swagger)
│   ├── controllers/      # Lógica de negocio
│   │   └── ActivitiesController/
│   ├── middlewares/      # Middlewares de autenticación y autorización
│   ├── models/           # Modelos de datos
│   │   └── activitiesModel/
│   ├── routes/           # Definición de rutas
│   │   └── activitiesRoutes/
│   ├── schemas/          # Validaciones con Zod
│   │   └── ActivitiesSchema/
│   └── utils/            # Utilidades y helpers
│       └── activities/   # Utilidades específicas de actividades
├── mySql-Docker/         # Scripts de inicialización de BD
├── docker-compose.yaml   # Configuración de Docker
├── server.js             # Punto de entrada de la aplicación
└── package.json          # Dependencias y scripts
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js (v18 o superior)
- Docker y Docker Compose
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/MelvinMajano/api-articulo140.git
cd api-articulo140
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y configura las variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones necesarias para la base de datos, servidor, JWT y servicios externos.

### 4. Iniciar la base de datos con Docker

```bash
docker-compose up -d
```

Esto iniciará un contenedor MySQL con la base de datos configurada y las tablas creadas automáticamente.

### 5. Iniciar el servidor

#### Modo desarrollo (con auto-reload):
```bash
npm run dev
```

#### Modo producción:
```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## 📚 Documentación de la API

La documentación de la API está definida en formato OpenAPI 3.0 en el archivo `api/swagger.yaml`. Una vez que el servidor esté ejecutándose, puedes acceder a la documentación interactiva de Swagger en:

```
http://localhost:4000/api-docs
```

La documentación incluye:
- Especificaciones completas de todos los endpoints
- Esquemas de datos detallados
- Ejemplos de requests y responses
- Información de autenticación JWT
- Agrupación por funcionalidades (Auth, Usuarios, Actividades, etc.)

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para la autenticación. Los endpoints protegidos requieren el header:

```
Authorization: Bearer <token>
```

### Roles de Usuario

- **admin**: Acceso completo al sistema
- **supervisor**: Gestión de actividades y estudiantes
- **student**: Acceso a sus propias actividades y registros

## 🗃️ Base de Datos

El sistema utiliza MySQL con las siguientes tablas principales:

- `users` - Información de usuarios (estudiantes, supervisores, admins)
- `degrees` - Carreras universitarias
- `activities` - Actividades VOAE
- `registrations` - Inscripciones de estudiantes a actividades
- `attendances` - Registro de asistencias
- `files` - Archivos adjuntos a actividades
- `activityScopes` - Ámbitos de las actividades (cultural, académico, etc.)

## 🔧 Scripts Disponibles

```bash
# Desarrollo con auto-reload
npm run dev

# Producción
npm start

# Instalar dependencias
npm install
```

## ⚙️ Configuración de Docker

El proyecto incluye un `docker-compose.yaml` que configura:

- **MySQL 8.0** en el puerto 3310
- Base de datos `articulo140` con usuario `sghvoae`
- Inicialización automática con el script `init.sql`
- Volumen persistente para los datos

## 🧪 Funcionalidades Principales

### Gestión de Actividades
- Crear, editar y eliminar actividades VOAE
- Asignar supervisores y establecer cupos
- Definir fechas, horas y ámbitos de actividades
- Control de estado (pendiente, en progreso, finalizada)

### Control de Asistencias
- Registro de entrada y salida de estudiantes
- Cálculo automático de horas VOAE otorgadas
- Validaciones de tiempo y solapamiento

### Gestión de Usuarios
- Registro y autenticación de usuarios
- Roles diferenciados (admin, supervisor, estudiante)
- Asociación con carreras universitarias

### Sistema de Archivos
- Subida de documentos relacionados con actividades
- Gestión de metadatos de archivos
- Validación de tipos y tamaños

## 🔒 Seguridad

- Autenticación JWT con tokens seguros
- Encriptación de contraseñas con bcrypt
- Middlewares de autorización por roles
- Validación de datos con Zod
- Configuración CORS adecuada

## 🚨 Solución de Problemas

### Error de conexión a la base de datos
1. Verifica que Docker esté ejecutándose
2. Confirma que el contenedor MySQL esté activo: `docker ps`
3. Revisa las variables de entorno en `.env`

### Puerto en uso
Si el puerto 3000 está ocupado, cambia la variable `PORT` en `.env`

### Problemas con JWT
Asegúrate de configurar una `JWT_SECRET` segura en las variables de entorno

## 👥 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 📞 Contacto

- **Repositorio**: [https://github.com/MelvinMajano/api-articulo140](https://github.com/MelvinMajano/api-articulo140)
- **Autor**: MelvinMajano

---

**Nota**: Este sistema está diseñado específicamente para la gestión de horas VOAE de la UNAH y sigue los reglamentos establecidos por la universidad para este tipo de actividades.