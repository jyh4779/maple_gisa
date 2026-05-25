-- nickname, character_name 중복 방지
alter table public.profiles add constraint profiles_nickname_unique unique (nickname);
alter table public.profiles add constraint profiles_character_name_unique unique (character_name);
