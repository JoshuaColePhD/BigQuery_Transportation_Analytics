-- Business Question 5:
-- Where do pickup concentration and per-trip value appear at the taxi-zone level?
-- Dimension: pickup taxi zone
-- Metrics: trips, share of total trips, total revenue, average revenue per trip
-- Geometry: taxi-zone polygon exported as GeoJSON for static dashboard use
-- Grain: one row per pickup taxi zone

WITH pickup_metrics AS (
  SELECT
    CAST(pickup_location_id AS STRING) AS zone_id,
    COUNT(*) AS trips,
    SUM(t.total_amount) AS total_revenue,
    AVG(t.total_amount) AS avg_revenue_per_trip
  FROM `bigquery-public-data.new_york_taxi_trips.tlc_yellow_trips_2018` t
  WHERE pickup_location_id IS NOT NULL
  GROUP BY zone_id
),
zones AS (
  SELECT
    z.zone_id,
    ANY_VALUE(z.zone_name) AS zone_name,
    ANY_VALUE(z.borough) AS borough,
    ANY_VALUE(ST_ASGEOJSON(ST_SIMPLIFY(z.zone_geom, 25))) AS geometry
  FROM `bigquery-public-data.new_york_taxi_trips.taxi_zone_geom` z
  WHERE z.zone_geom IS NOT NULL
  GROUP BY z.zone_id
)
SELECT
  z.zone_id,
  z.zone_name,
  z.borough,
  m.trips,
  SAFE_DIVIDE(m.trips, SUM(m.trips) OVER ()) AS pct_of_total_trips,
  m.total_revenue,
  m.avg_revenue_per_trip,
  z.geometry
FROM pickup_metrics m
JOIN zones z
  ON m.zone_id = z.zone_id
ORDER BY m.trips DESC;
