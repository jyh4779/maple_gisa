"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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

export default function SignupPage() {
  const [step, setStep] = useState<"account" | "profile">("account");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [serverClass, setServerClass] = useState<ServerClass>("전사");
  const [level, setLevel] = useState("");
  const [description, setDescription] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      toast.error("회원가입 실패: " + authError?.message);
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: authData.user.id,
      nickname,
      character_name: characterName,
      server_class: serverClass,
      level: parseInt(level),
      description: description || null,
    });

    if (profileError) {
      toast.error("프로필 생성 실패: " + profileError.message);
    } else {
      toast.success("회원가입 완료! 대시보드로 이동합니다.");
      router.push("/dashboard");
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-start pt-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>쩔기사 등록</CardTitle>
          <CardDescription>
            쩔기사로 등록하여 이력을 관리하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "account" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep("profile");
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="8자 이상"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                다음 단계
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                이미 계정이 있으신가요?{" "}
                <Link
                  href="/auth/login"
                  className="text-primary hover:underline"
                >
                  로그인
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nickname">닉네임</Label>
                <Input
                  id="nickname"
                  placeholder="활동할 닉네임"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                />
              </div>
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
                  <Label htmlFor="level">캐릭터 레벨</Label>
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
                  placeholder="서비스 가능 시간, 전문 구간 등 자유롭게 적어주세요"
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
                  onClick={() => setStep("account")}
                >
                  이전
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "처리 중..." : "등록 완료"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
