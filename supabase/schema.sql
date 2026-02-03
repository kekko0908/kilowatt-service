-- Kilowatt Service Supabase schema
create extension if not exists "pgcrypto";

-- Catalog (Prodotti)
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null check (category in ('audio','lights','video')),
  price_day numeric not null,
  image_url text,
  description text,
  specs jsonb not null default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Catalogo Servizi (pagina /servizi)
create table if not exists service_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  long_description text,
  image_url text,
  icon_key text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Servizi Digitali (configuratore)
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null check (category in ('branding','web','social')),
  price numeric not null,
  details text,
  audience text,
  deliverables jsonb default '[]'::jsonb,
  steps jsonb default '[]'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Pacchetti
create table if not exists packages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  audience text,
  base_price numeric not null,
  badge text,
  created_at timestamptz default now()
);

create table if not exists package_services (
  package_id uuid references packages(id) on delete cascade,
  service_id uuid references services(id) on delete cascade,
  primary key (package_id, service_id)
);

create table if not exists package_products (
  package_id uuid references packages(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  primary key (package_id, product_id)
);

-- Preventivi
create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  status text default 'draft' check (status in ('draft','sent','accepted','rejected')),
  total numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid references quotes(id) on delete cascade,
  item_type text check (item_type in ('product','service')),
  item_id uuid not null,
  name text,
  unit_price numeric not null,
  meta jsonb default '{}'::jsonb
);

-- Proposte Power By KW
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  phone text,
  user_id uuid references auth.users(id) on delete cascade,
  file_path text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

-- SEO settings
create table if not exists seo_config (
  page text primary key,
  title text,
  description text,
  keywords text,
  updated_at timestamptz default now()
);

-- updated_at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql
set search_path = public;

drop trigger if exists set_quotes_updated_at on quotes;
create trigger set_quotes_updated_at
before update on quotes
for each row execute procedure set_updated_at();

-- RLS
alter table products enable row level security;
alter table service_catalog enable row level security;
alter table services enable row level security;
alter table packages enable row level security;
alter table package_services enable row level security;
alter table package_products enable row level security;
alter table quotes enable row level security;
alter table quote_items enable row level security;
alter table projects enable row level security;
alter table seo_config enable row level security;

-- Public read policies
drop policy if exists "public read products" on products;
create policy "public read products" on products
for select using (true);

drop policy if exists "public read services" on services;
create policy "public read services" on services
for select using (true);

drop policy if exists "public read packages" on packages;
create policy "public read packages" on packages
for select using (true);

drop policy if exists "public read package_services" on package_services;
create policy "public read package_services" on package_services
for select using (true);

drop policy if exists "public read package_products" on package_products;
create policy "public read package_products" on package_products
for select using (true);

drop policy if exists "public read service_catalog" on service_catalog;
create policy "public read service_catalog" on service_catalog
for select using (true);

drop policy if exists "public read seo_config" on seo_config;
create policy "public read seo_config" on seo_config
for select using (true);

-- Quotes: only owner
drop policy if exists "user manage quotes" on quotes;
create policy "user manage quotes" on quotes
for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "user manage quote_items" on quote_items;
create policy "user manage quote_items" on quote_items
for all using (
  exists (
    select 1 from quotes q where q.id = quote_id and q.user_id = (select auth.uid())
  )
) with check (
  exists (
    select 1 from quotes q where q.id = quote_id and q.user_id = (select auth.uid())
  )
);

drop policy if exists "user manage projects" on projects;
create policy "user manage projects" on projects
for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
