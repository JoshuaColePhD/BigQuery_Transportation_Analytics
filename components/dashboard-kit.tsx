"use client";

import type { ReactNode } from "react";
import type { FilterKey, KpiMetric, QueryStep } from "@/lib/dashboard-data";

type TabOption<TTab extends string> = {
  id: TTab;
  label: string;
};

type FilterDefinition = {
  key: FilterKey;
  label: string;
  options: Array<{ value: string; label: string }>;
};

export function DashboardShell({ children, label }: { children: ReactNode; label: string }) {
  return (
    <section
      aria-label={label}
      className="overflow-hidden rounded-[3px] border border-[#42658d] bg-[radial-gradient(circle_at_25%_45%,rgba(23,146,161,0.35),transparent_28rem),linear-gradient(135deg,#05345a_0%,#07556a_48%,#08203b_100%)] p-4 shadow-soft"
    >
      {children}
    </section>
  );
}

export function DashboardHeader<TTab extends string>({
  title,
  subtitle,
  tabs,
  selectedTab,
  filters,
  filterDefinitions,
  activeFilterCount,
  onTabChange,
  onFilterChange,
  onResetFilters,
}: {
  title: string;
  subtitle: string;
  tabs: Array<TabOption<TTab>>;
  selectedTab: TTab;
  filters: Record<FilterKey, string>;
  filterDefinitions: FilterDefinition[];
  activeFilterCount: number;
  onTabChange: (tab: TTab) => void;
  onFilterChange: (key: FilterKey, value: string) => void;
  onResetFilters: () => void;
}) {
  return (
    <div className="mb-4">
      <div>
        <h1 className="text-2xl font-semibold uppercase tracking-[0.02em] text-[#48a8ff] md:text-3xl">{title}</h1>
        <p className="mt-1 max-w-3xl text-sm text-sand/85">{subtitle}</p>
      </div>

      <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-end">
        <div className="flex shrink-0 flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-label={tab.label}
              aria-pressed={selectedTab === tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`min-h-9 rounded-[2px] border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
                selectedTab === tab.id
                  ? "border-[#4aa8ff] bg-[#1477c8] text-white"
                  : "border-[#4d8abb] bg-[#10385f] text-sand hover:border-[#7bbdff]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-end gap-2 xl:justify-end">
          {filterDefinitions.map((definition) => (
            <label key={definition.key} className="min-w-[126px] flex-1 sm:max-w-[170px] xl:flex-none">
              <span className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.14em] text-gold">
                {definition.label}
              </span>
              <select
                aria-label={definition.label}
                className="h-9 w-full rounded-[2px] border border-[#4d8abb] bg-[#10385f] px-2 text-xs font-semibold text-sand outline-none transition focus:border-[#7bbdff]"
                value={filters[definition.key]}
                onChange={(event) => onFilterChange(definition.key, event.target.value)}
              >
                {definition.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <button
            type="button"
            onClick={onResetFilters}
            className="h-9 rounded-[2px] border border-gold/60 bg-gold px-3 text-xs font-semibold text-[#071321] transition hover:bg-[#ffd977]"
          >
            Reset{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

export function KpiCard({ metric }: { metric: KpiMetric }) {
  const accentMap = {
    pine: "border-t-ocean bg-[#0b1f35]",
    ember: "border-t-ember bg-[#0b1f35]",
    gold: "border-t-gold bg-[#0b1f35]",
    ocean: "border-t-ocean bg-[#0b1f35]",
    plum: "border-t-plum bg-[#0b1f35]",
  } as const;

  return (
    <article className={`min-w-0 rounded-[3px] border border-[#37577b] border-t-4 px-4 py-3 md:py-4 ${accentMap[metric.accent]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold md:text-[11px]">{metric.label}</p>
      <p className="mt-2 break-words text-2xl font-semibold tracking-tight text-white md:text-[1.65rem]">{metric.value}</p>
      <p className="mt-1 break-words text-xs text-sand/75 md:text-sm">{metric.hint}</p>
    </article>
  );
}

export function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col rounded-[8px] border border-[#37577b] bg-[#0b1f35] p-4 shadow-[0_8px_18px_rgba(17,24,39,0.04)] md:p-5">
      <div className="mb-4 min-w-0 border-b border-[#26415f] pb-3">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <p className="mt-1 break-words text-sm text-sand/80">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

export function QueryTable({ rows }: { rows: QueryStep[] }) {
  return (
    <div className="overflow-x-auto rounded-[8px] border border-[#37577b]">
      <table className="min-w-full table-fixed border-collapse text-sm">
        <thead className="bg-mist text-left text-[10px] uppercase tracking-[0.12em] text-sand/60">
          <tr>
            <th className="w-[24%] px-3 py-3">Script</th>
            <th className="w-[25%] px-3 py-3">Question</th>
            <th className="w-[20%] px-3 py-3">Metric</th>
            <th className="w-[31%] px-3 py-3">Finding</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.file} className="border-t border-[#26415f]">
              <td className="break-words px-3 py-3 font-mono text-xs text-ocean">{row.file}</td>
              <td className="break-words px-3 py-3 text-ink">{row.question}</td>
              <td className="break-words px-3 py-3 text-sand/70">{row.metric}</td>
              <td className="break-words px-3 py-3 text-ink">{row.output}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
