import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../common/StatusBadge";

describe("StatusBadge connection mode", () => {
  it("renders the live label for live devices", () => {
    render(<StatusBadge mode="live" />);
    expect(screen.getByText("Live device")).toBeInTheDocument();
  });

  it("renders a clearly labeled Demo mode so demo data is never mistaken for live", () => {
    render(<StatusBadge mode="demo" />);
    expect(screen.getByText("Demo data")).toBeInTheDocument();
  });

  it("renders the offline label", () => {
    render(<StatusBadge mode="offline" />);
    expect(screen.getByText("Offline")).toBeInTheDocument();
  });
});
