import PolicyLayout from '../components/PolicyLayout';
import { COMPANY } from '../data/company';

export default function ShippingPolicy() {
  return (
    <PolicyLayout title="Shipping & Delivery Policy">
      <p>
        This Shipping & Delivery Policy applies to all orders placed on {COMPANY.brand}, operated by {COMPANY.legalName}.
      </p>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">1. Delivery Areas</h2>
        <p>
          We currently deliver to all serviceable pin codes across India through our courier partners.
          Delivery to remote or restricted areas may take additional time or may not be available.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">2. Processing Time</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Orders are typically processed within 1–2 business days after confirmation.</li>
          <li>Handloom and made-to-order sarees may require additional processing time, which will be communicated at the time of order.</li>
          <li>Orders placed on weekends or public holidays are processed on the next business day.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">3. Delivery Timeline</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Standard delivery: 5–10 business days from dispatch, depending on your location.</li>
          <li>Metro cities may receive orders within 3–7 business days.</li>
          <li>Delivery timelines are estimates and may vary due to weather, logistics delays, or force majeure events.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">4. Shipping Charges</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Free shipping on orders above ₹999.</li>
          <li>A flat shipping fee of ₹49 applies to orders below ₹999.</li>
          <li>Shipping charges are displayed at checkout before you confirm your order.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">5. Order Tracking</h2>
        <p>
          Once your order is dispatched, you will receive tracking details via email and/or SMS.
          You can also view your order status in your account under &quot;Order History&quot; if you are logged in.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">6. Delivery Attempts</h2>
        <p>
          Our courier partner will make up to two delivery attempts. If delivery fails due to incorrect address,
          unavailability, or refusal to accept, the order may be returned to us and a re-shipping fee may apply.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">7. Damaged or Missing Items</h2>
        <p>
          Please inspect your package at the time of delivery. If the outer packaging is damaged, note this with the
          delivery agent and contact us within 48 hours at {COMPANY.email} with photos of the package and product.
        </p>
      </section>
    </PolicyLayout>
  );
}
