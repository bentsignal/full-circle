import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "../../examples/readme";

describe("README example", () => {
  it("renders and updates through a provided store", () => {
    render(<App />);

    const button = screen.getByRole("button", { name: "Count: 0" });
    fireEvent.click(button);

    expect(button).toHaveTextContent("Count: 1");
  });
});
