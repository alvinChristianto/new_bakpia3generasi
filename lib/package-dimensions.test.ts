import { describe, it, expect } from "vitest";
import {
  calculatePackageDimensions,
  PRODUCT_WEIGHT_GRAMS,
  PRODUCT_LENGTH_CM,
  PRODUCT_WIDTH_CM,
  PRODUCT_HEIGHT_CM,
} from "./package-dimensions";

describe("calculatePackageDimensions", () => {
  it("returns a single-box baseline when cart is empty", () => {
    expect(calculatePackageDimensions([])).toEqual({
      weight: PRODUCT_WEIGHT_GRAMS,
      length: PRODUCT_LENGTH_CM,
      width: PRODUCT_WIDTH_CM,
      height: PRODUCT_HEIGHT_CM,
    });
  });

  it("returns a single-box baseline when all quantities are zero", () => {
    expect(
      calculatePackageDimensions([{ quantity: 0 }, { quantity: 0 }]),
    ).toEqual({
      weight: PRODUCT_WEIGHT_GRAMS,
      length: PRODUCT_LENGTH_CM,
      width: PRODUCT_WIDTH_CM,
      height: PRODUCT_HEIGHT_CM,
    });
  });

  it("scales weight and height with total quantity; keeps length and width fixed", () => {
    const result = calculatePackageDimensions([
      { quantity: 2 },
      { quantity: 3 },
    ]);

    expect(result.weight).toBe(5 * PRODUCT_WEIGHT_GRAMS);
    expect(result.height).toBe(5 * PRODUCT_HEIGHT_CM);
    expect(result.length).toBe(PRODUCT_LENGTH_CM);
    expect(result.width).toBe(PRODUCT_WIDTH_CM);
  });

  it("handles a single line item with quantity 1", () => {
    expect(calculatePackageDimensions([{ quantity: 1 }])).toEqual({
      weight: PRODUCT_WEIGHT_GRAMS,
      length: PRODUCT_LENGTH_CM,
      width: PRODUCT_WIDTH_CM,
      height: PRODUCT_HEIGHT_CM,
    });
  });
});
