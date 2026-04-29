"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { ALL_METALS, ALL_STONES, ALL_COLLECTIONS } from "@/lib/mock-data";

export type SortKey =
  | "newest"
  | "bestseller"
  | "price-asc"
  | "price-desc";

export interface Filters {
  metals: string[];
  stones: string[];
  collections: string[];
  inStockOnly: boolean;
  priceMin: number;
  priceMax: number;
}

export const DEFAULT_FILTERS: Filters = {
  metals: [],
  stones: [],
  collections: [],
  inStockOnly: false,
  priceMin: 0,
  priceMax: 10000,
};

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest First" },
  { key: "bestseller", label: "Bestseller" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
];

interface Props {
  total: number;
  filters: Filters;
  setFilters: (f: Filters) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
}

export default function FilterSortBar({ total, filters, setFilters, sort, setSort }: Props) {
  const [open, setOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const activeCount =
    filters.metals.length +
    filters.stones.length +
    filters.collections.length +
    (filters.inStockOnly ? 1 : 0) +
    (filters.priceMax < 10000 || filters.priceMin > 0 ? 1 : 0);

  function toggleArr(arr: string[], val: string): string[] {
    return arr.includes(val) ? arr.filter((a) => a !== val) : [...arr, val];
  }

  return (
    <>
      <div
        className="mb-12 flex items-center justify-between border-b pb-5"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p
          className="text-sm uppercase tracking-[0.2em]"
          style={{ color: "var(--color-text-muted)" }}
        >
          {total} {total === 1 ? "Piece" : "Pieces"}
        </p>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] transition-opacity hover:opacity-60"
            style={{ color: "var(--color-text)" }}
          >
            <SlidersHorizontal className="h-5 w-5 stroke-[1.5]" />
            Filter {activeCount > 0 && <span>({activeCount})</span>}
          </button>

          <div className="relative">
            <button
              onClick={() => setSortOpen((p) => !p)}
              className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] transition-opacity hover:opacity-60"
              style={{ color: "var(--color-text)" }}
            >
              Sort: {SORT_OPTIONS.find((o) => o.key === sort)?.label}
              <ChevronDown className="h-4 w-4 stroke-[1.5]" />
            </button>
            {sortOpen && (
              <div
                className="absolute right-0 top-full mt-3 w-56 border z-30"
                style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-border)" }}
              >
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    onClick={() => {
                      setSort(o.key);
                      setSortOpen(false);
                    }}
                    className="block w-full px-5 py-3 text-left text-xs uppercase tracking-[0.15em] transition-colors hover:bg-gray-50"
                    style={{ color: sort === o.key ? "var(--color-text)" : "var(--color-text-muted)" }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter drawer */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="h-full w-full max-w-md overflow-y-auto p-8"
            style={{ backgroundColor: "var(--color-bg)" }}
          >
            <div className="mb-8 flex items-center justify-between">
              <h2
                className="text-lg uppercase tracking-[0.2em]"
                style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)" }}
              >
                Filters
              </h2>
              <button onClick={() => setOpen(false)}>
                <X className="h-6 w-6 stroke-[1.5]" style={{ color: "var(--color-text-muted)" }} />
              </button>
            </div>

            <FilterSection title="Fabric Type">
              {ALL_METALS.map((m) => (
                <Checkbox
                  key={m}
                  label={m}
                  checked={filters.metals.includes(m)}
                  onChange={() =>
                    setFilters({ ...filters, metals: toggleArr(filters.metals, m) })
                  }
                />
              ))}
            </FilterSection>

            <FilterSection title="Pattern / Weave">
              {ALL_STONES.map((s) => (
                <Checkbox
                  key={s}
                  label={s}
                  checked={filters.stones.includes(s)}
                  onChange={() =>
                    setFilters({ ...filters, stones: toggleArr(filters.stones, s) })
                  }
                />
              ))}
            </FilterSection>

            <FilterSection title="Collection">
              {ALL_COLLECTIONS.map((c) => (
                <Checkbox
                  key={c}
                  label={c.charAt(0).toUpperCase() + c.slice(1)}
                  checked={filters.collections.includes(c)}
                  onChange={() =>
                    setFilters({ ...filters, collections: toggleArr(filters.collections, c) })
                  }
                />
              ))}
            </FilterSection>

            <FilterSection title="Availability">
              <Checkbox
                label="In Stock Only"
                checked={filters.inStockOnly}
                onChange={() => setFilters({ ...filters, inStockOnly: !filters.inStockOnly })}
              />
            </FilterSection>

            <FilterSection title={`Price Range — ₹${filters.priceMin.toLocaleString("en-IN")} to ₹${filters.priceMax.toLocaleString("en-IN")}`}>
              <input
                type="range"
                min={0}
                max={10000}
                step={250}
                value={filters.priceMax}
                onChange={(e) => setFilters({ ...filters, priceMax: Number(e.target.value) })}
                className="w-full accent-black"
              />
              <div className="flex items-center justify-between text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>
                <span>₹0</span>
                <span>₹10,000</span>
              </div>
            </FilterSection>

            <div className="mt-10 flex gap-3">
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="flex-1 border py-3 text-xs uppercase tracking-[0.2em]"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
              >
                Clear All
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-3 text-xs uppercase tracking-[0.2em] text-white"
                style={{ backgroundColor: "var(--color-text)" }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3
        className="mb-4 text-xs uppercase tracking-[0.2em]"
        style={{ color: "var(--color-text)" }}
      >
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-black"
      />
      <span className="text-sm font-light" style={{ color: "var(--color-text)" }}>
        {label}
      </span>
    </label>
  );
}
