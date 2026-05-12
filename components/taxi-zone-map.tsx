"use client";

import { useMemo, useState } from "react";
import { formatCurrency, formatNumber } from "@/lib/dashboard-data";
import { taxiZoneFeatures, TaxiZoneFeature } from "@/lib/taxi-zone-map";

type MapMetric = "tripShare" | "avgRevenue";

const svgWidth = 760;
const svgHeight = 620;
const boundsPadding = 28;

type BasemapArea = {
  id: string;
  label: string;
  fill: string;
  labelPoint: [number, number];
  coordinates: number[][];
};

type AirportMarker = {
  id: string;
  label: string;
  point: [number, number];
};

const basemapAreas: BasemapArea[] = [
  {
    id: "manhattan",
    label: "Manhattan",
    fill: "#24445f",
    labelPoint: [-73.977, 40.782],
    coordinates: [
      [-74.020, 40.700],
      [-74.012, 40.725],
      [-74.002, 40.755],
      [-73.988, 40.790],
      [-73.952, 40.868],
      [-73.922, 40.872],
      [-73.934, 40.835],
      [-73.948, 40.795],
      [-73.962, 40.754],
      [-73.986, 40.704],
      [-74.020, 40.700],
    ],
  },
  {
    id: "bronx",
    label: "Bronx",
    fill: "#453a56",
    labelPoint: [-73.885, 40.845],
    coordinates: [
      [-73.936, 40.800],
      [-73.900, 40.792],
      [-73.850, 40.805],
      [-73.790, 40.845],
      [-73.800, 40.898],
      [-73.885, 40.912],
      [-73.950, 40.880],
      [-73.936, 40.800],
    ],
  },
  {
    id: "queens",
    label: "Queens",
    fill: "#3b3749",
    labelPoint: [-73.835, 40.725],
    coordinates: [
      [-73.950, 40.740],
      [-73.900, 40.782],
      [-73.810, 40.782],
      [-73.735, 40.735],
      [-73.730, 40.642],
      [-73.790, 40.605],
      [-73.895, 40.645],
      [-73.950, 40.700],
      [-73.950, 40.740],
    ],
  },
  {
    id: "brooklyn",
    label: "Brooklyn",
    fill: "#254d52",
    labelPoint: [-73.945, 40.654],
    coordinates: [
      [-74.035, 40.700],
      [-73.975, 40.724],
      [-73.885, 40.690],
      [-73.850, 40.622],
      [-73.930, 40.570],
      [-74.060, 40.602],
      [-74.035, 40.700],
    ],
  },
  {
    id: "staten-island",
    label: "Staten Island",
    fill: "#274f63",
    labelPoint: [-74.120, 40.590],
    coordinates: [
      [-74.245, 40.630],
      [-74.165, 40.662],
      [-74.055, 40.640],
      [-74.055, 40.565],
      [-74.135, 40.505],
      [-74.245, 40.535],
      [-74.245, 40.630],
    ],
  },
  {
    id: "new-jersey",
    label: "New Jersey",
    fill: "#1d3147",
    labelPoint: [-74.205, 40.745],
    coordinates: [
      [-74.300, 40.520],
      [-74.290, 40.900],
      [-74.120, 40.910],
      [-74.100, 40.820],
      [-74.135, 40.720],
      [-74.095, 40.630],
      [-74.160, 40.545],
      [-74.300, 40.520],
    ],
  },
];

const airportMarkers: AirportMarker[] = [
  { id: "ewr", label: "EWR", point: [-74.175, 40.690] },
  { id: "lga", label: "LGA", point: [-73.871, 40.777] },
  { id: "jfk", label: "JFK", point: [-73.784, 40.645] },
];

function getBounds(features: TaxiZoneFeature[], areas: BasemapArea[]) {
  const zonePoints = features.flatMap((feature) => feature.geometry.coordinates.flat());
  const areaPoints = areas.flatMap((area) => area.coordinates);
  const points = [...zonePoints, ...areaPoints, ...airportMarkers.map((marker) => marker.point)];
  const longitudes = points.map(([longitude]) => longitude);
  const latitudes = points.map(([, latitude]) => latitude);

  return {
    minLongitude: Math.min(...longitudes),
    maxLongitude: Math.max(...longitudes),
    minLatitude: Math.min(...latitudes),
    maxLatitude: Math.max(...latitudes),
  };
}

const mapBounds = getBounds(taxiZoneFeatures, basemapAreas);

function projectPoint([longitude, latitude]: number[] | [number, number]) {
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

function pathFromRing(ring: Array<number[] | [number, number]>) {
  return ring
    .map((point, index) => {
      const [x, y] = projectPoint(point);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ")
    .concat(" Z");
}

function basemapPath(area: BasemapArea) {
  return pathFromRing(area.coordinates);
}

function polygonPath(feature: TaxiZoneFeature) {
  return feature.geometry.coordinates
    .map((ring) => pathFromRing(ring))
    .join(" ");
}

function AirportIcon({ marker }: { marker: AirportMarker }) {
  const [x, y] = projectPoint(marker.point);

  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
      <circle r="10" fill="#F6C85F" stroke="#071321" strokeWidth="2" />
      <circle r="5.5" fill="#F4727A" opacity="0.9" />
      <path d="M0 -11 L2 -2 L9 1 L9 4 L1 3 L-2 9 L-5 9 L-3 2 L-10 0 L-10 -3 L-2 -3 Z" fill="#F8FAFC" stroke="#071321" strokeWidth="0.8" />
      <text x="14" y="-8" fill="#F6C85F" fontSize="14" fontWeight="800" letterSpacing="0.5">
        {marker.label}
      </text>
    </g>
  );
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
              <g opacity="0.85">
                {basemapAreas.map((area) => (
                  <path
                    key={area.id}
                    d={basemapPath(area)}
                    fill={area.fill}
                    stroke="#68a9ca"
                    strokeDasharray={area.id === "new-jersey" ? "8 6" : undefined}
                    strokeWidth={area.id === "new-jersey" ? 1.2 : 1.7}
                    opacity={area.id === "new-jersey" ? 0.62 : 0.88}
                  />
                ))}
              </g>
              <g opacity="0.42">
                <path d="M219 40 C260 116 260 210 236 292 C214 366 216 451 256 552" stroke="#5BC0EB" strokeWidth="5" fill="none" />
                <path d="M330 44 C313 135 323 226 350 312 C375 392 360 494 316 592" stroke="#5BC0EB" strokeWidth="3.2" fill="none" />
                <path d="M70 390 C154 351 263 354 358 396 C438 431 515 431 650 385" stroke="#5BC0EB" strokeWidth="2.5" fill="none" />
              </g>
              <g>
                {basemapAreas
                  .filter((area) => area.id !== "new-jersey")
                  .map((area) => {
                    const [x, y] = projectPoint(area.labelPoint);
                    const isManhattan = area.id === "manhattan";

                    return (
                      <text
                        key={`${area.id}-label`}
                        x={x}
                        y={y}
                        fill="#F8FAFC"
                        fontSize={isManhattan ? 20 : 18}
                        fontWeight="800"
                        letterSpacing="0.5"
                        opacity="0.82"
                        textAnchor="middle"
                        transform={isManhattan ? `rotate(-68 ${x} ${y})` : undefined}
                      >
                        {area.label.toUpperCase()}
                      </text>
                    );
                  })}
                {(() => {
                  const [x, y] = projectPoint([-74.205, 40.740]);
                  return (
                    <text x={x} y={y} fill="#F4727A" fontSize="20" fontWeight="800" opacity="0.72" textAnchor="middle">
                      NEW JERSEY
                    </text>
                  );
                })()}
                {[
                  ["Hudson River", [-74.060, 40.790], -66],
                  ["East River", [-73.925, 40.756], -28],
                  ["Upper Bay", [-74.045, 40.675], 0],
                  ["Jamaica Bay", [-73.835, 40.615], -10],
                ].map(([label, point, rotation]) => {
                  const [x, y] = projectPoint(point as [number, number]);
                  return (
                    <text
                      key={label as string}
                      x={x}
                      y={y}
                      fill="#5BC0EB"
                      fontSize="13"
                      fontStyle="italic"
                      fontWeight="700"
                      opacity="0.76"
                      textAnchor="middle"
                      transform={`rotate(${rotation} ${x} ${y})`}
                    >
                      {label}
                    </text>
                  );
                })}
              </g>
              <g>
                {airportMarkers.map((marker) => (
                  <AirportIcon key={marker.id} marker={marker} />
                ))}
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
