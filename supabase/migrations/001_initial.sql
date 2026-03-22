-- ObraQ V2 — Schema Completo — Execute no SQL Editor do Supabase

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

create table public.empresas (
  id uuid primary key default uuid_generate_v4(),
  nome varchar(255) not null,
  cnpj varchar(18),
  telefone varchar(20),
  email varchar(255),
  endereco text,
  site varchar(255),
  logo_url text,
  papel_timbrado_url text,
  cor_primaria varchar(7) default '#F59E0B',
  cor_secundaria varchar(7) default '#0A0A0F',
  cor_texto varchar(7) default '#F8F8FF',
  responsavel_nome varchar(255),
  responsavel_cargo varchar(100),
  responsavel_telefone varchar(20),
  responsavel_email varchar(255),
  moeda varchar(3) default 'BRL',
  prefixo_orcamento varchar(10) default 'OBQ',
  proximo_numero integer default 1,
  texto_introducao text,
  texto_validade varchar(100) default '30 dias',
  texto_condicoes_pagamento text,
  texto_observacoes text,
  plano varchar(20) default 'trial' check (plano in ('trial', 'basico', 'profissional', 'enterprise')),
  plano_periodo varchar(10) default 'mensal' check (plano_periodo in ('mensal', 'anual')),
  plano_ativo boolean default true,
  trial_expira_em timestamptz default (now() + interval '14 days'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  empresa_id uuid references public.empresas(id) on delete set null,
  nome varchar(255),
  email varchar(255),
  cargo varchar(100),
  avatar_url text,
  role varchar(20) default 'membro' check (role in ('owner', 'admin', 'membro')),
  tema varchar(10) default 'dark',
  idioma varchar(5) default 'pt-BR',
  notificacoes_email boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.categorias_itens (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nome varchar(255) not null,
  descricao text,
  cor varchar(7) default '#F59E0B',
  icone varchar(50),
  ordem integer default 0,
  created_at timestamptz default now()
);

create table public.itens_banco (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  categoria_id uuid references public.categorias_itens(id) on delete set null,
  codigo varchar(50),
  nome varchar(500) not null,
  descricao text,
  unidade varchar(30) not null default 'un',
  tipo varchar(30) default 'servico' check (tipo in ('servico', 'material', 'equipamento', 'mao_de_obra', 'outro')),
  preco_custo numeric(15,4) default 0,
  preco_venda numeric(15,4) default 0,
  margem_percentual numeric(8,4) default 0,
  ativo boolean default true,
  fonte varchar(100),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function calcular_margem()
returns trigger as $$
begin
  if new.preco_venda > 0 and new.preco_custo > 0 then
    new.margem_percentual := ((new.preco_venda - new.preco_custo) / new.preco_venda) * 100;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trigger_calcular_margem
  before insert or update on public.itens_banco
  for each row execute function calcular_margem();

create table public.orcamentos (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  criado_por uuid references public.perfis(id),
  numero varchar(50) not null,
  titulo varchar(500) not null,
  cliente_nome varchar(255),
  cliente_email varchar(255),
  cliente_telefone varchar(20),
  cliente_cpf_cnpj varchar(20),
  cliente_endereco text,
  status varchar(30) default 'gerado' check (status in ('gerado', 'enviado', 'em_negociacao', 'assinado', 'rejeitado', 'cancelado')),
  total_custo numeric(15,2) default 0,
  total_venda numeric(15,2) default 0,
  margem_total numeric(8,4) default 0,
  desconto_percentual numeric(8,4) default 0,
  desconto_valor numeric(15,2) default 0,
  total_final numeric(15,2) default 0,
  validade_dias integer default 30,
  data_validade date,
  condicoes_pagamento text,
  observacoes text,
  texto_introducao text,
  contexto_conversa jsonb,
  resumo_ia text,
  versao integer default 1,
  orcamento_pai_id uuid references public.orcamentos(id),
  enviado_em timestamptz,
  assinado_em timestamptz,
  rejeitado_em timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.orcamento_secoes (
  id uuid primary key default uuid_generate_v4(),
  orcamento_id uuid not null references public.orcamentos(id) on delete cascade,
  tipo varchar(30) not null check (tipo in ('custos', 'vendas', 'materiais')),
  titulo varchar(255),
  subtotal numeric(15,2) default 0,
  ordem integer default 0,
  created_at timestamptz default now()
);

create table public.orcamento_grupos (
  id uuid primary key default uuid_generate_v4(),
  secao_id uuid not null references public.orcamento_secoes(id) on delete cascade,
  orcamento_id uuid not null references public.orcamentos(id) on delete cascade,
  nome varchar(255) not null,
  descricao text,
  subtotal numeric(15,2) default 0,
  ordem integer default 0,
  created_at timestamptz default now()
);

create table public.orcamento_itens (
  id uuid primary key default uuid_generate_v4(),
  grupo_id uuid not null references public.orcamento_grupos(id) on delete cascade,
  orcamento_id uuid not null references public.orcamentos(id) on delete cascade,
  secao_tipo varchar(30) not null,
  item_banco_id uuid references public.itens_banco(id) on delete set null,
  codigo varchar(50),
  descricao varchar(1000) not null,
  unidade varchar(30),
  quantidade numeric(15,4) default 1,
  preco_unitario_custo numeric(15,4) default 0,
  preco_unitario_venda numeric(15,4) default 0,
  margem_percentual numeric(8,4) default 0,
  total_custo numeric(15,2) generated always as (quantidade * preco_unitario_custo) stored,
  total_venda numeric(15,2) generated always as (quantidade * preco_unitario_venda) stored,
  notas text,
  ordem integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.orcamento_historico_status (
  id uuid primary key default uuid_generate_v4(),
  orcamento_id uuid not null references public.orcamentos(id) on delete cascade,
  usuario_id uuid references public.perfis(id),
  status_anterior varchar(30),
  status_novo varchar(30) not null,
  observacao text,
  created_at timestamptz default now()
);

create table public.mensagens_chat (
  id uuid primary key default uuid_generate_v4(),
  orcamento_id uuid references public.orcamentos(id) on delete cascade,
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  sessao_id varchar(100),
  role varchar(20) not null check (role in ('user', 'assistant', 'system')),
  conteudo text not null,
  metadados jsonb,
  tokens_usados integer,
  created_at timestamptz default now()
);

-- RLS
alter table public.empresas enable row level security;
alter table public.perfis enable row level security;
alter table public.categorias_itens enable row level security;
alter table public.itens_banco enable row level security;
alter table public.orcamentos enable row level security;
alter table public.orcamento_secoes enable row level security;
alter table public.orcamento_grupos enable row level security;
alter table public.orcamento_itens enable row level security;
alter table public.orcamento_historico_status enable row level security;
alter table public.mensagens_chat enable row level security;

create or replace function public.minha_empresa_id()
returns uuid as $$
  select empresa_id from public.perfis where id = auth.uid()
$$ language sql security definer stable;

create policy "acesso_empresa" on public.empresas for all using (id = minha_empresa_id());
create policy "acesso_perfil" on public.perfis for all using (empresa_id = minha_empresa_id() or id = auth.uid());
create policy "acesso_empresa" on public.categorias_itens for all using (empresa_id = minha_empresa_id());
create policy "acesso_empresa" on public.itens_banco for all using (empresa_id = minha_empresa_id());
create policy "acesso_empresa" on public.orcamentos for all using (empresa_id = minha_empresa_id());
create policy "acesso_orcamento" on public.orcamento_secoes for all using (orcamento_id in (select id from public.orcamentos where empresa_id = minha_empresa_id()));
create policy "acesso_orcamento" on public.orcamento_grupos for all using (orcamento_id in (select id from public.orcamentos where empresa_id = minha_empresa_id()));
create policy "acesso_orcamento" on public.orcamento_itens for all using (orcamento_id in (select id from public.orcamentos where empresa_id = minha_empresa_id()));
create policy "acesso_orcamento" on public.orcamento_historico_status for all using (orcamento_id in (select id from public.orcamentos where empresa_id = minha_empresa_id()));
create policy "acesso_empresa" on public.mensagens_chat for all using (empresa_id = minha_empresa_id());

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.empresas for each row execute function set_updated_at();
create trigger set_updated_at before update on public.perfis for each row execute function set_updated_at();
create trigger set_updated_at before update on public.itens_banco for each row execute function set_updated_at();
create trigger set_updated_at before update on public.orcamentos for each row execute function set_updated_at();
create trigger set_updated_at before update on public.orcamento_itens for each row execute function set_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
declare
  nova_empresa_id uuid;
begin
  insert into public.empresas (nome, email)
  values (
    coalesce(new.raw_user_meta_data->>'nome_empresa', 'Minha Empresa'),
    new.email
  )
  returning id into nova_empresa_id;

  insert into public.perfis (id, empresa_id, nome, email, role)
  values (
    new.id,
    nova_empresa_id,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    new.email,
    'owner'
  );

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
