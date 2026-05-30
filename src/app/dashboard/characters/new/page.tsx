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
import { JOB_CATEGORIES, JOB_TREE, type JobCategory } from "@/lib/jobs";
import { getProfileIdByUserId } from "@/repositories/profiles";
import { createCharacter } from "@/repositories/characters";

const TIME_SLOTS = ["오전", "오후", "저녁", "심야"] as const;
const HUNTING_GROUND_PRESETS = ["잠실역", "난파선", "파사정령의 숲", "부활하는 기억", "깊은 바다 협곡2"];

export default function NewCharacterPage() {
  const [characterName, setCharacterName] = useState("");
  const [jobCategory, setJobCategory] = useState<JobCategory>("전사");
  const [job, setJob] = useState<string>(JOB_TREE["전사"][0]);
  const [level, setLevel] = useState("");
  const [description, setDescription] = useState("");
  const [activeTimes, setActiveTimes] = useState<string[]>([]);
  const [preferredGrounds, setPreferredGrounds] = useState<string[]>([]);
  const [customGround, setCustomGround] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCategoryChange = (category: JobCategory) => {
    setJobCategory(category);
    setJob(JOB_TREE[category][0]);
  };

  const toggleTime = (t: string) => {
    setActiveTimes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const togglePresetGround = (g: string) => {
    setPreferredGrounds((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const addCustomGround = () => {
    const trimmed = customGround.trim();
    if (trimmed && !preferredGrounds.includes(trimmed)) {
      setPreferredGrounds((prev) => [...prev, trimmed]);
    }
    setCustomGround("");
  };

  const removeGround = (g: string) => {
    setPreferredGrounds((prev) => prev.filter((x) => x !== g));
  };

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

    const { data: profile } = await getProfileIdByUserId(supabase, user.id);
    if (!profile) {
      toast.error("프로필을 찾을 수 없습니다.");
      setLoading(false);
      return;
    }

    const { error } = await createCharacter(supabase, {
      profile_id: profile.id,
      character_name: characterName,
      server_class: jobCategory,
      job,
      level: parseInt(level),
      description: description || null,
      active_times: activeTimes,
      preferred_hunting_grounds: preferredGrounds,
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
                  value={jobCategory}
                  onValueChange={(v) => handleCategoryChange(v as JobCategory)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>직업</Label>
                <Select value={job} onValueChange={(v) => v && setJob(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TREE[jobCategory].map((j) => (
                      <SelectItem key={j} value={j}>
                        {j}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

            <div className="space-y-1.5">
              <Label>주요 활동 시간대 (선택)</Label>
              <div className="flex gap-2">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTime(t)}
                    className={`flex-1 rounded-md border py-1.5 text-sm font-medium transition-colors ${
                      activeTimes.includes(t)
                        ? "border-transparent bg-primary text-primary-foreground"
                        : "border-input bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>주요 활동 사냥터 (선택)</Label>
              <div className="flex flex-wrap gap-1.5">
                {HUNTING_GROUND_PRESETS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => togglePresetGround(g)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      preferredGrounds.includes(g)
                        ? "border-transparent bg-primary text-primary-foreground"
                        : "border-input bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="직접 입력"
                  value={customGround}
                  onChange={(e) => setCustomGround(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomGround();
                    }
                  }}
                  className="h-8 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomGround}
                  disabled={!customGround.trim()}
                >
                  추가
                </Button>
              </div>
              {preferredGrounds.filter((g) => !HUNTING_GROUND_PRESETS.includes(g)).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {preferredGrounds
                    .filter((g) => !HUNTING_GROUND_PRESETS.includes(g))
                    .map((g) => (
                      <span
                        key={g}
                        className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                      >
                        {g}
                        <button
                          type="button"
                          onClick={() => removeGround(g)}
                          className="ml-0.5 opacity-70 hover:opacity-100"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              )}
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
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
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
