/**
 * Physical spec per 1 bakpia box.
 * Update these values if packaging changes.
 */
export const PRODUCT_WEIGHT_GRAMS = 700;
export const PRODUCT_LENGTH_CM = 14;
export const PRODUCT_WIDTH_CM = 12;
export const PRODUCT_HEIGHT_CM = 5;

export interface PackageDimensions {
  weight: number; // grams
  length: number; // cm
  width: number; // cm
  height: number; // cm
}

/**
 * Calculate total package dimensions from cart.
 * Boxes are stacked vertically → only height scales with quantity.
 * Length and width are fixed to the widest box dimension.
 */
export function calculatePackageDimensions(
  cartItems: { quantity: number }[],
): PackageDimensions {
  const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (totalQty === 0) {
    return {
      weight: PRODUCT_WEIGHT_GRAMS,
      length: PRODUCT_LENGTH_CM,
      width: PRODUCT_WIDTH_CM,
      height: PRODUCT_HEIGHT_CM,
    };
  }

  return {
    weight: totalQty * PRODUCT_WEIGHT_GRAMS,
    length: PRODUCT_LENGTH_CM, // fixed — widest side doesn't grow
    width: PRODUCT_WIDTH_CM, // fixed
    height: totalQty * PRODUCT_HEIGHT_CM, // stacks increase height
  };
}
