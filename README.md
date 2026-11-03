# Acme Store - Frontend (100% POO)

Aplicacion Web para la Gestion de Biblioteca y Tienda Editorial, desarrollada estrictamente bajo Programacion Orientada a Objetos (POO) en JavaScript Vanilla y diseno con Tailwind CSS.

---

## 1. Repositorio Backend Conectado
- **Backend API REST:** [https://github.com/barriosevelyn488-web/acme-store-backend](https://github.com/barriosevelyn488-web/acme-store-backend)

---

## 2. Caracteristicas Principales

1. **Cero Emojis y Estetica Profesional:**  
   Todos los elementos visuales emplean iconos vectoriales SVG limpios (Heroicons).
2. **Modal de Detalle y Sinopsis de Libros:**  
   Al hacer clic en cualquier tarjeta de libro del catalogo, se despliega un modal con portada oficial en alta resolucion, ISBN, editorial, anio, precio, stock en tiempo real, sinopsis completa y botones directos para prestar o comprar.
3. **Inicio de Sesion Manual Estricto:**  
   Acceso unificado por correo y contrasena sin botones demo automaticos.
4. **Modulo de Gestion de Usuarios para el Administrador:**  
   Panel dedicado con tabla de usuarios, creacion de cuentas y asignacion de roles (admin o cliente).
5. **Integracion con Open Library API:**  
   Busqueda global e importacion con un clic hacia el inventario.
6. **Programacion Orientada a Objetos (POO):**  
   Estructurada en clases desacopladas:
   - `ApiClient`: Comunicacion HTTP con soporte para JWT en cookies y cabeceras.
   - `AuthComponent`: Estado de autenticacion y navegacion condicional.
   - `BookDetailModalComponent`: Renderizado interactivo de sinopsis.
   - `CatalogComponent`: Catalogo reactivo con busqueda y filtros.
   - `CartComponent`: Carrito de compras con persistencia local.
   - `LoanComponent`: Prestamos y devoluciones con control de inventario.
   - `SalesComponent`: Compras y generacion de recibo imprimible.
   - `UserManagerComponent`: Directorio y CRUD de usuarios para el admin.
   - `AdminComponent`: Metricas e importacion Open Library.
   - `ProfileComponent`: Perfil de usuario con identificacion inmutable.
   - `ToastNotificationComponent`: Alertas visuales.
   - `AppRouter`: Enrutador y orquestador central de vistas.

---

## 3. Instalacion y Ejecucion Local

### Opcion A: Abrir directamente en el navegador
Puedes abrir el archivo `index.html` en cualquier navegador web moderno. La aplicacion cuenta con deteccion de protocolo y catalogo de demostracion integrado.

### Opcion B: Servidor local ligero (Live Server / Node)
```bash
# Con npx serve
npx serve .

# O con http-server
npx http-server -p 5500
```
La interfaz abrira en `http://localhost:5500`.

---

## 4. Despliegue en Vercel

1. Este repositorio ya contiene `vercel.json` configurado para enrutamiento estatico.
2. En [Vercel](https://vercel.com/new), importa el repositorio `barriosevelyn488-web/acme-store-frontend`.
3. Haz clic en **Deploy**.
