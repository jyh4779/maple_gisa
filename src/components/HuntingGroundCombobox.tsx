"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HUNTING_GROUND_AREAS, HUNTING_GROUNDS } from "@/lib/hunting-grounds";
import { ChevronDown, Plus, X } from "lucide-react";

export default function HuntingGroundCombobox({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState("");

  const toggle = (name: string) => {
    onChange(
      value.includes(name) ? value.filter((x) => x !== name) : [...value, name]
    );
  };

  const addCustom = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInputValue("");
  };

  const filteredAreas = HUNTING_GROUND_AREAS.filter((area) =>
    HUNTING_GROUNDS.some(
      (g) =>
        g.area === area &&
        g.name.toLowerCase().includes(inputValue.toLowerCase())
    )
  );

  const exactMatch = HUNTING_GROUNDS.some(
    (g) => g.name.toLowerCase() === inputValue.trim().toLowerCase()
  );
  const showAddOption =
    inputValue.trim().length > 0 &&
    !exactMatch &&
    !value.includes(inputValue.trim());

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((name) => (
            <Badge
              key={name}
              variant="secondary"
              className="gap-1 pr-1 text-xs font-normal"
            >
              {name}
              <button
                type="button"
                onClick={() => onChange(value.filter((x) => x !== name))}
                className="ml-0.5 rounded-full hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <Popover>
        <PopoverTrigger className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className={value.length === 0 ? "text-muted-foreground" : ""}>
            {value.length > 0 ? `${value.length}개 선택됨` : "사냥터 검색 또는 직접 입력..."}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="사냥터 이름 검색 또는 직접 입력..."
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={(e) => {
                if (e.key === "Enter" && showAddOption) {
                  e.preventDefault();
                  addCustom();
                }
              }}
            />
            <CommandList>
              {showAddOption && (
                <CommandGroup>
                  <CommandItem
                    value={`__add__${inputValue}`}
                    onSelect={addCustom}
                    className="text-primary"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span>
                      &ldquo;{inputValue.trim()}&rdquo; 직접 추가
                    </span>
                  </CommandItem>
                </CommandGroup>
              )}
              {filteredAreas.length === 0 && !showAddOption && (
                <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
              )}
              {filteredAreas.map((area) => (
                <CommandGroup key={area} heading={area}>
                  {HUNTING_GROUNDS.filter(
                    (g) =>
                      g.area === area &&
                      g.name.toLowerCase().includes(inputValue.toLowerCase())
                  ).map((g) => (
                    <CommandItem
                      key={g.name}
                      value={g.name}
                      onSelect={() => toggle(g.name)}
                      data-checked={value.includes(g.name)}
                    >
                      <span className="flex-1">{g.name}</span>
                      <span className="text-xs text-muted-foreground">
                        Lv.{g.minLevel}~{g.maxLevel}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
