"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type AuthState = "unauthenticated" | "no-profile" | "ready";

export default function RegisterButton() {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAuthState("unauthenticated");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .single();
      setAuthState(profile ? "ready" : "no-profile");
    })();
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
    router.push(authState === "no-profile" ? "/auth/signup?step=profile" : "/dashboard/characters/new");
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
