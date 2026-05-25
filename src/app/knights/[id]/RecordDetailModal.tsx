"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, ImageOff, Pencil, Trash2, Upload, X } from "lucide-react";
import type { RecordComment, ServiceRecord } from "@/types";

interface Props {
  record: ServiceRecord;
  isOwner: boolean;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDeleted: () => void;
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}시간${m > 0 ? ` ${m}분` : ""}` : `${m}분`;
}

export default function RecordDetailModal({ record, isOwner, open, onClose, onEdit, onDeleted }: Props) {
  const [imgIndex, setImgIndex] = useState(0);
  const [comments, setComments] = useState<RecordComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 댓글 폼
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [commentImage, setCommentImage] = useState<File | null>(null);
  const [commentImagePreview, setCommentImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const images = record.image_urls;

  useEffect(() => {
    if (!open) return;
    setImgIndex(0);
    setCommentsLoading(true);
    fetch(`/api/comments?record_id=${record.id}`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []))
      .finally(() => setCommentsLoading(false));
  }, [open, record.id]);

  const handleDelete = async () => {
    if (!confirm("이 이력을 삭제하시겠습니까?")) return;
    setDeleting(true);
    const res = await fetch(`/api/records/${record.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("이력이 삭제되었습니다.");
      onDeleted();
    } else {
      toast.error("삭제 실패");
    }
    setDeleting(false);
  };

  const handleCommentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCommentImage(file);
    setCommentImagePreview(URL.createObjectURL(file));
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.append("record_id", record.id);
    formData.append("author_name", authorName.trim());
    formData.append("content", content.trim());
    if (commentImage) formData.append("image", commentImage);

    try {
      const res = await fetch("/api/comments", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [...prev, data.comment]);
        setAuthorName("");
        setContent("");
        setCommentImage(null);
        setCommentImagePreview(null);
        toast.success("댓글이 등록되었습니다.");
      } else {
        toast.error(data.error ?? "댓글 등록 실패");
      }
    } catch {
      toast.error("네트워크 오류");
    }
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } else {
      toast.error("댓글 삭제 실패");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* 이미지 슬라이더 */}
        {images.length > 0 ? (
          <div className="relative bg-black aspect-video w-full shrink-0">
            <Image src={images[imgIndex]} alt={`이력 사진 ${imgIndex + 1}`} fill className="object-contain" />
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white rounded-full p-1"
                  onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
                ><ChevronLeft className="w-5 h-5" /></button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white rounded-full p-1"
                  onClick={() => setImgIndex((i) => (i + 1) % images.length)}
                ><ChevronRight className="w-5 h-5" /></button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setImgIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full ${i === imgIndex ? "bg-white" : "bg-white/40"}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center bg-muted aspect-video w-full shrink-0">
            <ImageOff className="w-10 h-10 text-muted-foreground" />
          </div>
        )}

        {/* 스크롤 영역 */}
        <div className="overflow-y-auto flex-1">
          {/* 상세 정보 */}
          <div className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <DialogHeader className="flex-1">
                <DialogTitle className="text-left text-base font-semibold">{record.title}</DialogTitle>
              </DialogHeader>
              {isOwner && (
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={handleDelete} disabled={deleting}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{record.price.toLocaleString()}메소</Badge>
              {record.hunt_duration_minutes != null && (
                <Badge variant="secondary">{formatDuration(record.hunt_duration_minutes)}</Badge>
              )}
              {record.exp_gained != null && (
                <Badge variant="secondary">EXP {record.exp_gained.toLocaleString()}</Badge>
              )}
              {record.hunting_ground && (
                <Badge variant="outline">{record.hunting_ground}</Badge>
              )}
              <span className="text-muted-foreground text-xs self-center">
                {new Date(record.service_date).toLocaleString("ko-KR", {
                  year: "numeric", month: "numeric", day: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </div>

            {record.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{record.description}</p>
            )}

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((url, i) => (
                  <button key={i} onClick={() => setImgIndex(i)}
                    className={`relative w-14 h-14 shrink-0 rounded overflow-hidden border-2 transition-colors ${i === imgIndex ? "border-primary" : "border-transparent"}`}>
                    <Image src={url} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 댓글 섹션 */}
          <div className="border-t px-5 py-4 space-y-4">
            <p className="text-sm font-semibold">
              손님 후기{" "}
              <span className="text-muted-foreground font-normal">({comments.length})</span>
            </p>

            {/* 댓글 목록 */}
            {commentsLoading ? (
              <p className="text-xs text-muted-foreground">불러오는 중...</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-muted-foreground">아직 후기가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="rounded-lg bg-muted/50 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{c.author_name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(c.created_at).toLocaleDateString("ko-KR")}
                        </span>
                        {isOwner && (
                          <button onClick={() => handleDeleteComment(c.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                    {c.image_url && (
                      <div className="relative w-full max-h-48 rounded overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.image_url} alt="후기 사진" className="w-full object-contain max-h-48 rounded" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 댓글 작성 폼 - 손님만 */}
            {!isOwner && <form onSubmit={handleCommentSubmit} className="space-y-3 pt-2 border-t">
              <p className="text-xs font-medium text-muted-foreground">후기 남기기</p>
              <div className="space-y-1.5">
                <Label className="text-xs">닉네임</Label>
                <Input
                  placeholder="손님 닉네임"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  required
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">내용</Label>
                <Textarea
                  placeholder="파티 지원 서비스에 대한 후기를 남겨주세요"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={2}
                  className="text-sm resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">사진 첨부 (선택)</Label>
                {commentImagePreview ? (
                  <div className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={commentImagePreview} alt="미리보기"
                      className="h-20 rounded border object-cover" />
                    <button type="button"
                      onClick={() => { setCommentImage(null); setCommentImagePreview(null); }}
                      className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 w-fit cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Upload className="w-4 h-4" />
                    사진 선택
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden" onChange={handleCommentImageChange} />
                  </label>
                )}
              </div>
              <Button type="submit" size="sm" disabled={submitting} className="w-full">
                {submitting ? "등록 중..." : "후기 등록"}
              </Button>
            </form>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
