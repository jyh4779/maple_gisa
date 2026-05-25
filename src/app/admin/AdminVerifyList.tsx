"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminVerifyList({ characterId }: { characterId: string }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const router = useRouter();

  const handleAction = async (action: "approve" | "reject") => {
    setLoading(action);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(action === "approve" ? "인증 승인 완료" : "인증 거절 완료");
        router.refresh();
      } else {
        toast.error(data.error ?? "처리 실패");
      }
    } catch {
      toast.error("네트워크 오류");
    }
    setLoading(null);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
        disabled={!!loading}
        onClick={() => handleAction("reject")}
      >
        <XCircle className="w-4 h-4 mr-1.5" />
        {loading === "reject" ? "처리 중..." : "거절 (재신청 가능)"}
      </Button>
      <Button
        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        disabled={!!loading}
        onClick={() => handleAction("approve")}
      >
        <CheckCircle className="w-4 h-4 mr-1.5" />
        {loading === "approve" ? "처리 중..." : "승인"}
      </Button>
    </div>
  );
}
