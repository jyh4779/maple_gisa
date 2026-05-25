-- profiles 테이블에 인증 관련 컬럼 추가
alter table public.profiles
  add column if not exists is_verified boolean not null default false,
  add column if not exists verification_code text,
  add column if not exists verification_expires_at timestamptz;
