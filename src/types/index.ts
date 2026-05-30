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
  avatar_url: string | null;
  created_at: string;
};

export type Character = {
  id: string;
  profile_id: string;
  character_name: string;
  server_class: ServerClass;
  level: number;
  description: string | null;
  active_times: string[];
  preferred_hunting_grounds: string[];
  is_verified: boolean;
  verification_code: string | null;
  verification_expires_at: string | null;
  verification_screenshot_url: string | null;
  created_at: string;
};

export type RecordComment = {
  id: string;
  record_id: string;
  author_name: string;
  content: string;
  image_url: string | null;
  created_at: string;
};

export type ServiceRecord = {
  id: string;
  character_id: string;
  title: string;
  description: string | null;
  client_nickname: string | null;
  price: number;
  service_date: string;
  exp_gained: number | null;
  hunt_duration_minutes: number | null;
  hunting_ground: string | null;
  image_urls: string[];
  created_at: string;
};
