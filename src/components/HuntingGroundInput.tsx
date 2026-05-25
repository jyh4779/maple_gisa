"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PRESETS = ["부활하는 기억", "깊은 바다 협곡2"];

export default function HuntingGroundInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [showCustom, setShowCustom] = useState(
    () => value !== "" && !PRESETS.includes(value)
  );

  const selectValue = showCustom ? "__custom__" : value;

  const handleSelect = (v: string | null) => {
    if (v === "__custom__") {
      setShowCustom(true);
      onChange("");
    } else {
      setShowCustom(false);
      onChange(v ?? "");
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Select value={selectValue} onValueChange={handleSelect}>
        <SelectTrigger className="w-full h-9">
          <SelectValue placeholder="사냥터 선택 (선택)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">없음</SelectItem>
          {PRESETS.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
          <SelectSeparator />
          <SelectItem value="__custom__">직접 입력...</SelectItem>
        </SelectContent>
      </Select>
      {showCustom && (
        <Input
          placeholder="사냥터 이름 입력"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
        />
      )}
    </div>
  );
}
