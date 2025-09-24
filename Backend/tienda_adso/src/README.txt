Proyecto Spring Boot - Tienda Virtual (estructura src)

1) Mueve esta carpeta `src` al raíz de tu proyecto Maven/Gradle.
2) Asegúrate de tener la dependencia de MySQL y Spring Web, Spring Data JPA.
3) Configura `src/main/resources/application.properties` con tu usuario/clave de MySQL.
4) Ejecuta la clase `TiendaAdsoApplication`.
5) Endpoints útiles:
   - GET  /api/health
   - POST /api/users/register
   - POST /api/users/login
   - GET  /api/categories, /api/products
   - GET  /api/products/by-category/{categoryId}
   - GET  /api/cart/active/{userId}
   - POST /api/cart/add   { userId, productId, cantidad }
   - POST /api/cart/remove { userId, productId }
   - POST /api/cart/checkout { userId }
   - GET  /api/orders/by-user/{userId}
