-- 기존 service_records에 테스트용 손님 닉네임 채우기
-- (이미 마이그레이션으로 client_nickname 컬럼이 추가된 후 실행)

with ranked as (
  select id, row_number() over (order by created_at) as rn
  from public.service_records
  where client_nickname is null
)
update public.service_records sr
set client_nickname = case r.rn % 10
  when 1 then '달빛전사'
  when 2 then '얼음왕자'
  when 3 then '바람의딸'
  when 4 then '불꽃기사'
  when 5 then '숲의수호자'
  when 6 then '천둥궁수'
  when 7 then '어둠의검사'
  when 8 then '별빛마법사'
  when 9 then '폭풍도적'
  when 0 then '해적왕'
end
from ranked r
where sr.id = r.id;
