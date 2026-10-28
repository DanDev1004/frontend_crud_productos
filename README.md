
# Backend — CRUD de Productos y Categorías

API REST desarrollada con **Laravel y MySQL**. Permite listar, crear, consultar, editar y eliminar lógicamente productos y categorías. Incluye validaciones, auditoría de cambios y documentación Swagger.

## Requisitos

-   **Docker Desktop** instalado y en ejecución.
-   Puertos **8000** (API) y **3307** (MySQL, desde el equipo) disponibles.

No es necesario instalar PHP, Composer ni MySQL en el equipo.

## Cómo ejecutarlo

Abrir una terminal en la carpeta raíz de este repositorio.

**1. Crear el archivo de configuración:**

En **PowerShell (Windows)**:

```
Copy-Item .env.example .env
```

En **Linux/macOS**:

```
cp .env.example .env
```

**2. Configurar la base de datos** en `.env`:

```
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=productos_db
DB_USERNAME=productos_user
DB_PASSWORD=productos_password
MYSQL_ROOT_PASSWORD=root_local_123
```

> Estas credenciales son únicamente para el entorno de desarrollo local. Si se usan otras, deben coincidir con las configuradas en `docker-compose.yml`.

**3. Construir e iniciar los contenedores:**

```
docker compose up -d --build
```

**4. Preparar Laravel y cargar los datos de ejemplo:**

```
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
docker compose exec app php artisan l5-swagger:generate
```

## URLs

Servicio

Dirección

API — Productos

[http://localhost:8000/api/products](http://localhost:8000/api/products)

API — Categorías

[http://localhost:8000/api/categories](http://localhost:8000/api/categories)

Documentación Swagger

[http://localhost:8000/api/docs](http://localhost:8000/api/docs)

MySQL desde el equipo

`127.0.0.1:3307`

La API devuelve JSON con las claves `success`, `message` y `data` o `errors`. Las eliminaciones son lógicas (`deleted_at`) y la auditoría se registra en la tabla `activity_log`.

## Comandos útiles

```
docker compose ps                # Ver estado
docker compose logs -f app       # Ver logs de Laravel
docker compose down              # Detener sin borrar los datos
```

La base de datos se conserva en un volumen Docker. Para reiniciar datos de prueba en una instalación existente, no es necesario borrar el volumen: se pueden usar las migraciones y seeders según corresponda.