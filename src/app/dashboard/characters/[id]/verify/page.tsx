"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, RefreshCw, Upload } from "lucide-react";

type CodeState =
  | { status: "loading" }
  | { status: "verified" }
  | { status: "pending" }
  | { status: "ready"; code: string; expiresAt: string }
  | { status: "error"; message: string };

export default function VerifyPage() {
  const { id: characterId } = useParams<{ id: string }>();
  const [codeState, setCodeState] = useState<CodeState>({ status: "loading" });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const router = useRouter();

  const fetchCode = useCallback(async () => {
    setCodeState({ status: "loading" });
    try {
      const res = await fetch(`/api/verify-character?characterId=${characterId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.verified) {
        setCodeState({ status: "verified" });
      } else if (data.pending) {
        setCodeState({ status: "pending" });
      } else {
        setCodeState({ status: "ready", code: data.code, expiresAt: data.expiresAt });
      }
    } catch (e: unknown) {
      setCodeState({ status: "error", message: e instanceof Error ? e.message : "오류 발생" });
    }
  }, [characterId]);

  useEffect(() => { fetchCode(); }, [fetchCode]);

  useEffect(() => {
    if (codeState.status !== "ready") return;
    const update = () => {
      const diff = Math.floor((new Date(codeState.expiresAt).getTime() - Date.now()) / 1000);
      setTimeLeft(diff > 0 ? diff : 0);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [codeState]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!image) { toast.error("스크린샷을 업로드해주세요."); return; }
    setSubmitting(true);
    const formData = new FormData();
    formData.append("image", image);
    try {
      const res = await fetch(`/api/verify-character?characterId=${characterId}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("인증 신청 완료! 관리자 검토 후 승인됩니다.");
        router.push("/dashboard");
        router.refresh();
      } else {
        if (data.details) {
          const msgs = [];
          if (!data.details.nameMatch)
            msgs.push(`캐릭터명 불일치 (인식: "${data.details.detectedName ?? "인식 불가"}")`);
          if (!data.details.codeMatch)
            msgs.push(`코드 불일치 (인식: "${data.details.detectedMessage ?? "인식 불가"}")`);
          toast.error("인증 실패: " + msgs.join(", "));
        } else {
          toast.error(data.error ?? "인증 실패");
        }
      }
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
    }
    setSubmitting(false);
  };

  if (codeState.status === "loading") {
    return <div className="text-muted-foreground py-10 text-center">코드 생성 중...</div>;
  }

  if (codeState.status === "verified") {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h2 className="text-xl font-bold">이미 인증된 캐릭터입니다</h2>
        <Button onClick={() => router.push("/dashboard")}>대시보드로</Button>
      </div>
    );
  }

  if (codeState.status === "pending") {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
          <RefreshCw className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold">인증 검토 중</h2>
        <p className="text-muted-foreground text-sm">
          스크린샷이 제출되었습니다. 관리자 검토 후 인증이 승인됩니다.
        </p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>대시보드로</Button>
      </div>
    );
  }

  if (codeState.status === "error") {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <p className="text-destructive">{codeState.message}</p>
        <Button onClick={fetchCode}>다시 시도</Button>
      </div>
    );
  }

  const minutes = Math.floor((timeLeft ?? 0) / 60);
  const seconds = (timeLeft ?? 0) % 60;
  const isExpired = (timeLeft ?? 0) <= 0;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">캐릭터 인증</h1>
        <p className="text-muted-foreground text-sm mt-1">
          실제 캐릭터 소유자임을 인증하면 프로필에 인증 뱃지가 표시됩니다.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Step 1. 아래 코드를 게임 채팅창에 입력하세요</CardTitle>
          <CardDescription>
            캐릭터 이름이 보이는 상태에서 채팅창에 코드를 그대로 입력하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-muted rounded-lg px-6 py-3 font-mono text-3xl font-bold tracking-widest">
              {codeState.code}
            </div>
            <Button variant="ghost" size="icon" onClick={fetchCode} title="코드 재발급">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          {isExpired ? (
            <p className="text-sm text-destructive">
              코드가 만료되었습니다.{" "}
              <button className="underline font-medium" onClick={fetchCode}>새 코드 발급</button>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              유효 시간:{" "}
              <span className={timeLeft !== null && timeLeft < 60 ? "text-destructive font-medium" : ""}>
                {minutes}:{String(seconds).padStart(2, "0")}
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Step 2. 스크린샷을 업로드하세요</CardTitle>
          <CardDescription>캐릭터 이름과 채팅 말풍선이 모두 보여야 합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition-colors">
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">클릭하여 스크린샷 선택</span>
            <span className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP, GIF</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
          {preview && (
            <div className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="업로드한 스크린샷" className="w-full rounded-lg border object-contain max-h-72" />
              <div className="flex items-center gap-2">
                <Badge variant="secondary">업로드 완료</Badge>
                <span className="text-xs text-muted-foreground">{image?.name}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => router.back()}>취소</Button>
        <Button
          className="flex-1"
          disabled={!image || submitting || isExpired}
          onClick={handleSubmit}
        >
          {submitting ? "AI 분석 중..." : "인증하기"}
        </Button>
      </div>
    </div>
  );
}
