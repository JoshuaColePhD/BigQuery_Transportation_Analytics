"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  anomalyDays,
  boroughMetrics,
  DashboardTab,
  fareBuckets,
  filterDefinitions,
  FilterKey,
  formatCurrency,
  formatNumber,
  kpis,
  querySteps,
  weeklyTraffic,
} from "@/lib/dashboard-data";
import { DashboardHeader, DashboardShell, KpiCard, Panel, QueryTable } from "@/components/dashboard-kit";

const tabs: Array<{ id: DashboardTab; label: string }> = [
  { id: "summary", label: "Summary" },
  { id: "location-value", label: "Location + Value" },
  { id: "query-workflow", label: "Query Workflow" },
];

const chartColors = ["#5BC0EB", "#F4727A", "#F6C85F", "#9B7EDE", "#4E79A7", "#43A7F5"];
const defaultFilters: Record<FilterKey, string> = {
  borough: "all",
  fareBucket: "all",
  view: "portfolio",
};

export function DashboardView() {
  const [selectedTab, setSelectedTab] = useState<DashboardTab>("summary");
  const [filters, setFilters] = useState(defaultFilters);

  const selectedBoroughRows = useMemo(
    () => (filters.borough === "all" ? boroughMetrics : boroughMetrics.filter((row) => row.borough === filters.borough)),
    [filters.borough],
  );

  const selectedFareRows = useMemo(
    () => (filters.fareBucket === "all" ? fareBuckets : fareBuckets.filter((row) => row.bucket === filters.fareBucket)),
    [filters.fareBucket],
  );

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    return key === "view" ? value !== "portfolio" : value !== "all";
  }).length;

  const selectedNarrative =
    filters.view === "yield"
      ? "Yield lens: low-volume origins such as EWR matter because value per trip can be several times the Manhattan baseline."
      : filters.view === "volume"
        ? "Volume lens: Manhattan and sub-$25 fares dominate system load, so operating decisions should start with repeatable short trips."
        : "Portfolio lens: this dashboard separates demand concentration from per-trip value so the SQL findings do not collapse into one metric.";

  return (
    <main className="min-h-screen overflow-x-hidden px-3 py-4 md:px-7 md:py-6">
      <div className="mx-auto w-full max-w-7xl min-w-0">
        <DashboardShell label="Transportation analytics dashboard">
          <DashboardHeader
            title="NYC Taxi Analytics Dashboard"
            subtitle={selectedNarrative}
            tabs={tabs}
            selectedTab={selectedTab}
            filters={filters}
            filterDefinitions={filterDefinitions}
            activeFilterCount={activeFilterCount}
            onTabChange={setSelectedTab}
            onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
            onResetFilters={() => setFilters(defaultFilters)}
          />

          <div className="mb-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            {kpis.map((metric) => (
              <KpiCard key={metric.label} metric={metric} />
            ))}
          </div>

          {selectedTab === "summary" ? (
            <div className="grid min-w-0 gap-4 xl:grid-cols-3">
              <Panel title="Weekly Traffic Baseline" subtitle="Monthly index of weekly trip volume, showing seasonality without a structural break.">
                <div className="h-[280px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyTraffic} margin={{ top: 8, right: 14, bottom: 8, left: 4 }}>
                      <CartesianGrid stroke="#2b6687" />
                      <XAxis dataKey="week" />
                      <YAxis tickFormatter={(value) => `${Number(value) / 1_000_000}M`} />
                      <Tooltip formatter={(value: number) => `${(value / 1_000_000).toFixed(2)}M trips`} />
                      <Area type="monotone" dataKey="trips" stroke="#9B7EDE" fill="#9B7EDE" fillOpacity={0.55} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel title="Pickup Mix" subtitle="Share of trips by pickup borough in the public taxi zone lookup.">
                <div className="h-[280px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <text x="50%" y="45%" textAnchor="middle" fill="#F8FAFC" fontSize={28} fontWeight={700}>
                        90.6%
                      </text>
                      <text x="50%" y="54%" textAnchor="middle" fill="#B8C4D6" fontSize={13} fontWeight={600}>
                        Manhattan share
                      </text>
                      <Pie data={boroughMetrics.slice(0, 5)} dataKey="share" nameKey="borough" innerRadius="48%" outerRadius="78%" paddingAngle={2}>
                        {boroughMetrics.slice(0, 5).map((segment, index) => (
                          <Cell key={segment.borough} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value.toFixed(1)}% of trips`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel title="Fare Composition" subtitle="Trip volume is dominated by low-to-mid-priced rides.">
                <div className="h-[280px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedFareRows} margin={{ top: 10, right: 22, bottom: 8, left: 4 }}>
                      <CartesianGrid stroke="#2b6687" />
                      <XAxis dataKey="bucket" />
                      <YAxis domain={[0, 55]} tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value: number, name) => (name === "share" ? `${value}%` : formatNumber(value))} />
                      <Bar dataKey="share" name="Share" fill="#168ef2" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </div>
          ) : null}

          {selectedTab === "location-value" ? (
            <div className="grid min-w-0 gap-4 xl:grid-cols-2">
              <Panel title="Revenue per Trip by Borough" subtitle="Outer-borough and airport pickups have higher value despite smaller trip counts.">
                <div className="h-[320px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedBoroughRows} layout="vertical" margin={{ top: 10, right: 54, bottom: 10, left: 38 }}>
                      <CartesianGrid stroke="#274766" horizontal={false} />
                      <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                      <YAxis type="category" dataKey="borough" width={92} tick={{ fill: "#F8FAFC", fontSize: 12 }} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="avgRevenue" fill="#F4727A" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel title="Volume vs. Value" subtitle="Trip concentration and revenue-per-trip point in different directions.">
                <div className="h-[320px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={boroughMetrics} margin={{ top: 8, right: 10, bottom: 22, left: 0 }}>
                      <CartesianGrid stroke="#2b6687" />
                      <XAxis dataKey="borough" />
                      <YAxis yAxisId="left" tickFormatter={(value) => `${value}%`} />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `$${value}`} />
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={24} />
                      <Line yAxisId="left" type="monotone" dataKey="share" name="Trip share" stroke="#43a7f5" strokeWidth={2.4} />
                      <Line yAxisId="right" type="monotone" dataKey="avgRevenue" name="Avg revenue" stroke="#F6C85F" strokeWidth={2.4} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel title="Anomaly Watchlist" subtitle="Flagged days are episodic disruptions rather than evidence of a sustained trend.">
                <div className="grid gap-3">
                  {anomalyDays.map((day) => (
                    <article key={day.date} className="grid gap-3 rounded-[3px] border border-[#37577b] bg-[#132a46]/92 p-3 sm:grid-cols-[0.8fr_0.7fr_0.7fr_1.2fr]">
                      <p className="font-mono text-xs text-ocean">{day.date}</p>
                      <p className="text-sm font-semibold text-ink">{formatNumber(day.trips)} trips</p>
                      <p className="text-sm text-gold">{Math.round(day.pctOfAverage * 100)}% of avg</p>
                      <p className="text-sm text-sand/80">{day.note}</p>
                    </article>
                  ))}
                </div>
              </Panel>

              <Panel title="Executive Interpretation" subtitle="The strongest story is a volume market with a separate high-yield edge.">
                <div className="space-y-3 text-sm leading-6 text-sand/85">
                  <p>
                    Manhattan explains the operating baseline, but not the whole value story. Short rides make the system busy, while airport-adjacent pickups expose much higher average revenue per trip.
                  </p>
                  <p>
                    The ad-hoc SQL workflow keeps three questions apart: total demand, demand composition, and value per trip. Combining them too early would hide the portfolio tradeoff.
                  </p>
                </div>
              </Panel>
            </div>
          ) : null}

          {selectedTab === "query-workflow" ? (
            <div className="grid min-w-0 gap-4">
              <Panel title="SQL Workflow" subtitle="Numbered scripts move from validation to trends, segmentation, value analysis, and anomaly review.">
                <QueryTable rows={querySteps} />
              </Panel>

              <Panel title="Reproducibility Notes" subtitle="The repository stores query logic and documentation only; source data stays in BigQuery.">
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    ["Dataset", "bigquery-public-data.new_york_taxi_trips"],
                    ["Fact Table", "tlc_yellow_trips_2018"],
                    ["Dimension Table", "taxi_zone_geom"],
                  ].map(([label, value]) => (
                    <article key={label} className="rounded-[3px] border border-[#37577b] bg-[#132a46]/92 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">{label}</p>
                      <p className="mt-2 break-words font-mono text-xs text-ink">{value}</p>
                    </article>
                  ))}
                </div>
              </Panel>
            </div>
          ) : null}
        </DashboardShell>
      </div>
    </main>
  );
}
