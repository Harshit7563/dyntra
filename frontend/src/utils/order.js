export const FREE_SHIPPING_MIN = 0;
export const SHIPPING_FEE = 0;

export function calcOrderTotals(subtotal, couponCode = '') {
  const shipping = 0;
  const coupon = couponCode.trim().toUpperCase();
  const discountRate = coupon === 'FIRST10' ? 0.1 : 0;
  const discount = Math.round(subtotal * discountRate);
  const total = subtotal + shipping - discount;
  return { subtotal, shipping, discount, total, discountRate };
}
