import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DashboardView } from "@/components/dashboard-view";

describe("DashboardView", () => {
  it("renders the transportation dashboard KPIs", () => {
    render(<DashboardView />);

    expect(screen.getByRole("heading", { name: /nyc taxi analytics dashboard/i })).toBeInTheDocument();
    expect(screen.getByText("102.9M")).toBeInTheDocument();
    expect(screen.getByText("90.6%")).toBeInTheDocument();
  });

  it("switches to the query workflow tab", async () => {
    const user = userEvent.setup();
    render(<DashboardView />);

    await user.click(screen.getByRole("button", { name: /query workflow/i }));

    expect(screen.getByText("00_sanity_checks.sql")).toBeInTheDocument();
    expect(screen.getByText("05_pickup_zone_map.sql")).toBeInTheDocument();
  });

  it("renders the geospatial tab and changes the active map metric", async () => {
    const user = userEvent.setup();
    render(<DashboardView />);

    await user.click(screen.getByRole("button", { name: /geospatial/i }));

    expect(screen.getByRole("heading", { name: /taxi-zone pickup map/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /taxi-zone choropleth by trip share/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /avg revenue/i }));

    expect(screen.getByRole("img", { name: /taxi-zone choropleth by avg revenue/i })).toBeInTheDocument();
  });

  it("renders tooltip readout content for a known taxi zone", async () => {
    const user = userEvent.setup();
    render(<DashboardView />);

    await user.click(screen.getByRole("button", { name: /geospatial/i }));

    expect(screen.getByText("Hovered zone")).toBeInTheDocument();
    expect(screen.getAllByText("Midtown Center").length).toBeGreaterThan(0);
    expect(screen.getAllByText("18.60%").length).toBeGreaterThan(0);
  });
});
