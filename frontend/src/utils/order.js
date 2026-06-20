export const FREE_SHIPPING_MIN = 999;
export const SHIPPING_FEE = 49;
export const COD_MAX_PRODUCT_PRICE = 1000;

export function calcOrderTotals(subtotal, couponCode = '') {
  const shipping = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
  const coupon = couponCode.trim().toUpperCase();
  const discountRate = coupon === 'FIRST10' ? 0.1 : 0;
  const discount = Math.round(subtotal * discountRate);
  const total = subtotal + shipping - discount;
  return { subtotal, shipping, discount, total, discountRate };
}
