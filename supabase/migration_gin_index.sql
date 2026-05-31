-- 사냥터 배열 검색을 위한 GIN 인덱스
CREATE INDEX IF NOT EXISTS idx_characters_preferred_hunting_grounds
  ON public.characters USING GIN (preferred_hunting_grounds);

-- 활동 시간대 배열 검색을 위한 GIN 인덱스
CREATE INDEX IF NOT EXISTS idx_characters_active_times
  ON public.characters USING GIN (active_times);
