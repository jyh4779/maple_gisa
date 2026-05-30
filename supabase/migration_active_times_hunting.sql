alter table public.characters
  add column active_times text[] not null default '{}',
  add column preferred_hunting_grounds text[] not null default '{}';
