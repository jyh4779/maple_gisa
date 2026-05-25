"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, ImageOff } from "lucide-react";
import type { ServiceRecord } from "@/types";
import RecordDetailModal from "./RecordDetailModal";
import RecordEditModal from "./RecordEditModal";

type SortKey = "service_date" | "price" | "exp_gained" | "hunt_duration_minutes" | "hunting_ground";
type SortDir = "asc" | "desc";

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}시간${m > 0 ? ` ${m}분` : ""}` : `${m}분`;
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground/50" />;
  return dir === "asc"
    ? <ChevronUp className="w-3.5 h-3.5 text-foreground" />
    : <ChevronDown className="w-3.5 h-3.5 text-foreground" />;
}

export default function RecordTimeline({
  records: initialRecords,
  isOwner,
}: {
  records: ServiceRecord[];
  isOwner: boolean;
}) {
  const [records, setRecords] = useState(initialRecords);
  const [selected, setSelected] = useState<ServiceRecord | null>(null);
  const [editing, setEditing] = useState<ServiceRecord | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("service_date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...records]
      .filter((r) =>
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.hunting_ground?.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const av = (a[sortKey] ?? 0) as number | string;
        const bv = (b[sortKey] ?? 0) as number | string;
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [records, search, sortKey, sortDir]);

  const handleSaved = (updated: ServiceRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setSelected(updated);
    setEditing(null);
  };

  const handleDeleted = () => {
    if (!selected) return;
    setRecords((prev) => prev.filter((r) => r.id !== selected.id));
    setSelected(null);
  };

  const cols: { key: SortKey; label: string }[] = [
    { key: "service_date", label: "날짜" },
    { key: "hunting_ground", label: "사냥터" },
    { key: "price", label: "비용" },
    { key: "exp_gained", label: "EXP" },
    { key: "hunt_duration_minutes", label: "사냥시간" },
  ];

  return (
    <>
      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="제목 또는 사냥터 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {records.length === 0 ? (
        <p className="text-muted-foreground text-sm py-4">아직 등록된 이력이 없습니다.</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm py-4">검색 결과가 없습니다.</p>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground w-8">
                  사진
                </th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">
                  제목
                </th>
                {cols.map(({ key, label }) => (
                  <th key={key} className="px-3 py-2.5 font-medium text-muted-foreground whitespace-nowrap">
                    <button
                      onClick={() => handleSort(key)}
                      className="flex items-center gap-1 mx-auto hover:text-foreground transition-colors"
                    >
                      {label}
                      <SortIcon active={sortKey === key} dir={sortDir} />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((record, idx) => {
                const thumb = record.image_urls[0];
                return (
                  <tr
                    key={record.id}
                    onClick={() => setSelected(record)}
                    className={`cursor-pointer hover:bg-accent transition-colors ${idx !== filtered.length - 1 ? "border-b" : ""}`}
                  >
                    {/* 썸네일 */}
                    <td className="px-3 py-2.5">
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                        {thumb
                          ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                          : <ImageOff className="w-4 h-4 text-muted-foreground" />
                        }
                      </div>
                    </td>
                    {/* 제목 */}
                    <td className="px-3 py-2.5 min-w-[140px]">
                      <p className="font-medium leading-snug">{record.title}</p>
                    </td>
                    {/* 날짜 */}
                    <td className="px-3 py-2.5 text-center text-muted-foreground whitespace-nowrap">
                      {new Date(record.service_date).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}
                    </td>
                    {/* 사냥터 */}
                    <td className="px-3 py-2.5 text-center text-muted-foreground whitespace-nowrap">
                      {record.hunting_ground ?? "-"}
                    </td>
                    {/* 비용 */}
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      {record.price.toLocaleString()}
                      <span className="text-xs text-muted-foreground ml-0.5">메소</span>
                    </td>
                    {/* EXP */}
                    <td className="px-3 py-2.5 text-center text-muted-foreground whitespace-nowrap">
                      {record.exp_gained != null ? record.exp_gained.toLocaleString() : "-"}
                    </td>
                    {/* 사냥시간 */}
                    <td className="px-3 py-2.5 text-center text-muted-foreground whitespace-nowrap">
                      {record.hunt_duration_minutes != null
                        ? formatDuration(record.hunt_duration_minutes)
                        : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && !editing && (
        <RecordDetailModal
          record={selected}
          isOwner={isOwner}
          open={!!selected}
          onClose={() => setSelected(null)}
          onEdit={() => setEditing(selected)}
          onDeleted={handleDeleted}
        />
      )}

      {editing && (
        <RecordEditModal
          record={editing}
          open={!!editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
