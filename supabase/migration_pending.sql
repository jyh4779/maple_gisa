-- ============================================================
-- 한 번에 실행하는 미적용 마이그레이션 모음
-- Supabase SQL Editor에 전체 붙여넣기 후 실행
-- ============================================================

-- 1. characters 테이블: verification_screenshot_url 컬럼 추가
alter table public.characters
  add column if not exists verification_screenshot_url text;

-- 2. service_records 테이블: 신규 컬럼 추가
--    · service_date  date → timestamptz 로 변환
--    · exp_gained, hunt_duration_minutes 추가
--    · client_level_before / client_level_after 제거 (폼에서 제거됨)

-- 2-a. 기존 date 컬럼을 timestamptz 로 변환
alter table public.service_records
  alter column service_date type timestamptz using service_date::timestamptz;

-- 2-b. client_level 컬럼 제거 (not null 제약 포함)
alter table public.service_records
  drop column if exists client_level_before,
  drop column if exists client_level_after;

-- 2-c. 신규 컬럼 추가
alter table public.service_records
  add column if not exists exp_gained bigint,
  add column if not exists hunt_duration_minutes integer,
  add column if not exists hunting_ground text;

-- 3. service_records UPDATE RLS 정책 추가
--    (PATCH API는 adminSupabase로 우회하므로 실질적 보안은 코드 레벨이지만
--     RLS 정책도 명시적으로 추가해 둠)
drop policy if exists "자신의 이력만 수정 가능" on public.service_records;
create policy "자신의 이력만 수정 가능" on public.service_records
  for update using (
    auth.uid() = (
      select p.user_id from public.profiles p
      join public.characters c on c.profile_id = p.id
      where c.id = character_id
    )
  );

-- 4. record_comments 테이블 생성
create table if not exists public.record_comments (
  id           uuid primary key default gen_random_uuid(),
  record_id    uuid references public.service_records(id) on delete cascade not null,
  author_name  text not null,
  content      text not null,
  image_url    text,
  created_at   timestamptz not null default now()
);

-- 4-a. RLS 활성화
alter table public.record_comments enable row level security;

-- 4-b. 누구나 댓글 조회 가능
drop policy if exists "누구나 댓글을 볼 수 있음" on public.record_comments;
create policy "누구나 댓글을 볼 수 있음" on public.record_comments
  for select using (true);

-- 4-c. 누구나 댓글 작성 가능 (익명 손님 지원)
drop policy if exists "누구나 댓글을 작성할 수 있음" on public.record_comments;
create policy "누구나 댓글을 작성할 수 있음" on public.record_comments
  for insert with check (true);

-- 4-d. 이력 소유자(쩔기사)만 댓글 삭제 가능
drop policy if exists "이력 소유자만 댓글을 삭제할 수 있음" on public.record_comments;
create policy "이력 소유자만 댓글을 삭제할 수 있음" on public.record_comments
  for delete using (
    auth.uid() = (
      select p.user_id
      from public.profiles p
      join public.characters c on c.profile_id = p.id
      join public.service_records sr on sr.character_id = c.id
      where sr.id = record_id
    )
  );
