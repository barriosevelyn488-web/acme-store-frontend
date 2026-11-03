# 📚 Acme Store • Frontend

> **Aplicación Web para la Gestión de Biblioteca y Tienda Editorial**  
> Desarrollada bajo **Programación Orientada a Objetos (POO)** pura en JavaScript, diseño profesional en Tailwind CSS, **cero emojis (100% iconos vectoriales SVG)**, modal de sinopsis al hacer clic en libros, gestión completa de usuarios para administradores y lista para desplegar en **Vercel**.

---

## 🎨 Características Principales

1. **Cero Emojis & Estética Profesional:**  
   Todos los elementos visuales emplean iconos vectoriales SVG estandarizados (Heroicons).
2. **Modal de Detalle y Sinopsis de Libros:**  
   Al hacer clic en cualquier tarjeta de libro del catálogo, se despliega un modal con la portada oficial, ISBN, editorial, año, precio, stock y el resumen argumental completo de la obra.
3. **Inicio de Sesión Manual Estricto:**  
   Acceso unificado por correo y contraseña sin botones demo automáticos, respetando los estándares de seguridad en producción.
4. **Módulo de Gestión de Usuarios para el Administrador:**  
   Panel dedicado con tabla de usuarios, creación de cuentas y actualización de roles (`admin` o `cliente`).
5. **Integración con Open Library API:**  
   Búsqueda global e importación con un clic hacia el inventario.
6. **Programación Orientada a Objetos (POO):**  
   Estructurada en clases desacopladas:
   - `ApiClient`: Comunicación HTTP y manejo de sesión.
   - `AuthComponent`: Estado de autenticación y navegación condicional.
   - `BookDetailModalComponent`: Renderizado interactivo de sinopsis.
   - `CatalogComponent`: Catálogo y filtros.
   - `CartComponent`: Carrito de compras.
   - `LoanComponent`: Préstamos y devoluciones.
   - `SalesComponent`: Compras y facturación.
   - `UserManagerComponent`: Directorio de usuarios para el admin.
   - `AdminComponent`: Métricas y operaciones.
   - `ProfileComponent`: Perfil de usuario con identificación inmutable.
   - `ToastNotificationComponent`: Alertas visuales.
   - `AppRouter`: Enrutamiento y control de vistas.

---

## 🚀 Despliegue en Vercel

1. Sube este repositorio a tu cuenta de GitHub (`barriosevelyn488-web/acme-store-frontend`).
2. En [Vercel](https://vercel.com/new), selecciona **Import**.
3. Haz clic en **Deploy**. El archivo `vercel.json` se encargará de configurar las rutas automáticamente.
