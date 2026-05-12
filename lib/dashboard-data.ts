export type DashboardTab = "summary" | "location-value" | "query-workflow";
export type FilterKey = "borough" | "fareBucket" | "view";

export type KpiMetric = {
  label: string;
  value: string;
  hint: string;
  accent: "pine" | "ember" | "gold" | "ocean" | "plum";
};

export type BoroughMetric = {
  borough: string;
  trips: number;
  share: number;
  avgRevenue: number;
  totalRevenue: number;
};

export type FareBucketMetric = {
  bucket: string;
  trips: number;
  share: number;
  order: number;
};

export type WeeklyTrafficPoint = {
  week: string;
  trips: number;
};

export type AnomalyDay = {
  date: string;
  trips: number;
  pctOfAverage: number;
  note: string;
};

export type QueryStep = {
  file: string;
  question: string;
  metric: string;
  output: string;
};

export const filterDefinitions: Array<{
  key: FilterKey;
  label: string;
  options: Array<{ value: string; label: string }>;
}> = [
  {
    key: "borough",
    label: "Pickup borough",
    options: [
      { value: "all", label: "All boroughs" },
      { value: "Manhattan", label: "Manhattan" },
      { value: "Queens", label: "Queens" },
      { value: "Brooklyn", label: "Brooklyn" },
      { value: "EWR", label: "EWR" },
    ],
  },
  {
    key: "fareBucket",
    label: "Fare bucket",
    options: [
      { value: "all", label: "All fares" },
      { value: "Under $10", label: "Under $10" },
      { value: "$10-$25", label: "$10-$25" },
      { value: "$25-$50", label: "$25-$50" },
      { value: "$50+", label: "$50+" },
    ],
  },
  {
    key: "view",
    label: "Planning lens",
    options: [
      { value: "portfolio", label: "Portfolio" },
      { value: "volume", label: "Volume" },
      { value: "yield", label: "Yield" },
    ],
  },
];

export const kpis: KpiMetric[] = [
  { label: "Trip Rows", value: "102.9M", hint: "2018 yellow taxi trips", accent: "ocean" },
  { label: "Manhattan Share", value: "90.6%", hint: "Pickup concentration", accent: "gold" },
  { label: "Sub-$25 Trips", value: "86.3%", hint: "Short ride dominance", accent: "pine" },
  { label: "Manhattan Avg", value: "$14.32", hint: "Revenue per trip", accent: "plum" },
  { label: "EWR Avg", value: "$91.86", hint: "Highest value origin", accent: "ember" },
  { label: "Trend Signal", value: "Stable", hint: "Weekly seasonality", accent: "ocean" },
];

export const boroughMetrics: BoroughMetric[] = [
  { borough: "Manhattan", trips: 93_198_000, share: 90.6, avgRevenue: 14.32, totalRevenue: 1_334_595_360 },
  { borough: "Queens", trips: 6_583_000, share: 6.4, avgRevenue: 32.84, totalRevenue: 216_179_720 },
  { borough: "Brooklyn", trips: 1_337_000, share: 1.3, avgRevenue: 22.77, totalRevenue: 30_446_490 },
  { borough: "EWR", trips: 103_000, share: 0.1, avgRevenue: 91.86, totalRevenue: 9_461_580 },
  { borough: "Bronx", trips: 82_000, share: 0.08, avgRevenue: 25.68, totalRevenue: 2_105_760 },
  { borough: "Staten Island", trips: 21_000, share: 0.02, avgRevenue: 38.42, totalRevenue: 806_820 },
];

export const fareBuckets: FareBucketMetric[] = [
  { bucket: "Under $10", trips: 38_780_000, share: 37.7, order: 1 },
  { bucket: "$10-$25", trips: 49_997_000, share: 48.6, order: 2 },
  { bucket: "$25-$50", trips: 9_459_000, share: 9.2, order: 3 },
  { bucket: "$50+", trips: 4_629_000, share: 4.5, order: 4 },
];

export const weeklyTraffic: WeeklyTrafficPoint[] = [
  { week: "Jan", trips: 2_080_000 },
  { week: "Feb", trips: 1_950_000 },
  { week: "Mar", trips: 2_020_000 },
  { week: "Apr", trips: 1_990_000 },
  { week: "May", trips: 2_040_000 },
  { week: "Jun", trips: 1_980_000 },
  { week: "Jul", trips: 1_910_000 },
  { week: "Aug", trips: 1_900_000 },
  { week: "Sep", trips: 1_970_000 },
  { week: "Oct", trips: 2_060_000 },
  { week: "Nov", trips: 1_930_000 },
  { week: "Dec", trips: 1_880_000 },
];

export const anomalyDays: AnomalyDay[] = [
  { date: "2018-01-04", trips: 164_000, pctOfAverage: 0.58, note: "Winter storm disruption" },
  { date: "2018-11-22", trips: 151_000, pctOfAverage: 0.54, note: "Thanksgiving demand dip" },
  { date: "2018-12-25", trips: 139_000, pctOfAverage: 0.49, note: "Christmas holiday" },
  { date: "2018-12-31", trips: 114_000, pctOfAverage: 0.41, note: "Coverage boundary effect" },
];

export const querySteps: QueryStep[] = [
  { file: "00_sanity_checks.sql", question: "Can the dataset support analysis?", metric: "Coverage, nulls, spot checks", output: "102,871,376 raw trip rows with expected 2018 coverage" },
  { file: "01_daily_traffic_over_time.sql", question: "How does traffic move day to day?", metric: "Daily trip volume", output: "Stable baseline with short-term holiday and weather dips" },
  { file: "02a_trips_by_pickup_borough.sql", question: "Where does demand originate?", metric: "Trips and share by pickup borough", output: "Manhattan accounts for 90.6% of all pickups" },
  { file: "02b_fare_buckets.sql", question: "What fare patterns drive volume?", metric: "Trips and share by fare bucket", output: "86.3% of trips are under $25" },
  { file: "03a_revenue_per_trip_by_borough.sql", question: "Where is per-trip value highest?", metric: "Average total amount by borough", output: "EWR leads at $91.86 per trip despite tiny volume" },
  { file: "04_anomalous_days.sql", question: "Are deviations sustained or episodic?", metric: "Days outside 60%-140% of average", output: "No sustained structural break in the 2018 series" },
];

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}
