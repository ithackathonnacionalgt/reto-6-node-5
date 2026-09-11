# MONAMI

MONAMI es un prototipo para registrar y dar seguimiento a denuncias ambientales del MARN de Guatemala. El MVP permite registrar denuncias identificadas o anónimas, adjuntar ubicación y evidencia multimedia, consultar el estado mediante un código de seguimiento y gestionar los casos desde un panel interno.

El sistema no se conecta con sistemas reales del MARN, no asigna inspectores y no resuelve denuncias. El panel es una herramienta interna simulada para el prototipo.

## Alcance del MVP

- Registro de denuncias identificadas o anónimas.
- Categoría, descripción, departamento, municipio y referencia.
- Ubicación mediante GPS o selección en mapa.
- Fotografías y videos (hasta 5 archivos, máximo 50 MB por archivo).
- Código de seguimiento único.
- Consulta pública sanitizada sin datos personales ni evidencia.
- Panel MARN para usuarios `ADMIN` y `VIEWER`.
- Listado, filtros, paginación, detalle e historial de estados.
- Actualización transaccional de estado mediante RPC.
- Agrupación geográfica por categoría con PostGIS.
- Evidencia almacenada en un bucket privado mediante URLs firmadas.
- Notificación opcional por correo con Resend.

## Stack y arquitectura

- Astro 7 con SSR.
- JavaScript y TypeScript en contratos y servicios del servidor.
- Vite y Tailwind CSS 4.
- Supabase Auth, PostgreSQL y Supabase Storage.
- PostGIS para la columna geográfica y agrupaciones.
- Leaflet con teselas de OpenStreetMap.
- Cloudflare Workers mediante `@astrojs/cloudflare` y Wrangler.
- Resend opcional para notificaciones de estado.

El navegador usa las variables públicas de Supabase para leer categorías y autenticar usuarios administrativos. Las rutas Astro ejecutan las operaciones de servidor. El `service_role` solo se lee en módulos de servidor para crear denuncias, validar archivos y generar URLs firmadas.

## Flujos principales

### Ciudadano

1. Entra a `/denunciar`.
2. Selecciona una categoría cargada desde `categories`.
3. Completa la denuncia identificada o marca la opción anónima.
4. Selecciona la ubicación con GPS, clic en el mapa o movimiento del marcador.
5. Selecciona fotografías o videos.
6. El frontend envía la metadata a `POST /api/reports`.
7. Cada archivo se carga directamente mediante la URL firmada recibida.
8. El frontend llama a `POST /api/reports/{trackingCode}/media/complete`.
9. Se muestra el código en `/denunciar/confirmacion`.

### Seguimiento público

`/seguimiento` consulta `GET /api/reports/tracking/{trackingCode}`. La respuesta contiene código, categoría, ubicación general, estado y mensajes del historial. No contiene nombre, correo, empresa denunciada ni archivos.

### Panel MARN

El acceso comienza en `/admin/login` con Supabase Auth por correo y contraseña. No existe registro público.

- `VIEWER`: puede listar, filtrar, consultar detalles, historial, evidencia firmada y mapa.
- `ADMIN`: tiene las mismas capacidades y puede actualizar estados con un mensaje mediante la RPC `admin_update_report_status`.

## Estructura relevante

```text
zapping-zenith/
├── astro.config.mjs
├── package.json
├── wrangler.jsonc
├── .env.example
├── public/
│   ├── favicon.ico
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Button.astro
│   │   ├── Footer.astro
│   │   ├── Header.astro
│   │   ├── Hero.astro
│   │   └── StatusTimeLine.astro
│   ├── contracts/
│   │   └── reports.ts
│   ├── features/
│   │   ├── media/server/create-upload-instructions.ts
│   │   ├── notifications/server/send-status-update-email.ts
│   │   └── reports/server/
│   │       ├── complete-media-upload.ts
│   │       ├── create-report.ts
│   │       ├── get-admin-report.ts
│   │       ├── get-public-report.ts
│   │       ├── get-report-clusters.ts
│   │       ├── list-admin-reports.ts
│   │       └── update-report-status.ts
│   ├── layouts/
│   │   ├── AdminLayout.astro
│   │   └── BaseLayout.astro
│   ├── lib/
│   │   ├── auth/admin-guard.ts
│   │   ├── env/server.ts
│   │   └── supabase/
│   │       ├── browser.ts
│   │       ├── privileged.ts
│   │       └── server.ts
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── denuncias/[id].astro
│   │   │   ├── index.astro
│   │   │   ├── login.astro
│   │   │   └── mapa/index.astro
│   │   ├── api/
│   │   │   ├── admin/report-clusters/index.ts
│   │   │   ├── admin/reports/[id].ts
│   │   │   ├── admin/reports/[id]/status.ts
│   │   │   ├── admin/reports/index.ts
│   │   │   ├── reports/[trackingCode]/media/complete.ts
│   │   │   ├── reports/index.ts
│   │   │   └── reports/tracking/[trackingCode].ts
│   │   ├── denunciar/
│   │   │   ├── confirmacion.astro
│   │   │   └── index.astro
│   │   ├── seguimiento/index.astro
│   │   └── index.astro
│   └── styles/global.css
├── supabase/
│   ├── migrations/
│   └── seed.sql
└── tsconfig.json
```

No se incluyen `node_modules`, `dist`, `.astro` ni `supabase/.temp`.

## Rutas

### Públicas

| Método | Ruta | Propósito |
|---|---|---|
| GET | `/` | Página inicial |
| GET | `/denunciar` | Formulario de denuncia |
| GET | `/denunciar/confirmacion?trackingCode=...` | Confirmación y código |
| GET | `/seguimiento` | Consulta pública |

### API pública

| Método | Ruta | Propósito |
|---|---|---|
| POST | `/api/reports` | Crea denuncia y prepara cargas firmadas |
| POST | `/api/reports/{trackingCode}/media/complete` | Valida cantidad, ruta, MIME y tamaño de evidencia |
| GET | `/api/reports/tracking/{trackingCode}` | Devuelve seguimiento sanitizado |

### Administración

| Método | Ruta | Acceso | Propósito |
|---|---|---|---|
| GET | `/admin/login` | Público | Inicio de sesión |
| GET | `/admin` | `ADMIN`, `VIEWER` | Listado, filtros y paginación |
| GET | `/admin/denuncias/{id}` | `ADMIN`, `VIEWER` | Detalle, mapa, historial y evidencia |
| GET | `/admin/mapa` | `ADMIN`, `VIEWER` | Agrupaciones geográficas |
| GET | `/api/admin/reports` | `ADMIN`, `VIEWER` | Datos paginados del listado |
| GET | `/api/admin/reports/{id}` | `ADMIN`, `VIEWER` | Detalle administrativo |
| PATCH | `/api/admin/reports/{id}/status` | `ADMIN` | Cambio de estado con historial |
| GET | `/api/admin/report-clusters` | `ADMIN`, `VIEWER` | Clústeres por categoría |

## Backend Supabase

### Extensiones y tipos

- `pgcrypto` y `postgis` se crean en el esquema `extensions`.
- `public.report_status`: `RECEIVED`, `UNDER_REVIEW`, `CLASSIFIED`, `INSPECTION_PENDING`, `INSPECTION_COMPLETED`, `REPORT_PENDING`, `CLOSED`.
- `public.app_role`: `ADMIN`, `VIEWER`.

### Tablas

| Tabla | Propósito | Campos principales |
|---|---|---|
| `categories` | Catálogo de categorías | `id`, `slug`, `name`, `description`, `icon`, `created_at` |
| `reports` | Denuncias | `id`, `tracking_code`, anonimato, datos opcionales, categoría, descripción, ubicación, estado y timestamps |
| `report_media` | Evidencia esperada | `report_id`, `storage_path`, `media_type`, `size_bytes`, `created_at` |
| `status_history` | Historial de cambios | `report_id`, `status`, `message`, `changed_by`, `created_at` |
| `profiles` | Rol de Auth | `id`, `role`, `created_at` |

`reports.location` es una columna generada `geography(Point, 4326)` a partir de longitud y latitud. La tabla tiene validaciones de coordenadas y exige nombre cuando la denuncia no es anónima.

### Funciones y triggers

- `generate_tracking_code()` genera códigos `ECO-...` con bytes aleatorios de `pgcrypto`.
- `set_report_updated_at()` actualiza `updated_at`.
- `create_initial_report_status_history()` agrega el estado inicial `RECEIVED`.
- `handle_new_user()` crea un perfil `VIEWER` al crear un usuario Auth.
- `has_app_role()` valida roles.
- `admin_update_report_status()` actualiza estado e historial en una misma transacción y exige `ADMIN`.
- `get_public_report_by_tracking_code()` devuelve solo información pública sanitizada.
- `get_report_clusters()` usa PostGIS para agrupar reportes por categoría y cercanía.

Las funciones con privilegios elevados fijan `search_path` y tienen permisos de ejecución explícitos. Los clientes no pueden insertar, actualizar ni eliminar directamente denuncias, medios o historial.

### RLS y Storage

- Categorías: lectura pública.
- Denuncias, medios e historial: lectura solo para `ADMIN` y `VIEWER` autenticados.
- Perfiles: cada usuario puede leer su propio perfil.
- Escrituras de denuncias y medios: servicios de servidor con cliente privilegiado.
- Cambio de estado: únicamente la RPC administrativa.
- Bucket privado: `report-evidence`.
- MIME permitido: JPEG, PNG, WebP, MP4 y WebM.
- Las URLs de evidencia son firmadas y temporales; no se usan URLs públicas.

## Migraciones y seed

Las migraciones están versionadas y se aplican en este orden:

1. `20260910120000_extensions_and_enums.sql`
2. `20260910121000_core_tables.sql`
3. `20260910122000_media_profiles_and_history.sql`
4. `20260910123000_functions_and_triggers.sql`
5. `20260910124000_indexes.sql`
6. `20260910125000_rls_and_storage.sql`

`supabase/seed.sql` inserta exactamente las categorías `aire`, `ruido`, `suelo`, `agua`, `visual` y `otros` usando `ON CONFLICT (slug) DO NOTHING`.

El repositorio todavía no incluye `supabase/config.toml`. Para usar el stack local completo, inicializa la configuración una sola vez:

```powershell
npx supabase init
npx supabase start
npx supabase db reset
```

`db reset` recrea la base local, aplica las migraciones y ejecuta `seed.sql`.

Para aplicar migraciones a un proyecto remoto:

```powershell
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
```

Para un proyecto remoto de desarrollo o staging recién creado, el seed puede incluirse explícitamente:

```powershell
npx supabase db push --include-seed
```

No uses `--include-seed` en producción.

## Variables de entorno

Solo se documentan nombres y propósito:

| Variable | Propósito | Requerida |
|---|---|---|
| `PUBLIC_SUPABASE_URL` | URL pública del proyecto Supabase; también se necesita durante el build del cliente | Sí |
| `PUBLIC_SUPABASE_ANON_KEY` | Clave pública para Auth y lecturas permitidas por RLS | Sí |
| `SUPABASE_SERVICE_ROLE_KEY` | Cliente privilegiado exclusivamente en el servidor | Sí para APIs de escritura |
| `SUPABASE_STORAGE_BUCKET` | Nombre del bucket de evidencia; normalmente `report-evidence` | Sí para Storage |
| `RESEND_API_KEY` | API key de Resend | Opcional |
| `RESEND_FROM_EMAIL` | Remitente verificado para Resend | Opcional |
| `APP_URL` | URL base usada en el enlace del correo | Opcional |

Nunca pongas valores reales en `.env.example`, `wrangler.jsonc` o el repositorio. `.env` y `.dev.vars*` están ignorados por Git.

## Instalación y ejecución local

Requisitos:

- Node.js `>=22.12.0`.
- Dependencias npm instaladas.
- Variables locales configuradas en `.env`.

Desde esta carpeta:

```powershell
npm install
npm run dev
```

La URL habitual es `http://localhost:4321/`.

Para validar la compilación y ejecutar el Worker local:

```powershell
npm run build
npm run preview
```

## Perfiles ADMIN y VIEWER

No hay registro público. Crea usuarios desde `Authentication → Users` en Supabase. El trigger crea un perfil con rol `VIEWER`.

Para promover un usuario a `ADMIN`, ejecuta en el SQL Editor del proyecto correspondiente, sustituyendo el correo:

```sql
update public.profiles
set role = 'ADMIN'
where id = (
  select id from auth.users where email = 'admin@ejemplo.com'
);
```

Para `VIEWER`, conserva el valor predeterminado `VIEWER`.

## Despliegue en Cloudflare Workers

`wrangler.jsonc` define:

- Worker: `monami`.
- Entrada: `@astrojs/cloudflare/entrypoints/server`.
- Assets desde `./dist` con binding `ASSETS`.
- `compatibility_date`: `2026-09-10`.
- Flag `nodejs_compat`.
- Observabilidad habilitada.

Configura los valores sensibles fuera del repositorio. Ejemplo de nombres de secretos:

```powershell
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put RESEND_FROM_EMAIL
npx wrangler secret put APP_URL
```

Las variables `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` deben estar disponibles en el entorno que ejecuta el build, porque se incluyen en el cliente. El despliegue se ejecuta con:

```powershell
npm run deploy
```

Este script compila y luego ejecuta `wrangler deploy`. Requiere autenticación previa de Wrangler y permisos sobre el Worker.

## Resend es opcional

El MVP no depende de Resend. Si faltan `RESEND_API_KEY`, `RESEND_FROM_EMAIL` o `APP_URL`, se omite el correo y la actualización de estado continúa. Cuando se configure, solo se envían notificaciones a denuncias identificadas que tengan `reporter_email`.

## Comandos disponibles

| Comando | Propósito |
|---|---|
| `npm run dev` | Servidor Astro de desarrollo |
| `npm run build` | Compilación SSR para Cloudflare |
| `npm run preview` | Compila y ejecuta `wrangler dev` |
| `npm run deploy` | Compila y despliega con Wrangler |
| `npm run astro` | Acceso directo a la CLI de Astro |
| `npx supabase ...` | CLI de Supabase instalada como dependencia de desarrollo |

## Consideraciones de seguridad

- No exponer `SUPABASE_SERVICE_ROLE_KEY` ni claves de Resend en el navegador.
- No crear URLs públicas para el bucket de evidencia.
- Mantener las operaciones privilegiadas dentro de `src/features` y `src/lib` de servidor.
- Usar la RPC para cambiar estados; no actualizar `reports.current_status` directamente desde el cliente.
- Revisar MIME, tamaño, cantidad y ruta de cada archivo antes de confirmar una denuncia.
- Mantener RLS habilitado y revisar roles `ADMIN`/`VIEWER`.
- No subir `.env`, `.dev.vars` ni tokens al repositorio.
- Configurar el límite de abuso por IP en Cloudflare/WAF; no usar un rate limiter en memoria.
