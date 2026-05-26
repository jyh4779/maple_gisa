-- service_records 테이블: client_nickname 컬럼 추가
alter table public.service_records
  add column if not exists client_nickname text;
