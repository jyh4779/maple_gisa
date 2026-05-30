"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type AuthState = "unauthenticated" | "ready";

export default function RegisterButton() {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(session ? "ready" : "unauthenticated");
    });
  }, []);

  const handleClick = async () => {
    if (authState === "unauthenticated" || authState === null) {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      return;
    }
    router.push("/dashboard");
  };

  return (
    <Button
      size="lg"
      variant="outline"
      className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white hover:border-white/60"
      onClick={handleClick}
    >
      기사로 등록하기
    </Button>
  );
}
