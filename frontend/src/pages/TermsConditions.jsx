import PolicyLayout from '../components/PolicyLayout';
import { Link } from 'react-router-dom';
import { COMPANY } from '../data/company';

export default function TermsConditions() {
  return (
    <PolicyLayout title="Terms & Conditions">
      <p>
        Welcome to {COMPANY.brand}. These Terms & Conditions (&quot;Terms&quot;) govern your access to and use of our website
        and the purchase of products offered by {COMPANY.legalName} (CIN: {COMPANY.cin}).
        By accessing our website or placing an order, you agree to be bound by these Terms.
      </p>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">1. About Us</h2>
        <p>
          {COMPANY.brand} is an online retail brand operated by {COMPANY.legalName}, registered in Maharashtra, India.
          Registered office: {COMPANY.fullAddress}.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">2. Eligibility</h2>
        <p>
          You must be at least 18 years of age and capable of entering into a legally binding contract under Indian law
          to use this website and place orders.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">3. Products & Pricing</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>All product images are for illustrative purposes. Slight variations in colour, weave, or zari work may occur due to the handloom nature of our sarees.</li>
          <li>Prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.</li>
          <li>We reserve the right to modify prices, offers, and product availability without prior notice.</li>
          <li>We may cancel orders in case of pricing errors, stock unavailability, or suspected fraudulent activity.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">4. Orders & Payment</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Placing an order constitutes an offer to purchase. Order confirmation is subject to acceptance and product availability.</li>
          <li>We accept Cash on Delivery (COD), UPI, and card payments as displayed at checkout.</li>
          <li>You are responsible for providing accurate shipping and contact details.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">5. Shipping & Delivery</h2>
        <p>
          Delivery timelines and shipping charges are governed by our{' '}
          <Link to="/shipping-policy" className="text-maroon hover:underline">Shipping & Delivery Policy</Link>.
          Risk of loss passes to you upon delivery to the address provided.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">6. Returns & Refunds</h2>
        <p>
          Returns, exchanges, and refunds are subject to our{' '}
          <Link to="/refund-policy" className="text-maroon hover:underline">Return & Refund Policy</Link>.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">7. Intellectual Property</h2>
        <p>
          All content on this website — including logos, text, images, and design — is owned by or licensed to
          {COMPANY.legalName}. You may not reproduce, distribute, or use any content without our written permission.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">8. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, {COMPANY.legalName} shall not be liable for any indirect, incidental,
          or consequential damages arising from your use of the website or purchase of products. Our total liability
          for any claim shall not exceed the amount paid by you for the relevant order.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">9. Governing Law & Disputes</h2>
        <p>
          These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction
          of the courts in {COMPANY.jurisdiction}.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">10. Contact</h2>
        <p>
          For questions regarding these Terms, please contact us at {COMPANY.phone}, WhatsApp, or {COMPANY.email}, or write to our registered office
          at the address listed above.
        </p>
      </section>
    </PolicyLayout>
  );
}
