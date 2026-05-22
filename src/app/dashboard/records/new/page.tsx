"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function NewRecordPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [levelBefore, setLevelBefore] = useState("");
  const [levelAfter, setLevelAfter] = useState("");
  const [price, setPrice] = useState("");
  const [serviceDate, setServiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
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

    // 이미지 업로드
    const imageUrls: string[] = [];
    for (const file of images) {
      const ext = file.name.split(".").pop();
      const path = `${profile.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

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

    const { error } = await supabase.from("service_records").insert({
      knight_id: profile.id,
      title,
      description: description || null,
      client_level_before: parseInt(levelBefore),
      client_level_after: parseInt(levelAfter),
      price: parseInt(price),
      service_date: serviceDate,
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
    <div className="max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>쩔 이력 추가</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                placeholder="ex) 어두운 숲 50→60 쩔"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="levelBefore">쩔 전 레벨</Label>
                <Input
                  id="levelBefore"
                  type="number"
                  min={1}
                  max={999}
                  placeholder="50"
                  value={levelBefore}
                  onChange={(e) => setLevelBefore(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="levelAfter">쩔 후 레벨</Label>
                <Input
                  id="levelAfter"
                  type="number"
                  min={1}
                  max={999}
                  placeholder="60"
                  value={levelAfter}
                  onChange={(e) => setLevelAfter(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price">비용 (메소)</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  placeholder="10000000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="serviceDate">서비스 날짜</Label>
                <Input
                  id="serviceDate"
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  required
                />
              </div>
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
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
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
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
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
