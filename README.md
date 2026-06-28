# Proyecto MiPelícula


---

## Tabla de Contenidos

- [Descripción](#descripción)
- [Instalación y Uso](#instalación-y-uso)
- [Tecnologías usadas en el Proyecto](#tecnologías-usadas-en-el-proyecto)
- [Uso de IA](#uso-de-ia)
- [Diagrama de Dominio](#diagrama-de-dominio)
- [Requisitos Funcionales](#requisitos-funcionales)
- [Requisitos No Funcionales](#requisitos-no-funcionales)

---

## Descripción


En un mundo alterno al nuestro, el streaming fracasa y el formato físico sigue imponiéndose en el cine. ¿Cómo sería alquilar una película física hoy en día?

El proyecto consiste en una página web para alquilar películas físicas, contemplando distintos planes y plazos de alquiler.

---


## Instalación y Uso

### Instalación
1) Descarga el proyecto ya sea mediante github o por zip
2) Abrir una terminal y acceder a la raiz del proyecto. Allí ejecutar el comando:

```bash
npm install --legacy-peer-deps
```

3) Crear un archivo .env.local en la raíz del proyecto con las siguientes variables:

```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

Estas son las llaves de tu supabase

4) En el supabase ejecutar el siguiente codigo:

```sql
-- ══════════════════════════════════════════════
-- 1. TABLAS
-- ══════════════════════════════════════════════

create table "Cliente" (
  "idCliente"   bigint generated always as identity primary key,
  auth_id       uuid unique references auth.users(id) on delete cascade,
  nombre        text not null,
  apellido      text not null,
  correo        text not null,
  telefono      text,
  direccion     text,
  foto_perfil   text
);

create table "Cuenta" (
  "idCliente"  bigint primary key references "Cliente"("idCliente") on delete cascade,
  usuario      text unique not null
);

create table pelicula (
  id          bigint generated always as identity primary key,
  nombre      text not null,
  genero      text not null,
  descripcion text,
  precio      numeric(10,2) not null,
  duracion    int,
  imagen_url  text
);

create table snack (
  id          bigint generated always as identity primary key,
  nombre      text not null,
  precio      numeric(10,2) not null,
  imagen_url  text
);

create table alquiler (
  id                bigint generated always as identity primary key,
  cliente_id        bigint not null references "Cliente"("idCliente") on delete cascade,
  direccion_entrega text not null,
  fecha_envio       date not null,
  fecha_devolucion  date not null,
  precio_total      numeric(10,2) not null,
  pelicula_ids      bigint[] not null,
  created_at        timestamptz default now()
);

create table linea_snack (
  alquiler_id  bigint not null references alquiler(id) on delete cascade,
  snack_id     bigint not null references snack(id),
  cantidad     int not null,
  primary key (alquiler_id, snack_id)
);

create table pago (
  id           bigint generated always as identity primary key,
  alquiler_id  bigint not null references alquiler(id) on delete cascade,
  monto        numeric(10,2) not null,
  created_at   timestamptz default now()
);


-- ══════════════════════════════════════════════
-- 2. RPC: registrar_cliente (usado en el registro)
-- ══════════════════════════════════════════════

create or replace function registrar_cliente(
  p_auth_id  uuid,
  p_nombre   text,
  p_apellido text,
  p_correo   text,
  p_telefono text,
  p_usuario  text
)
returns void
language plpgsql
security definer
as $$
declare
  v_id bigint;
begin
  insert into "Cliente"(auth_id, nombre, apellido, correo, telefono)
  values (p_auth_id, p_nombre, p_apellido, p_correo, p_telefono)
  returning "idCliente" into v_id;

  insert into "Cuenta"("idCliente", usuario)
  values (v_id, p_usuario);
end;
$$;


-- ══════════════════════════════════════════════
-- 3. ROW LEVEL SECURITY
-- ══════════════════════════════════════════════

alter table "Cliente"    enable row level security;
alter table "Cuenta"     enable row level security;
alter table alquiler     enable row level security;
alter table linea_snack  enable row level security;
alter table pago         enable row level security;

create policy "cliente_own" on "Cliente"
  for all using (auth_id = auth.uid());

create policy "cuenta_own" on "Cuenta"
  for all using (
    "idCliente" = (select "idCliente" from "Cliente" where auth_id = auth.uid())
  );

create policy "alquiler_own" on alquiler
  for all using (
    cliente_id = (select "idCliente" from "Cliente" where auth_id = auth.uid())
  );

create policy "linea_snack_own" on linea_snack
  for all using (
    alquiler_id in (
      select id from alquiler
      where cliente_id = (select "idCliente" from "Cliente" where auth_id = auth.uid())
    )
  );

create policy "pago_own" on pago
  for all using (
    alquiler_id in (
      select id from alquiler
      where cliente_id = (select "idCliente" from "Cliente" where auth_id = auth.uid())
    )
  );


-- ══════════════════════════════════════════════
-- 4. DATOS DE EJEMPLO (peliculas y snacks)
-- ══════════════════════════════════════════════

insert into pelicula (nombre, genero, descripcion, precio, duracion, imagen_url) values
  ('El Padrino',      'Drama',           'La historia de la familia Corleone.',       1500.00, 175, null),
  ('Interstellar',    'Ciencia Ficción', 'Un viaje a través del espacio-tiempo.',     1800.00, 169, null),
  ('Pulp Fiction',    'Thriller',        'Historias entrelazadas en Los Ángeles.',    1400.00, 154, null),
  ('El Rey León',     'Animación',       'El ciclo de la vida en la sabana africana.',1200.00, 88,  null),
  ('Inception',       'Acción',          'Un ladrón que roba secretos de los sueños.',1700.00, 148, null),
  ('La La Land',      'Romance',         'Dos artistas persiguen sus sueños en L.A.',1300.00, 128, null);

insert into snack (nombre, precio, imagen_url) values
  ('Pochoclo dulce',  800.00, null),
  ('Pochoclo salado', 800.00, null),
  ('Coca-Cola 500ml', 600.00, null),
  ('Agua mineral',    400.00, null),
  ('Chocolates',      950.00, null),
  ('Papas fritas',    750.00, null);
```

5) En supabase crear el bucket de imágenes de perfil con el nombre "avatares"



---

### Uso

1) Abrir una terminal y acceder a la raiz del proyecto. Allí ejecutar el comando:

```bash
npm run dev
```

2) Abrir un navegador a su elección e ingresar esta dirección: http://localhost:3000

---



## Tecnologías usadas en el Proyecto

El proyecto esta programado principalmente en:

**TypeScript**: Para reducir el tiempo de compilación

**Next.js**: Para navegar entre paginas de forma sencilla sin complicaciones.

**CSS**: Por los estilos del frontend 

**Supabase**: Como base de datos dado que ya he trabajado con esto por un proyecto parecido a este.

También se utilizó **Vercel** para que el proyecto sea accedido de forma no-local siendo el link: [https://proyecto-mi-pelicula.vercel.app/auth](https://proyecto-mi-pelicula.vercel.app/auth)

---

## Uso de IA

Para este proyecto se ha usado dos IAs:

**Claude Pro**

Se utilizó en la etapa de desarrollo. Una función que pocos conocen es "crear plan" del cual consiste en primero pasar a la IA un promp especificando la función que se quiere codear, sus requisitos, diseño, limite y que usar. La Ia genera un plan del cual te lo muestra especificando que es lo que se necesita y que es lo que hará y como lo hara. Tu revisas ese plan y corrigues aquellas cosas que consideras mal o equivoca. Puedes hasta restringuir permisos que la IA no tiene porque tocar. 
Una vez ya definido el plan, la IA lo ejecuta y programa la función requerida. Tras esto revisas el contenido y lo pruebas para implementarlo a tu proyecto.
Basicamente en eso consistió mi uso de esta IA. Siempre y en todo momento he supervisado lo que crea y controlando lo que va a crear antes de que lo implemente.

**Gemini**

Se utilizó Gemini en forma de consultora para que diera un punto de vista sobre la viabilidad del proyecto.

---



## Diagrama de Dominio

![Diagrama de Dominio](DominioMiPeli.jpg)

---

## Requisitos Funcionales

- **Crear cliente:** El usuario crea una sesión ingresando datos personales: nombre completo, correo electrónico, nombre de usuario y contraseña.
- **Iniciar sesión:** El usuario accede a su cuenta con sus credenciales.
- **Alquilar película:** El cliente selecciona las películas que desea y las agrega al carrito. Luego elige un plan de pago y, opcionalmente, agrega snacks al pedido. Ingresa sus datos de pago, verifica la compra y la confirma. El pago se genera y se registra en el sistema.
- **Consultar compras:** El cliente visualiza el historial de películas que alquiló.
- **Actualizar perfil**: El usuario puede actualizar los campos y hasta agregar un perfil y direccion predefinidos

---

## Requisitos No Funcionales

- El sistema debe mostrar únicamente las películas alquiladas por el usuario autenticado.
- El sistema debe integrarse con Supabase para almacenar los datos de usuarios, pagos y películas disponibles.
