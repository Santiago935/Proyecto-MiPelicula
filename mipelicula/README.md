# Proyecto MiPelícula

## Descripción

En un mundo alterno al nuestro, el streaming fracasa y el formato físico sigue imponiéndose en el cine. ¿Cómo sería alquilar una película física hoy en día?

El proyecto consiste en una página web para alquilar películas físicas, contemplando distintos planes y plazos de alquiler.

## Requisitos Funcionales

- **Crear cliente:** El usuario crea una sesión ingresando datos personales: nombre completo, correo electrónico, nombre de usuario y contraseña.
- **Iniciar sesión:** El usuario accede a su cuenta con sus credenciales.
- **Alquilar película:** El cliente selecciona las películas que desea y las agrega al carrito. Luego elige un plan de pago y, opcionalmente, agrega snacks al pedido. Ingresa sus datos de pago, verifica la compra y la confirma. El pago se genera y se registra en el sistema.
- **Consultar compras:** El cliente visualiza el historial de películas que alquiló.

## Requisitos No Funcionales

- El sistema debe mostrar únicamente las películas alquiladas por el usuario autenticado.
- El sistema debe integrarse con Supabase para almacenar los datos de usuarios, pagos y películas disponibles.