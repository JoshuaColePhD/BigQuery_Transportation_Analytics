"use client";

import { useMemo, useState } from "react";
import { formatCurrency, formatNumber } from "@/lib/dashboard-data";
import { taxiZoneFeatures, TaxiZoneFeature } from "@/lib/taxi-zone-map";

type MapMetric = "tripShare" | "avgRevenue";

const svgWidth = 760;
const svgHeight = 620;
const boundsPadding = 28;

function getBounds(features: TaxiZoneFeature[]) {
  const points = features.flatMap((feature) => feature.geometry.coordinates.flat());
  const longitudes = points.map(([longitude]) => longitude);
  const latitudes = points.map(([, latitude]) => latitude);

  return {
    minLongitude: Math.min(...longitudes),
    maxLongitude: Math.max(...longitudes),
    minLatitude: Math.min(...latitudes),
    maxLatitude: Math.max(...latitudes),
  };
}

const mapBounds = getBounds(taxiZoneFeatures);

function projectPoint([longitude, latitude]: number[]) {
  const x =
    boundsPadding +
    ((longitude - mapBounds.minLongitude) / (mapBounds.maxLongitude - mapBounds.minLongitude)) *
      (svgWidth - boundsPadding * 2);
  const y =
    boundsPadding +
    ((mapBounds.maxLatitude - latitude) / (mapBounds.maxLatitude - mapBounds.minLatitude)) *
      (svgHeight - boundsPadding * 2);

  return [x, y];
}

function polygonPath(feature: TaxiZoneFeature) {
  return feature.geometry.coordinates
    .map((ring) =>
      ring
        .map((point, index) => {
          const [x, y] = projectPoint(point);
          return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(" ")
        .concat(" Z"),
    )
    .join(" ");
}

function getFill(feature: TaxiZoneFeature, metric: MapMetric) {
  if (metric === "avgRevenue") {
    if (feature.avgRevenuePerTrip >= 70) return "#F4727A";
    if (feature.avgRevenuePerTrip >= 45) return "#F6C85F";
    if (feature.avgRevenuePerTrip >= 30) return "#9B7EDE";
    if (feature.avgRevenuePerTrip >= 20) return "#4E79A7";
    return "#173C4A";
  }

  if (feature.pctOfTotalTrips >= 12) return "#5BC0EB";
  if (feature.pctOfTotalTrips >= 6) return "#43a7f5";
  if (feature.pctOfTotalTrips >= 2) return "#4E79A7";
  if (feature.pctOfTotalTrips >= 0.5) return "#173C4A";
  return "#10263e";
}

function metricValue(feature: TaxiZoneFeature, metric: MapMetric) {
  return metric === "avgRevenue" ? formatCurrency(feature.avgRevenuePerTrip) : `${feature.pctOfTotalTrips.toFixed(2)}%`;
}

export function TaxiZoneMap({ selectedBorough }: { selectedBorough: string }) {
  const [metric, setMetric] = useState<MapMetric>("tripShare");
  const [hoveredZoneId, setHoveredZoneId] = useState(taxiZoneFeatures[0]?.id ?? "");
  const fallbackZone = taxiZoneFeatures[0] as TaxiZoneFeature;
  const hoveredZone = taxiZoneFeatures.find((feature) => feature.id === hoveredZoneId) ?? fallbackZone;
  const rankedZones = useMemo(
    () =>
      [...taxiZoneFeatures]
        .filter((feature) => selectedBorough === "all" || feature.borough === selectedBorough)
        .sort((a, b) =>
          metric === "avgRevenue"
            ? b.avgRevenuePerTrip - a.avgRevenuePerTrip
            : b.pctOfTotalTrips - a.pctOfTotalTrips,
        )
        .slice(0, 7),
    [metric, selectedBorough],
  );
  const activeMetricLabel = metric === "avgRevenue" ? "Avg revenue" : "Trip share";

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
      <section className="rounded-[8px] border border-[#37577b] bg-[#0b1f35] p-4 md:p-5">
        <div className="mb-4 flex flex-col gap-3 border-b border-[#26415f] pb-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Taxi-Zone Pickup Map</h2>
            <p className="mt-1 max-w-2xl text-sm text-sand/80">
              Derived aggregate pickup metrics by taxi zone. Toggle between volume concentration and per-trip value.
            </p>
          </div>
          <div className="flex shrink-0 rounded-[3px] border border-[#4d8abb] bg-[#10385f] p-1">
            {[
              ["tripShare", "Trip share"],
              ["avgRevenue", "Avg revenue"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={metric === id}
                onClick={() => setMetric(id as MapMetric)}
                className={`rounded-[2px] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
                  metric === id ? "bg-[#1477c8] text-white" : "text-sand hover:bg-[#132a46]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_210px]">
          <div className="min-w-0 overflow-hidden rounded-[6px] border border-[#26415f] bg-[radial-gradient(circle_at_45%_40%,rgba(91,192,235,0.10),transparent_22rem),#071321]">
            <svg
              aria-label={`Taxi-zone choropleth by ${activeMetricLabel}`}
              role="img"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="block h-auto w-full"
            >
              <rect width={svgWidth} height={svgHeight} fill="#071321" />
              <g opacity="0.22">
                <path d="M96 44 C128 104 130 170 108 246 C91 305 100 363 131 419" stroke="#5BC0EB" strokeWidth="3" fill="none" />
                <path d="M342 30 C330 110 338 190 360 275 C378 345 362 433 324 582" stroke="#5BC0EB" strokeWidth="2" fill="none" />
              </g>
              <g>
                {taxiZoneFeatures.map((feature) => {
                  const isDimmed = selectedBorough !== "all" && feature.borough !== selectedBorough;
                  const isHovered = feature.id === hoveredZone?.id;

                  return (
                    <path
                      key={feature.id}
                      d={polygonPath(feature)}
                      fill={getFill(feature, metric)}
                      stroke={isHovered ? "#F6C85F" : "#79b7d8"}
                      strokeWidth={isHovered ? 3.2 : 1.35}
                      opacity={isDimmed ? 0.18 : 0.92}
                      className="cursor-pointer transition duration-150 hover:opacity-100"
                      onFocus={() => setHoveredZoneId(feature.id)}
                      onMouseEnter={() => setHoveredZoneId(feature.id)}
                      tabIndex={0}
                    >
                      <title>{`${feature.zoneName}: ${metricValue(feature, metric)}`}</title>
                    </path>
                  );
                })}
              </g>
            </svg>
          </div>

          <aside className="rounded-[6px] border border-[#37577b] bg-[#132a46]/92 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">Hovered zone</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{hoveredZone.zoneName}</h3>
            <p className="mt-1 text-sm text-sand/75">{hoveredZone.borough}</p>
            <dl className="mt-4 grid gap-3 text-sm">
              <div>
                <dt className="text-sand/60">Trips</dt>
                <dd className="font-semibold text-ink">{formatNumber(hoveredZone.trips)}</dd>
              </div>
              <div>
                <dt className="text-sand/60">Trip share</dt>
                <dd className="font-semibold text-ocean">{hoveredZone.pctOfTotalTrips.toFixed(2)}%</dd>
              </div>
              <div>
                <dt className="text-sand/60">Avg revenue</dt>
                <dd className="font-semibold text-gold">{formatCurrency(hoveredZone.avgRevenuePerTrip)}</dd>
              </div>
              <div>
                <dt className="text-sand/60">Total revenue</dt>
                <dd className="font-semibold text-ink">{formatCurrency(hoveredZone.totalRevenue)}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <div className="grid gap-4">
        <section className="rounded-[8px] border border-[#37577b] bg-[#0b1f35] p-4 md:p-5">
          <div className="mb-4 border-b border-[#26415f] pb-3">
            <h2 className="text-lg font-semibold text-ink">Top Zones by {activeMetricLabel}</h2>
            <p className="mt-1 text-sm text-sand/80">Ranked within the active pickup borough filter.</p>
          </div>
          <div className="space-y-2">
            {rankedZones.map((feature, index) => (
              <button
                key={feature.id}
                type="button"
                onClick={() => setHoveredZoneId(feature.id)}
                className="grid w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-[3px] border border-[#26415f] bg-[#132a46]/92 px-3 py-2 text-left transition hover:border-[#7bbdff]"
              >
                <span className="text-xs font-semibold text-gold">{index + 1}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">{feature.zoneName}</span>
                  <span className="block text-xs text-sand/60">{feature.borough}</span>
                </span>
                <span className="text-sm font-semibold text-ocean">{metricValue(feature, metric)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[8px] border border-[#37577b] bg-[#0b1f35] p-4 md:p-5">
          <div className="mb-4 border-b border-[#26415f] pb-3">
            <h2 className="text-lg font-semibold text-ink">Map Readout</h2>
            <p className="mt-1 text-sm text-sand/80">Volume and value tell different spatial stories.</p>
          </div>
          <p className="text-sm leading-6 text-sand/85">
            Trip share concentrates in the Manhattan core, especially Midtown and Times Square. Average revenue shifts attention
            toward airport zones such as EWR and JFK, where low volume can still carry higher per-trip value.
          </p>
        </section>
      </div>
    </div>
  );
}
