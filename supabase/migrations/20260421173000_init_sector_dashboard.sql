create table if not exists public.sectors (
  sector_code text primary key,
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id bigint generated always as identity primary key,
  sector_code text not null references public.sectors(sector_code) on delete restrict,
  bvd_code text not null,
  nombre text,
  webpage text,
  nif text,
  bvd_id text,
  pais text,
  provincia text,
  localidade text,
  concelho text,
  distrito text,
  fecha_fundacion date,
  situacion_actual text,
  ultimo_ano_disponible date,
  latest_period_end date,
  empleados integer,
  propietario text,
  propietario_final_global text,
  cae_codigo text,
  cae_descripcion text,
  actividad_descripcion text,
  english_trade_description text,
  t_o double precision,
  cagr double precision,
  ebitda double precision,
  ebitda_pct double precision,
  net_debt double precision,
  nd_ebitda double precision,
  wc double precision,
  wc_t_o double precision,
  vendas_total double precision,
  prestacao_servicos_total double precision,
  volume_negocios double precision,
  ebit double precision,
  resultado_liquido double precision,
  total_capital_proprio double precision,
  financiamentos_obtidos_nao_correntes double precision,
  financiamentos_obtidos_correntes double precision,
  caixa_depositos_bancarios double precision,
  fluxos_caixa_operacionais double precision,
  fluxos_caixa_investimento double precision,
  fluxos_caixa_financiamento double precision,
  total_ativo double precision,
  inventarios double precision,
  margem_bruta double precision,
  clientes double precision,
  fornecedores double precision,
  dividendos double precision,
  t_o_sub double precision,
  source_dashboard boolean not null default false,
  source_sabi boolean not null default false,
  raw_json_sabi jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_sector_code_bvd_code_key unique (sector_code, bvd_code)
);

create table if not exists public.company_attributes (
  id bigint generated always as identity primary key,
  sector_code text not null,
  bvd_code text not null,
  attribute_key text not null,
  attribute_label text not null,
  value boolean not null,
  constraint company_attributes_company_fk foreign key (sector_code, bvd_code)
    references public.companies(sector_code, bvd_code) on update cascade on delete cascade,
  constraint company_attributes_sector_code_bvd_code_attribute_key_key unique (
    sector_code,
    bvd_code,
    attribute_key
  )
);

create table if not exists public.company_financial_history (
  id bigint generated always as identity primary key,
  sector_code text not null,
  bvd_code text not null,
  metric_key text not null,
  metric_label text not null,
  period_offset integer not null check (period_offset between 0 and 7),
  value double precision,
  constraint company_financial_history_company_fk foreign key (sector_code, bvd_code)
    references public.companies(sector_code, bvd_code) on update cascade on delete cascade,
  constraint company_financial_history_metric_key_check check (
    metric_key in ('volume_negocios', 'net_debt', 'ebitda', 'ebit', 'empleados')
  ),
  constraint company_financial_history_sector_code_bvd_code_metric_key_period_offset_key unique (
    sector_code,
    bvd_code,
    metric_key,
    period_offset
  )
);

create index if not exists companies_sector_code_idx on public.companies (sector_code);
create index if not exists companies_sector_code_pais_idx on public.companies (sector_code, pais);
create index if not exists companies_sector_code_provincia_idx on public.companies (sector_code, provincia);
create index if not exists companies_sector_code_propietario_idx on public.companies (sector_code, propietario);
create index if not exists companies_sector_code_t_o_idx on public.companies (sector_code, t_o desc);
create index if not exists companies_sector_code_ebitda_idx on public.companies (sector_code, ebitda desc);
create index if not exists company_attributes_sector_code_bvd_code_idx
  on public.company_attributes (sector_code, bvd_code);
create index if not exists company_financial_history_sector_code_bvd_code_idx
  on public.company_financial_history (sector_code, bvd_code);
create index if not exists company_financial_history_sector_code_metric_key_idx
  on public.company_financial_history (sector_code, metric_key);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sectors_set_updated_at on public.sectors;
create trigger sectors_set_updated_at
before update on public.sectors
for each row
execute function public.set_updated_at();

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
before update on public.companies
for each row
execute function public.set_updated_at();

alter table public.sectors enable row level security;
alter table public.companies enable row level security;
alter table public.company_attributes enable row level security;
alter table public.company_financial_history enable row level security;

drop policy if exists "Public read sectors" on public.sectors;
create policy "Public read sectors"
on public.sectors
for select
to anon
using (true);

drop policy if exists "Public read companies" on public.companies;
create policy "Public read companies"
on public.companies
for select
to anon
using (true);

drop policy if exists "Public read company attributes" on public.company_attributes;
create policy "Public read company attributes"
on public.company_attributes
for select
to anon
using (true);

drop policy if exists "Public read company financial history" on public.company_financial_history;
create policy "Public read company financial history"
on public.company_financial_history
for select
to anon
using (true);
