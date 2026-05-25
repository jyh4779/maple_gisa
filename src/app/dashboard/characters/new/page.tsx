"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { ServerClass } from "@/types";

const SERVER_CLASSES: ServerClass[] = ["전사", "마법사", "궁수", "도적", "해적"];

export default function NewCharacterPage() {
  const [characterName, setCharacterName] = useState("");
  const [serverClass, setServerClass] = useState<ServerClass>("전사");
  const [level, setLevel] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      toast.error("프로필을 찾을 수 없습니다.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("characters").insert({
      profile_id: profile.id,
      character_name: characterName,
      server_class: serverClass,
      level: parseInt(level),
      description: description || null,
    });

    if (error) {
      if (error.message.includes("unique") || error.message.includes("characters_character_name")) {
        toast.error("이미 등록된 캐릭터명입니다.");
      } else {
        toast.error("캐릭터 등록 실패: " + error.message);
      }
    } else {
      toast.success("캐릭터가 등록되었습니다!");
      router.push("/dashboard");
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>캐릭터 등록</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="characterName">캐릭터명</Label>
              <Input
                id="characterName"
                placeholder="인게임 캐릭터 이름"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>직업 계열</Label>
                <Select
                  value={serverClass}
                  onValueChange={(v) => setServerClass(v as ServerClass)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVER_CLASSES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="level">레벨</Label>
                <Input
                  id="level"
                  type="number"
                  placeholder="ex) 200"
                  min={1}
                  max={999}
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">소개 (선택)</Label>
              <Textarea
                id="description"
                placeholder="서비스 가능 시간, 전문 구간 등"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                취소
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "등록 중..." : "등록 완료"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
