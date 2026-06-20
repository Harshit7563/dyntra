import PolicyLayout from '../components/PolicyLayout';
import { COMPANY } from '../data/company';

export default function PrivacyPolicy() {
  return (
    <PolicyLayout title="Privacy Policy">
      <p>
        This Privacy Policy describes how {COMPANY.legalName} (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;),
        operating the {COMPANY.brand} brand and website, collects, uses, stores, and protects your personal
        information when you visit our website or purchase our products.
      </p>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">1. Information We Collect</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Account information:</strong> name, email address, phone number, and password when you register.</li>
          <li><strong>Order information:</strong> shipping address, billing details, payment method selected, and order history.</li>
          <li><strong>Communication data:</strong> messages you send us via email or contact forms, and newsletter subscriptions.</li>
          <li><strong>Technical data:</strong> IP address, browser type, device information, and pages visited (via cookies and analytics).</li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">2. How We Use Your Information</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Process and deliver your orders, including shipping updates.</li>
          <li>Manage your account and provide customer support.</li>
          <li>Send transactional emails such as order confirmations and delivery notifications.</li>
          <li>Send promotional communications if you have opted in to our newsletter.</li>
          <li>Improve our website, products, and services.</li>
          <li>Comply with applicable laws and prevent fraud.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">3. Sharing of Information</h2>
        <p>
          We do not sell your personal data. We may share information with trusted third parties only when necessary:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>Logistics and courier partners for order delivery.</li>
          <li>Payment processors to complete transactions securely.</li>
          <li>Technology service providers who help us operate our website.</li>
          <li>Legal or regulatory authorities when required by law.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">4. Cookies</h2>
        <p>
          We use cookies and similar technologies to remember your cart, wishlist, login session, and site preferences.
          You can disable cookies in your browser settings, though some features may not work correctly.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">5. Data Retention & Security</h2>
        <p>
          We retain your information for as long as your account is active or as needed to fulfil orders and legal obligations.
          We implement reasonable technical and organisational measures to protect your data against unauthorised access,
          alteration, or disclosure.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">6. Your Rights</h2>
        <p>
          Subject to applicable Indian law, including the Digital Personal Data Protection Act, 2023, you may request access to,
          correction of, or deletion of your personal data. You may also withdraw consent for marketing communications at any time
          by contacting us at {COMPANY.email}.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">7. Children&apos;s Privacy</h2>
        <p>
          Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from minors.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">8. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.
          Continued use of our website after changes constitutes acceptance of the revised policy.
        </p>
      </section>
    </PolicyLayout>
  );
}
