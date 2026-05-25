"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function SignupPage() {
  return (
    <Suspense>
      <NicknameForm />
    </Suspense>
  );
}

function NicknameForm() {
  const searchParams = useSearchParams();
  const isProfileStep = searchParams.get("step") === "profile";
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!isProfileStep || !user) router.replace("/");
    });
  }, [isProfileStep, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("로그인 세션이 없습니다. 다시 시도해주세요.");
      router.push("/");
      return;
    }

    const { error } = await supabase.from("profiles").insert({
      user_id: user.id,
      nickname,
    });

    if (error) {
      if (error.message.includes("unique")) {
        toast.error("이미 사용 중인 닉네임입니다.");
      } else {
        toast.error("가입 실패: " + error.message);
      }
    } else {
      toast.success("가입 완료!");
      router.push("/dashboard");
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-start pt-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>파티 지원기사 가입</CardTitle>
          <CardDescription>활동할 닉네임을 입력해주세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "처리 중..." : "시작하기"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
