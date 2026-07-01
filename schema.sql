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
