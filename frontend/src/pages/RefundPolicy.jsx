import PolicyLayout from '../components/PolicyLayout';
import { COMPANY } from '../data/company';

export default function RefundPolicy() {
  return (
    <PolicyLayout title="Return, Refund & Cancellation Policy">
      <p>
        At {COMPANY.brand}, we want you to be completely satisfied with your purchase. This policy outlines the conditions
        for returns, exchanges, refunds, and order cancellations for products sold by {COMPANY.legalName}.
      </p>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">1. Return Eligibility</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Returns are accepted within 7 days of delivery for unused, unworn products in original condition.</li>
          <li>The saree must be returned with original tags, blouse piece (if included), and packaging intact.</li>
          <li>Products showing signs of wear, stains, alterations, or damage are not eligible for return.</li>
          <li>Customised, made-to-order, or clearance sale items are non-returnable unless defective.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">2. How to Initiate a Return</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Email {COMPANY.email} with your order number, reason for return, and photos of the product.</li>
          <li>Our team will review your request within 2 business days and provide return instructions.</li>
          <li>Ship the product back using the approved return method. Return shipping may be borne by the customer unless the return is due to our error or a defective product.</li>
        </ol>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">3. Refunds</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Refunds are processed within 7–10 business days after we receive and inspect the returned item.</li>
          <li>Refunds are credited to the original payment method. For COD orders, refunds are processed via bank transfer or UPI.</li>
          <li>Shipping charges are non-refundable unless the return is due to a wrong or defective product sent by us.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">4. Exchanges</h2>
        <p>
          Exchanges are subject to product availability. If the requested replacement is unavailable, we will offer
          a refund or an alternative product of equal value. Contact us at {COMPANY.email} to request an exchange.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">5. Order Cancellation</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Orders can be cancelled before dispatch by emailing {COMPANY.email} with your order number.</li>
          <li>Once an order has been shipped, it cannot be cancelled. You may return it as per this policy after delivery.</li>
          <li>Refunds for cancelled orders are processed within 5–7 business days.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">6. Defective or Wrong Products</h2>
        <p>
          If you receive a defective, damaged, or incorrect product, contact us within 48 hours of delivery with
          photos. We will arrange a free replacement or full refund, including return shipping costs.
        </p>
      </section>
    </PolicyLayout>
  );
}
