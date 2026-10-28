
# Frontend — CRUD de Productos y Categorías

Interfaz web desarrollada con **Vue 3 + Vite**, con navegación entre vistas y formularios para administrar productos y categorías mediante la API Laravel.

## Requisitos

-   **Node.js** y **npm** instalados (recomendado Node.js 22 o superior compatible con Vite).
-   El **backend Laravel** iniciado en `http://localhost:8000`.

## Cómo ejecutarlo

Abrir una terminal en la carpeta raíz de este repositorio y ejecutar:

```
npm install
npm run dev
```

Abrir en el navegador:

**[http://localhost:5173](http://localhost:5173)**

> No hace falta Docker para el frontend. Mantén la terminal de Vite abierta mientras utilizas la aplicación.

## Conexión con el backend

La API debe estar disponible en:

```
http://localhost:8000/api
```

Si el backend utiliza otro puerto o dirección, revisa la URL de conexión en `src/services/api.ts` (o el archivo de configuración de API equivalente del proyecto).

## Funcionalidades

-   Pantalla principal.
-   Listado de productos y categorías.
-   Creación, edición y eliminación de registros.
-   Formularios con validaciones y avisos de error o éxito.

## Comandos útiles

```
npm run dev      # Iniciar en desarrollo
npm run build    # Generar compilación de producción
```

Para detener el servidor de desarrollo, presiona **Ctrl + C** en la terminal.