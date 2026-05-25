-- profiles 테이블 (계정 정보)
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  nickname text not null unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- characters 테이블 (캐릭터 정보, 프로필당 N개)
create table public.characters (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  character_name text not null unique,
  server_class text not null check (server_class in ('전사', '마법사', '궁수', '도적', '해적')),
  level integer not null check (level > 0 and level <= 999),
  description text,
  is_verified boolean not null default false,
  verification_code text,
  verification_expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- service_records 테이블
create table public.service_records (
  id uuid primary key default gen_random_uuid(),
  character_id uuid references public.characters(id) on delete cascade not null,
  title text not null,
  description text,
  client_level_before integer not null check (client_level_before > 0),
  client_level_after integer not null check (client_level_after > 0),
  price integer not null check (price >= 0),
  service_date date not null,
  image_urls text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- RLS 활성화
alter table public.profiles enable row level security;
alter table public.characters enable row level security;
alter table public.service_records enable row level security;

-- profiles RLS
create policy "누구나 프로필을 볼 수 있음" on public.profiles
  for select using (true);

create policy "자신의 프로필만 생성 가능" on public.profiles
  for insert with check (auth.uid() = user_id);

create policy "자신의 프로필만 수정 가능" on public.profiles
  for update using (auth.uid() = user_id);

-- characters RLS
create policy "누구나 캐릭터를 볼 수 있음" on public.characters
  for select using (true);

create policy "자신의 캐릭터만 생성 가능" on public.characters
  for insert with check (
    auth.uid() = (select user_id from public.profiles where id = profile_id)
  );

create policy "자신의 캐릭터만 수정 가능" on public.characters
  for update using (
    auth.uid() = (select user_id from public.profiles where id = profile_id)
  );

-- service_records RLS
create policy "누구나 이력을 볼 수 있음" on public.service_records
  for select using (true);

create policy "자신의 이력만 추가 가능" on public.service_records
  for insert with check (
    auth.uid() = (
      select p.user_id from public.profiles p
      join public.characters c on c.profile_id = p.id
      where c.id = character_id
    )
  );

create policy "자신의 이력만 삭제 가능" on public.service_records
  for delete using (
    auth.uid() = (
      select p.user_id from public.profiles p
      join public.characters c on c.profile_id = p.id
      where c.id = character_id
    )
  );

-- Storage 버킷 생성
-- insert into storage.buckets (id, name, public) values ('service-records', 'service-records', true);
