-- 기존 테이블 전체 삭제 후 재생성 (데이터 없을 때 실행)
drop table if exists public.service_records cascade;
drop table if exists public.profiles cascade;
drop table if exists public.characters cascade;

-- schema.sql 내용 그대로 실행
-- (Supabase SQL Editor에서 schema.sql 전체를 붙여넣어 실행)
