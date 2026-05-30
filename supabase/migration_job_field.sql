-- server_class 제약 조건에 시그너스 추가
ALTER TABLE public.characters DROP CONSTRAINT IF EXISTS characters_server_class_check;
ALTER TABLE public.characters ADD CONSTRAINT characters_server_class_check
  CHECK (server_class IN ('전사', '마법사', '궁수', '도적', '해적', '시그너스'));

-- 세부 직업명 컬럼 추가
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS job text;
