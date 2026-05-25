"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ImageOff, X } from "lucide-react";
import type { ServiceRecord } from "@/types";
import HuntingGroundInput from "@/components/HuntingGroundInput";

interface Props {
  record: ServiceRecord;
  open: boolean;
  onClose: () => void;
  onSaved: (updated: ServiceRecord) => void;
}

export default function RecordEditModal({ record, open, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(record.title);
  const [description, setDescription] = useState(record.description ?? "");
  const [price, setPrice] = useState(String(record.price));
  const [serviceDate, setServiceDate] = useState(
    new Date(record.service_date).toISOString().slice(0, 16)
  );
  const [expGained, setExpGained] = useState(record.exp_gained != null ? String(record.exp_gained) : "");
  const [huntHours, setHuntHours] = useState(
    record.hunt_duration_minutes != null ? String(Math.floor(record.hunt_duration_minutes / 60)) : ""
  );
  const [huntMinutes, setHuntMinutes] = useState(
    record.hunt_duration_minutes != null ? String(record.hunt_duration_minutes % 60) : ""
  );
  const [huntingGround, setHuntingGround] = useState(record.hunting_ground ?? "");
  const [keepUrls, setKeepUrls] = useState<string[]>(record.image_urls);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleNumericInput = (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setter(e.target.value.replace(/[^0-9]/g, ""));

  const withCommas = (val: string) => val ? parseInt(val).toLocaleString() : "";

  const removeExisting = (url: string) => setKeepUrls((prev) => prev.filter((u) => u !== url));
  const removeNew = (i: number) => setNewImages((prev) => prev.filter((_, idx) => idx !== i));

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const total = keepUrls.length + newImages.length + files.length;
    if (total > 5) { toast.error("사진은 최대 5장까지입니다."); return; }
    setNewImages((prev) => [...prev, ...files]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const huntDuration =
      (parseInt(huntHours || "0") * 60) + parseInt(huntMinutes || "0") || null;

    const formData = new FormData();
    formData.append("data", JSON.stringify({
      title,
      description: description || null,
      price: parseInt(price.replace(/,/g, "")),
      service_date: new Date(serviceDate).toISOString(),
      exp_gained: expGained ? parseInt(expGained.replace(/,/g, "")) : null,
      hunt_duration_minutes: huntDuration,
      hunting_ground: huntingGround || null,
      keepImageUrls: keepUrls,
    }));
    for (const f of newImages) formData.append("images", f);

    try {
      const res = await fetch(`/api/records/${record.id}`, { method: "PATCH", body: formData });
      const data = await res.json();
      if (res.ok) {
        toast.success("이력이 수정되었습니다.");
        onSaved(data.record as ServiceRecord);
      } else {
        toast.error(data.error ?? "수정 실패");
      }
    } catch {
      toast.error("네트워크 오류");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>이력 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>제목</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>비용 (메소)</Label>
              <Input
                type="text" inputMode="numeric"
                value={withCommas(price)}
                onChange={handleNumericInput(setPrice)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>서비스 일시</Label>
              <Input
                type="datetime-local"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>경험치 획득량</Label>
              <Input
                type="text" inputMode="numeric"
                placeholder="12,500,000"
                value={withCommas(expGained)}
                onChange={handleNumericInput(setExpGained)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>사냥 시간</Label>
              <div className="flex items-center gap-1.5">
                <Input type="number" min={0} max={23} placeholder="0"
                  value={huntHours} onChange={(e) => setHuntHours(e.target.value)} />
                <span className="text-sm text-muted-foreground shrink-0">시간</span>
                <Input type="number" min={0} max={59} placeholder="0"
                  value={huntMinutes} onChange={(e) => setHuntMinutes(e.target.value)} />
                <span className="text-sm text-muted-foreground shrink-0">분</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>사냥터</Label>
            <HuntingGroundInput value={huntingGround} onChange={setHuntingGround} />
          </div>

          <div className="space-y-1.5">
            <Label>설명</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>

          {/* 기존 이미지 */}
          {keepUrls.length > 0 && (
            <div className="space-y-1.5">
              <Label>기존 사진</Label>
              <div className="flex flex-wrap gap-2">
                {keepUrls.map((url) => (
                  <div key={url} className="relative w-20 h-20">
                    <Image src={url} alt="이력 사진" fill className="object-cover rounded-md border" />
                    <button
                      type="button"
                      onClick={() => removeExisting(url)}
                      className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 새 이미지 */}
          <div className="space-y-1.5">
            <Label>사진 추가 (현재 {keepUrls.length + newImages.length}/5장)</Label>
            <Input
              type="file" accept="image/*" multiple
              onChange={handleAddImages}
              disabled={keepUrls.length + newImages.length >= 5}
            />
            {newImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {newImages.map((file, i) => (
                  <div key={i} className="relative w-20 h-20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={URL.createObjectURL(file)} alt="미리보기"
                      className="w-20 h-20 object-cover rounded-md border" />
                    <button
                      type="button" onClick={() => removeNew(i)}
                      className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>취소</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "저장 중..." : "저장"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
