# Proyecto: API Sistema de control de horas articulo 140 IS

## 🧾 Objetivo
Desarrollar una API RESTful utilizando Node.js y Express que permita a la coordinación de Ingeniería en Sistemas, llevar el control de actividades de las horas del Articulo 140, con la finalidad de tener un portal de busqueda mas eficiente de los estudinates, para la entrega de las mismas.

---

## ✅ Requisitos Técnicos

- Node.js y Express.
- Base de datos MySQL.
- Autenticación con JWT.
- Encriptación de contraseñas con `bcrypt`.
- Protección de rutas mediante middlewares.
- Patrón MVC para la estructura del proyecto.
- Validación de datos.
- Manejo de errores con middleware centralizado.
- Variables de entorno con `dotenv`.
- Documentación de la API.

---

## 🧱 Estructura de Carpetas Sugerida

```
/api
  /controllers
  /models
  /routes
  /middlewares
  /config
  /utils
server.js
.env
```

---

## 🔐 Autenticación y Autorización

- Autenticación mediante JWT.
- `POST /api/auth/register`: Registro de usuario.
- `POST /api/auth/login`: Inicio de sesión.
- Middleware de autenticación (`verifyToken`) para rutas privadas.
- Middleware de autorización (`isAdmin`) para validar rol de administrador.
- Middleware de autorización (`isSupervisor`) para validar rol de supervisor de actividad.
- Middleware de autorización (`isStudent`) para validar rol de estudiante.

---

## 🧾 Funcionalidad por Rol

### Administrador (`rol: Administrador`)
- Registrar e iniciar sesión.
- Administrar (CRUD completo) de actividades a realizar.
- Validar no se pueden eliminar actividades que ya fueron aporbadas o que están en curso o si ya fueron finalziadas.
- poder visualizar asistencia de estudiantes.
- poder visualizar archivos adjuntos de la actividad (opcional, para una segunda etapa)

### Estudiante (`rol: Estudiante`)
- Registrar e iniciar sesión.
- unicamente ver las actividades que están por realizarse.
- Inscribirse en actividades antes de la fecha limite de inscripción.

### Supervisor (`rol: Supervisor`)
- Registrar e iniciar sesión.
- unicamente ver las actividades que están activas o en curso.
- Ver la lista de participantes y tomar asistencias.

---

## 🔁 Lógica de Negocio

- Validar que no se cree en un mismo día 2 actividades simultaneas, cada actividad debe tener un supervisor asignado
- Las actividades solo se pueden eliminar si no hay estudiantes inscritos, si no se ha iniciado la actividad, se puede deshabilitar.
- Se debe crear la actividad con fecha y hora de inicio y se debe finalizar por parte del `Supervisor`, y se considerará la fecha y hora de fin para calcular las horas.
- Solo los administradores pueden crear o modificar actividades.
- Se pueden crear actividades para otras carreras e inscribir a los estudiantes, unicamente para tener una bitacora de la misma, dicha activiadad en ese punto, ya fue realizada, no estára disponible para que los estudiantes se inscriban.
- Para el rol de administrador, permitir buscar por número de cuenta, aparecerán las actividades en las que el estudiante haya participado y podrá ver la información completa de la misma.

---

## 📋 Buenas Prácticas Esperadas

- Uso adecuado de códigos de estado HTTP.
- Validación de datos.
- Manejo centralizado de errores.
- Código modular y organizado.
- Uso de `async/await` correctamente.

---

## 🧪 Recomendaciones Adicionales

- Documentar la API 
- Incluir la base de datos MySQL