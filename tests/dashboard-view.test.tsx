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
    expect(screen.getByText("04_anomalous_days.sql")).toBeInTheDocument();
  });
});
