
# 📱 **miAppLoginMultiUsuarioApi**

Aplicación móvil desarrollada con **React Native + Expo + TypeScript**, completamente integrada con la **API REST oficial**:

```
https://todo-list.dobleb.cl/
```

El proyecto implementa:

* Autenticación real con backend remoto (JWT).
* Pantalla de Login y Registro conectadas al backend.
* Navegación con Expo Router.
* Contexto global de autenticación.
* Módulo completo de TODOList con consumo de API:

  * Listar tareas
  * Crear tareas
  * Modificar tareas
  * Obtener ubicación
  * Adjuntar imagen (como URL debido a restricciones del backend)
  * Marcar como completadas
  * Eliminar tareas

Proyecto correspondiente a la **Evaluación 3**, demostrando integración completa con un servicio backend real, manejo de estado global, navegación, validaciones, consumo de API y arquitectura .

---

## **Objetivo Académico**

Demostrar dominio en:

* Desarrollo móvil con React Native + Expo
* Consumo de API REST con autenticación JWT
* Manejo de estado global con Context API
* Navegación declarativa con Expo Router
* Tipado fuerte con TypeScript
* Manejo de errores en llamadas HTTP
* Flujo completo: **registro → login → home → lista de tareas → CRUD completo**

---

## **Tecnologías Utilizadas**

* Expo
* React Native
* Expo Router
* TypeScript
* AsyncStorage
* Expo Location
* Expo ImagePicker
* Fetch API
* Context API
* API REST del profesor (Hono + JWT)

---

## **Estructura principal del proyecto**

```
miAppLoginMultiUsuarioApi/
├─ app/
│  ├─ _layout.tsx
│  ├─ index.tsx
│  ├─ auth/
│  │  └─ index.tsx
│  └─ home/
│     ├─ _layout.tsx
│     ├─ index.tsx
│     ├─ profile.tsx
│     └─ todo-list/
│        ├─ index.tsx
│        └─ create.tsx
│
├─ src/
│  ├─ context/
│  │  └─ AuthContext.tsx
│  └─ services/
│     └─ api.ts
│
├─ types/
│  └─ todolist.ts
│
├─ app.json
├─ package.json
├─ tsconfig.json
└─ README.md
```

---

## **Funcionalidad de Autenticación**

La app incluye:

* Campo email
* Campo contraseña
* Validaciones estrictas:

  * Email debe tener formato válido → `usuario@dominio.com`
  * Contraseña mínima: **6 caracteres** (según la  API )

### Flujo

1. Usuario se registra o inicia sesión.
2. El backend responde con un token JWT.
3. El token se guarda en AsyncStorage.
4. La app redirige automáticamente a Home.
5. Si no hay token → se muestra la pantalla de Login.
6. Desde el perfil se puede cerrar sesión (limpia token y estado).

---

## **Navegación con Expo Router**

* `app/_layout.tsx` controla el stack raíz y protege rutas.
* `app/index.tsx` decide si ir a Login o Home.
* `app/home/_layout.tsx` estructura las pantallas internas.
* `app/home/index.tsx` muestra tabs y navegación.
* `app/home/todo-list/` contiene el módulo completo de tareas.

---

## **Módulo TODO List (CRUD Real)**

### Listar tareas

GET `/todos`

### Crear tareas

POST `/todos`
Se envía:

* `title`
* `location: { latitude, longitude }`
* `photoUri` (como URL simulada por limitaciones del backend)

### Marcar tareas como completadas

PATCH `/todos/:id`

### Modificar tareas completadas

PATCH `/todos/:id`

### Eliminar tareas

DELETE `/todos/:id`

### Actualización automática

Cada acción refresca la lista.

---

## **flujo del Video demostrativo**

Debe mostrar:

* Registro
* Login
* Navegación protegida
* Lista de tareas
* modificar tarea
* Crear tarea con ubicación e imagen
* Completar / eliminar tareas
* Logout

*Cuando lo tengas, agrega el enlace aquí.*

---

## **Integrantes del Grupo**

## EFREN TOVAR

* **Desarrollo Principal de la Aplicación:** Liderazgo en el desarrollo principal.
* **Integración de API:** Integración completa con la API real del profesor.
* **Autenticación y Navegación:**
  * Implementación del flujo de **registro y login**.
  * Configuración de **AuthContext**.
  * Redirección protegida mediante **Expo Router**.
* **Módulo Todo List:** Adaptación del módulo para cumplir con las **validaciones del backend**.
* **Pruebas y Documentación:**
  * Pruebas iniciales con **Postman**.
  * Resolución de **errores HTTP**.
  * Grabación del **video demostrativo**.
  * Documentación técnica **inicial** del proyecto.

---

## EDUARDO AHUMADA

* **Diseño y Estilos:**
  * Revisión visual de pantallas.
  * **Refinamiento de estilos**.
* **Organización y Flujo:**
  * Asistencia en la **organización del proyecto**.
  * Revisión del **flujo de usuario**.
  * Sugerencias de mejora en la **claridad del código**.
* **Documentación y Pruebas:**
  * Estructura del archivo **README**.
  * Apoyo en **pruebas funcionales**.

---

## DANIEL CASTRO

* **Verificación de Flujos:** Verificación del **flujo general entre pantallas**.
* **Pruebas de Autenticación:** Pruebas del comportamiento del **AuthContext**.
* **Arquitectura y Errores:**
  * Rastreo de errores.
  * Sugerencias de **arquitectura**.
* **Validación de API:** Validación de las llamadas a la API (**GET, POST, PATCH, DELETE**).

---

## JEREMY SANHUEZA

* **Validación de Seguridad:** Apoyo en validación de **rutas protegidas**.
* **Revisión de Módulo:** Revisión visual del módulo **Todo List**.
* **Pruebas Finales:**
  * Pruebas finales del **flujo completo** (desde registro hasta CRUD de tareas).
* **Documentación Final:** Documentación final (texto transcrito a **PDF**).---

## **Instalación y ejecución**

Clonar repo:

```
git clone https://github.com/ejts29/miAppLoginMultiUsuarioApi
cd miAppLoginMultiUsuarioApi
```

Instalar dependencias:

```
npm install
```

Ejecutar:

```
npx expo start
```

Android:

```
npx expo run:android
```

---

## **Uso de IA en el proyecto**

La IA fue utilizada solo para:

* Resolver errores complejos de integración
* Mejorar arquitectura del proyecto
* Redacción de documentación técnica
* Depuración de validaciones y problemas con la API del profesor

Todas las decisiones finales y funcionalidades fueron implementadas y probadas por el alumno.
