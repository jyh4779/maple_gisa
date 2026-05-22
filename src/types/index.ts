export type ServerClass =
  | "전사"
  | "마법사"
  | "궁수"
  | "도적"
  | "해적";

export type Profile = {
  id: string;
  user_id: string;
  nickname: string;
  character_name: string;
  server_class: ServerClass;
  level: number;
  description: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type ServiceRecord = {
  id: string;
  knight_id: string;
  title: string;
  description: string | null;
  client_level_before: number;
  client_level_after: number;
  price: number;
  service_date: string;
  image_urls: string[];
  created_at: string;
};
