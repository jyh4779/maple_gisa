-- Step 1: characters 테이블 생성
create table if not exists public.characters (
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

-- Step 2: RLS 활성화
alter table public.characters enable row level security;

-- Step 3: characters RLS 정책 (기존 정책 삭제 후 재생성)
drop policy if exists "누구나 캐릭터를 볼 수 있음" on public.characters;
drop policy if exists "자신의 캐릭터만 추가 가능" on public.characters;
drop policy if exists "자신의 캐릭터만 수정 가능" on public.characters;
drop policy if exists "자신의 캐릭터만 삭제 가능" on public.characters;

create policy "누구나 캐릭터를 볼 수 있음" on public.characters
  for select using (true);

create policy "자신의 캐릭터만 추가 가능" on public.characters
  for insert with check (
    auth.uid() = (select user_id from public.profiles where id = profile_id)
  );

create policy "자신의 캐릭터만 수정 가능" on public.characters
  for update using (
    auth.uid() = (select user_id from public.profiles where id = profile_id)
  );

create policy "자신의 캐릭터만 삭제 가능" on public.characters
  for delete using (
    auth.uid() = (select user_id from public.profiles where id = profile_id)
  );

-- Step 4: (skip) profiles 테이블에 캐릭터 컬럼이 이미 제거된 상태

-- Step 5: service_records에 character_id 컬럼 추가
alter table public.service_records
  add column if not exists character_id uuid references public.characters(id) on delete cascade;

-- Step 6: (skip) knight_id 컬럼이 이미 제거된 상태

-- Step 7: service_records RLS 정책 업데이트 (기존 정책 삭제 후 재생성)
drop policy if exists "자신의 이력만 추가 가능" on public.service_records;
drop policy if exists "자신의 이력만 삭제 가능" on public.service_records;

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
