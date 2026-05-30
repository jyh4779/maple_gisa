"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import HuntingGroundInput from "@/components/HuntingGroundInput";
import { createServiceRecord } from "@/repositories/serviceRecords";

export default function NewRecordPage() {
  return (
    <Suspense>
      <NewRecordForm />
    </Suspense>
  );
}

function NewRecordForm() {
  const searchParams = useSearchParams();
  const characterId = searchParams.get("characterId");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientNickname, setClientNickname] = useState("");
  const [price, setPrice] = useState("");
  const [serviceDate, setServiceDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [expGained, setExpGained] = useState("");
  const [huntHours, setHuntHours] = useState("");
  const [huntMinutes, setHuntMinutes] = useState("");
  const [huntingGround, setHuntingGround] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNumericInput = (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value.replace(/[^0-9]/g, ""));
    };

  const withCommas = (val: string) =>
    val ? parseInt(val).toLocaleString() : "";

  useEffect(() => {
    if (!characterId) {
      toast.error("캐릭터를 선택해주세요.");
      router.replace("/dashboard");
    }
  }, [characterId, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length + images.length > 5) {
      toast.error("사진은 최대 5장까지 업로드할 수 있습니다.");
      return;
    }
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterId) return;
    setLoading(true);
    const supabase = createClient();

    const imageUrls: string[] = [];
    for (const file of images) {
      const ext = file.name.split(".").pop();
      const path = `${characterId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("service-records")
        .upload(path, file);

      if (uploadError) {
        toast.error("이미지 업로드 실패: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("service-records")
        .getPublicUrl(path);

      imageUrls.push(urlData.publicUrl);
    }

    const huntDurationMinutes =
      (parseInt(huntHours || "0") * 60) + parseInt(huntMinutes || "0") || null;

    const { error } = await createServiceRecord(supabase, {
      character_id: characterId,
      title,
      description: description || null,
      client_nickname: clientNickname || null,
      price: parseInt(price),
      service_date: new Date(serviceDate).toISOString(),
      exp_gained: expGained ? parseInt(expGained.replace(/,/g, "")) : null,
      hunt_duration_minutes: huntDurationMinutes,
      hunting_ground: huntingGround || null,
      image_urls: imageUrls,
    });

    if (error) {
      toast.error("이력 등록 실패: " + error.message);
    } else {
      toast.success("이력이 등록되었습니다!");
      router.push("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>파티 지원 이력 추가</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                placeholder="ex) 어두운 숲 파티 지원"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price">비용 (메소)</Label>
                <Input
                  id="price"
                  type="text"
                  inputMode="numeric"
                  placeholder="10,000,000"
                  value={withCommas(price)}
                  onChange={handleNumericInput(setPrice)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="serviceDate">서비스 일시</Label>
                <Input
                  id="serviceDate"
                  type="datetime-local"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="expGained">경험치 획득량</Label>
                <Input
                  id="expGained"
                  type="text"
                  inputMode="numeric"
                  placeholder="12,500,000"
                  value={withCommas(expGained)}
                  onChange={handleNumericInput(setExpGained)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>사냥 시간</Label>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    min={0}
                    max={23}
                    placeholder="0"
                    value={huntHours}
                    onChange={(e) => setHuntHours(e.target.value)}
                    className="w-full"
                  />
                  <span className="text-sm text-muted-foreground shrink-0">시간</span>
                  <Input
                    type="number"
                    min={0}
                    max={59}
                    placeholder="0"
                    value={huntMinutes}
                    onChange={(e) => setHuntMinutes(e.target.value)}
                    className="w-full"
                  />
                  <span className="text-sm text-muted-foreground shrink-0">분</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>사냥터 (선택)</Label>
              <HuntingGroundInput value={huntingGround} onChange={setHuntingGround} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="clientNickname">손님 닉네임 (선택)</Label>
              <Input
                id="clientNickname"
                placeholder="파티를 신청한 손님의 닉네임"
                value={clientNickname}
                onChange={(e) => setClientNickname(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">설명 (선택)</Label>
              <Textarea
                id="description"
                placeholder="서비스 상세 내용, 특이사항 등"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label>인증 사진 (최대 5장)</Label>
              <Input type="file" accept="image/*" multiple onChange={handleImageChange} />
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {images.map((file, i) => (
                    <div key={i} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`미리보기 ${i + 1}`}
                        className="w-20 h-20 object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                취소
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "등록 중..." : "이력 등록"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
