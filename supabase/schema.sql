-- profiles 테이블
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  nickname text not null,
  character_name text not null,
  server_class text not null check (server_class in ('전사', '마법사', '궁수', '도적', '해적')),
  level integer not null check (level > 0 and level <= 999),
  description text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- service_records 테이블
create table public.service_records (
  id uuid primary key default gen_random_uuid(),
  knight_id uuid references public.profiles(id) on delete cascade not null,
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
alter table public.service_records enable row level security;

-- profiles RLS 정책
create policy "누구나 프로필을 볼 수 있음" on public.profiles
  for select using (true);

create policy "자신의 프로필만 생성 가능" on public.profiles
  for insert with check (auth.uid() = user_id);

create policy "자신의 프로필만 수정 가능" on public.profiles
  for update using (auth.uid() = user_id);

-- service_records RLS 정책
create policy "누구나 이력을 볼 수 있음" on public.service_records
  for select using (true);

create policy "자신의 이력만 추가 가능" on public.service_records
  for insert with check (
    auth.uid() = (select user_id from public.profiles where id = knight_id)
  );

create policy "자신의 이력만 삭제 가능" on public.service_records
  for delete using (
    auth.uid() = (select user_id from public.profiles where id = knight_id)
  );

-- Storage 버킷 생성 (Supabase 대시보드에서 직접 생성하거나 아래 SQL 실행)
-- insert into storage.buckets (id, name, public) values ('service-records', 'service-records', true);

-- Storage RLS
-- create policy "누구나 이미지를 볼 수 있음" on storage.objects
--   for select using (bucket_id = 'service-records');

-- create policy "인증된 유저만 업로드 가능" on storage.objects
--   for insert with check (bucket_id = 'service-records' and auth.role() = 'authenticated');
