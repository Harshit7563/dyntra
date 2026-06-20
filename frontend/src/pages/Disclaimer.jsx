import PolicyLayout from '../components/PolicyLayout';
import { COMPANY } from '../data/company';

export default function Disclaimer() {
  return (
    <PolicyLayout title="Disclaimer">
      <p>
        The information provided on the {COMPANY.brand} website ({COMPANY.legalName}) is for general informational
        and shopping purposes only. By using this website, you acknowledge and agree to the following:
      </p>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">1. Product Representation</h2>
        <p>
          We make every effort to display product colours and details accurately. However, due to variations in screen
          settings, photography, and the handcrafted nature of handloom sarees, actual products may differ slightly
          in shade, texture, or weave pattern from images shown on the website.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">2. No Professional Advice</h2>
        <p>
          Content on this website does not constitute professional, legal, or financial advice. Any care instructions
          or styling suggestions are provided for general guidance only.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">3. External Links</h2>
        <p>
          Our website may contain links to third-party websites. We are not responsible for the content, privacy
          practices, or availability of external sites.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">4. Availability & Errors</h2>
        <p>
          We do not guarantee that the website will be uninterrupted or error-free. We reserve the right to correct
          typographical errors, inaccuracies, or omissions at any time without prior notice.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-3">5. Limitation of Liability</h2>
        <p>
          {COMPANY.legalName} shall not be held liable for any loss or damage arising from the use of this website
          or reliance on any information provided herein, except as expressly stated in our Terms & Conditions.
        </p>
      </section>
    </PolicyLayout>
  );
}
