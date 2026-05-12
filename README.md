# BigQuery Transportation Analytics

Taxi trip volume is easy to summarize and easy to misunderstand.

A city can have more than 100 million rides in a year and still leave leaders with a blurry operating question: is demand changing, where is the system carrying the most load, and which segments produce the most value per trip?

This project answers those questions with a compact SQL workflow on the Google BigQuery public NYC yellow taxi dataset, then translates the results into an executive dashboard styled after the HR Attrition survival dashboard.

**Live dashboard:** https://bigquery-transportation-push.vercel.app  
**Dataset:** `bigquery-public-data.new_york_taxi_trips`

## The Story

Imagine an operations leader looking at a full year of NYC taxi trips. The headline number is large: **102,871,376 trips** in 2018. But that number does not say whether traffic is structurally rising or falling, whether demand is geographically broad, or whether high-volume areas also produce high per-trip revenue.

That is the blind spot this project is built around.

The SQL workflow treats the taxi table like an event-level fact table. It starts with data validation, moves into time-series traffic patterns, joins trips to pickup geography, segments fares into business-readable buckets, compares revenue per trip by borough, and flags anomalous days for review.

The result is a clearer transportation analytics question:

**Which segments drive system load, and which segments drive value?**

## What the Analysis Found

The clearest signal is geographic concentration.

Manhattan accounts for approximately **90.6% of all pickups**, meaning total system volume is overwhelmingly shaped by Manhattan activity. But volume and value do not move together. Manhattan has the lowest average revenue per trip at about **$14.32**, while EWR-origin trips average about **$91.86** despite representing a very small share of total volume.

| Finding | Evidence | What it means for decision-makers |
| --- | ---: | --- |
| Demand is highly concentrated | Manhattan = 90.6% of pickups | Start volume planning with Manhattan because it defines the operating baseline. |
| Most rides are short-to-mid fare trips | 86.3% of trips are under $25 | System load is driven by frequent, lower-value rides. |
| Per-trip value differs sharply by origin | EWR = $91.86 average revenue | Small-volume segments can matter disproportionately for revenue strategy. |
| Weekly trend is stable | No sustained rise or fall in 2018 | Observed deviations are episodic rather than structural. |
| Anomaly flags are interpretable | Holiday and disruption dips dominate | Investigate specific days before assuming trend change. |

## From Query to Action

The practical value of this analysis is not that it identifies one magic borough or fare bucket. It gives transportation analysts a sequence for decision-making.

1. **Validate the grain and coverage.** Confirm row count, date boundaries, and critical fields before interpreting aggregates.
2. **Separate baseline traffic from noise.** Use weekly aggregation to smooth daily volatility and avoid overreacting to isolated dips.
3. **Keep volume and value separate.** Manhattan drives total pickups, while airport-linked origins can drive higher per-trip revenue.
4. **Use fare buckets for operating language.** The split between under-$10, $10-$25, $25-$50, and $50+ trips makes the distribution easier to communicate.
5. **Treat anomalies as prompts, not conclusions.** Flag unusual days, then attach context such as holidays, storms, or data coverage limits.

## The Dashboard

The dashboard turns the SQL findings into an executive BI view. The goal is to help a viewer understand the transportation story quickly: where trip volume is concentrated, how fare distribution shapes system load, and where value per trip diverges from pickup share.

Dashboard features:

- KPI strip for trip rows, Manhattan share, sub-$25 trips, revenue per trip, and trend signal
- Filter controls for pickup borough, fare bucket, and planning lens
- Summary charts for weekly traffic, pickup mix, and fare composition
- Taxi-zone SVG choropleth with trip-share and average-revenue toggles
- Location/value view comparing trip share with average revenue per trip
- Anomaly watchlist with interpretable day-level flags
- Query workflow table linking each script to its business question and output

The visual system follows the HR Attrition dashboard: deep navy gradient shell, compact KPI cards, squared-off controls, ocean/gold/ember/plum accents, dense executive panels, and concise decision-support copy.

## Methodology

### Data

| Attribute | Value |
| --- | --- |
| Source | Google BigQuery public datasets |
| Dataset | `bigquery-public-data.new_york_taxi_trips` |
| Fact table | `tlc_yellow_trips_2018` |
| Dimension table | `taxi_zone_geom` |
| Unit of analysis | Taxi trip |
| Rows | 102,871,376 |
| Date coverage | January 1, 2018 to December 31, 2018 |
| Stored locally | No raw trip-level source data; only SQL, documentation, and a derived aggregate taxi-zone GeoJSON artifact |

### SQL Workflow

| Script | Purpose |
| --- | --- |
| `sql/00_sanity_checks.sql` | Confirm row count, date coverage, missing fields, and raw row shape. |
| `sql/01_daily_traffic_over_time.sql` | Aggregate trips to one row per day. |
| `sql/01a_weekly_traffic_trend.sql` | Smooth daily volatility with weekly traffic counts. |
| `sql/02a_trips_by_pickup_borough.sql` | Join pickup location to borough and calculate trip share. |
| `sql/02b_fare_buckets.sql` | Bucket trips by total fare size and calculate distribution. |
| `sql/03a_revenue_per_trip_by_borough.sql` | Compare total and average revenue per trip by pickup borough. |
| `sql/04_anomalous_days.sql` | Flag days outside 60%-140% of average daily volume. |
| `sql/05_pickup_zone_map.sql` | Export aggregate taxi-zone metrics and simplified GeoJSON geometry for the dashboard map. |

## Reproducing the Project

### Run the Dashboard Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Run Dashboard Checks

```bash
npm test
npm run build
```

### Run the SQL

1. Open the Google BigQuery Console.
2. Enable BigQuery Public Datasets.
3. Run the scripts in the `sql/` directory in numeric order.

## Deploying to Vercel

This repository is now Vercel-ready as a Next.js app.

```bash
npm install
npm run build
npx vercel
```

Production deployment: https://bigquery-transportation-push.vercel.app

## Project Structure

```text
ad-hoc-bigquery-transportation-analytics/
├── app/                         # Next.js route and global styles
├── components/                  # Executive dashboard UI components
├── lib/                         # Static dashboard metrics and helpers
├── public/                      # Derived aggregate GeoJSON map artifact
├── sql/                         # BigQuery analysis scripts
├── tests/                       # Dashboard rendering tests
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Portfolio Skills Demonstrated

- Ad-hoc SQL analytics in BigQuery
- Fact-to-dimension joins
- Time-series aggregation and anomaly flagging
- Segmentation and distribution analysis
- Revenue-per-trip comparison
- Static geospatial dashboard design with aggregate GeoJSON
- Executive-facing dashboard design
- TypeScript and Next.js implementation
- Translation of warehouse queries into decision-support storytelling

## Contact

**Joshua Cole, PhD**  
People Analytics / Data Analytics  
GitHub: https://github.com/JoshuaColePhD
