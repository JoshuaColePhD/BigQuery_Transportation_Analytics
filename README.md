# BigQuery Transportation Analytics

## 📌 Overview
This project demonstrates SQL-based analytics using Google BigQuery public datasets. The analysis focuses on understanding patterns in NYC yellow taxi trips through warehouse-style SQL queries, including baseline metrics, segmentation, and trend analysis.

The goal is to replicate how a data analyst would explore a large, event-level dataset to establish baseline behavior, identify key drivers of volume and value, and flag notable deviations from normal activity.

---

## 🧰 Tech Stack
- 🗄️ SQL (Google BigQuery)
- 🔗 GitHub for version control

---

## 🗃️ Dataset
- **Source:** `bigquery-public-data.new_york_taxi_trips`
- **Fact table:** `tlc_yellow_trips_2018` (one row per taxi trip)
- **Dimension table:** `taxi_zone_geom` (lookup table for pickup location context)
- **Total rows:** 102,871,376 taxi trips
- **Date coverage:** January 1, 2018 – December 31, 2018
- **Grain:** one row per taxi trip prior to aggregation
- **Notes:** This repository stores SQL queries and documentation only. No data is stored locally.

---

## ❓ Business Questions
1. 📈 How does taxi traffic change over time?
2. 📍 Where does taxi traffic come from (by location and fare patterns)?
3. 💵 How does revenue per trip differ across segments?
4. 🚨 Are there notable trends or anomalies in traffic?

---

## 📊 Findings

### 🔍 Executive Summary

| Question | Key Metric | Result |
|---|---|---|
| Traffic over time | Daily trip volume | Stable baseline with strong weekly seasonality |
| Traffic by location | Share of pickups (Manhattan) | **90.6%** of all trips |
| Traffic by fare | Trips under $25 | **86.3%** of total volume |
| Value by location | Avg revenue per trip (Manhattan) | **$14.32** |
| High-value segment | Avg revenue per trip (EWR) | **$91.86** |
| Anomalies | Sustained deviations | None observed (episodic deviations only) |

### 1️⃣ Traffic Over Time
Daily taxi trip volume in 2018 is relatively stable, exhibiting strong weekly seasonality with predictable weekday–weekend fluctuations. Outside of short-term variation and isolated dips, there is no sustained upward or downward trend in overall traffic. The sharp decline observed at the end of the series reflects data coverage limits rather than a real change in demand.

---

### 2️⃣ Traffic Composition by Location and Fare

#### 📍 Traffic by Pickup Location
Taxi trip volume is extremely concentrated geographically. Manhattan accounts for approximately **90.6% of all pickups**, while Queens and Brooklyn contribute **6.4%** and **1.3%** respectively. All other boroughs together represent less than **0.2%** of total trips. This indicates that overall taxi demand in 2018 is overwhelmingly driven by activity within Manhattan, with outer boroughs playing a comparatively minor role in total trip volume.

#### 💲 Traffic by Fare Pattern
Fare distributions show that taxi traffic is primarily driven by low- to mid-priced trips. Approximately **48.6%** of trips fall within the **$10–$25** range, while an additional **37.7%** cost under **$10**. Trips exceeding **$50** account for only **4.5%** of total volume, indicating that system usage is dominated by frequent, short-distance rides rather than infrequent high-value fares.

*Together, these findings suggest that overall taxi traffic in 2018 is driven by frequent, short-distance trips concentrated in Manhattan, rather than by high-value or geographically dispersed rides.*

---

### 3️⃣ Revenue per Trip by Location
Average revenue per trip varies substantially by pickup borough. While Manhattan accounts for the vast majority of trip volume, it exhibits the lowest average revenue per trip at approximately **$14.32**, reflecting a high frequency of short-distance rides. In contrast, outer boroughs generate fewer trips but higher average revenue per ride. Trips originating near **EWR (Newark Airport)** show the highest average revenue per trip (approximately **$91.86**), despite representing a very small share of total volume.

These patterns indicate that overall trip volume and per-trip value are not aligned across locations. High-demand areas drive system usage through frequent, low-value trips, while lower-volume segments contribute disproportionately higher revenue per trip.

---

### 4️⃣ Trends and Anomalies
Daily trip volume shows expected short-term fluctuations around a stable baseline. Several isolated days exhibit significantly higher or lower traffic than average, consistent with holidays or short-term disruptions. Weekly aggregation smooths daily noise and confirms the absence of any sustained upward or downward trend across the year, suggesting normal operational variability rather than structural change in demand.

---

## 🗂️ Project Structure
```
ad-hoc–bigquery-transportation-analytics
├── .gitignore
├── README.md
└── sql
├── 00_sanity_checks.sql
├── 01_daily_traffic_over_time.sql
├── 01a_weekly_traffic_trend.sql
├── 02a_trips_by_pickup_borough.sql
├── 02b_fare_buckets.sql
├── 03a_revenue_per_trip_by_borough.sql
└── 04_anomalous_days.sql
*Note: No output files are committed; results are reproducible by running the SQL scripts.*
```
SQL scripts are numbered to reflect the analytical workflow, from data validation and baseline analysis through segmentation, value comparison, and anomaly detection.

---

## 🧠 Key Skills Demonstrated
- Ad-hoc reporting
- Time-series analysis
- Fact-to-dimension joins
- Segmentation and distribution analysis
- Grain control and validation
- Careful interpretation of trends and anomalies

---

## ▶️ How to Reproduce
1. Open the Google BigQuery Console
2. Enable BigQuery Public Datasets
3. Run the SQL scripts in the `/sql` directory in numeric order

---

## ⚠️ Assumptions & Limitations
- Analysis is descriptive, not causal
- Public dataset limitations apply
- Results reflect 2018 NYC yellow taxi trips only
- No local data storage; all queries run in BigQuery
