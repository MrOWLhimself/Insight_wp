import { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Insight by CitiPlug collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="24 July 2026">
      <p>
        This Privacy Policy explains how 1105 Media Ltd ("we," "us," "our")
        collects, uses, and protects information when you visit Insight by
        CitiPlug (the "Site"). We aim to handle your data in line with the
        Nigeria Data Protection Act (NDPA) 2023 and generally accepted data
        protection principles.
      </p>

      <h2>1. Information We Collect</h2>
      <p>
        <strong>Information you provide directly:</strong> your email
        address if you subscribe to our newsletter, and any information you
        submit in comments or through contact forms.
      </p>
      <p>
        <strong>Information collected automatically:</strong> when you visit
        the Site, we (and our analytics and advertising partners) may
        automatically collect data such as your IP address, approximate
        location (city/country level), device and browser type, pages
        viewed, referring site, and time spent on the Site. This powers the
        analytics dashboard we use internally to understand readership —
        covering visits, page views, referrers, general location, and
        engagement with individual articles.
      </p>

      <h2>2. Cookies and Similar Technologies</h2>
      <p>
        The Site uses cookies and similar technologies for core
        functionality, analytics, and advertising. Our advertising partners,
        including Google AdSense, may use cookies to serve ads based on your
        prior visits to this and other websites. You can control cookies
        through your browser settings; note that disabling cookies may
        affect how parts of the Site function.
      </p>

      <h2>3. How We Use Your Information</h2>
      <ul>
        <li>To operate, maintain, and improve the Site and its content.</li>
        <li>To send newsletter updates to subscribers who have opted in.</li>
        <li>To measure readership and engagement across articles and sections.</li>
        <li>To serve relevant advertising, including through automated ad networks.</li>
        <li>To detect and prevent abuse, fraud, or security issues.</li>
      </ul>

      <h2>4. How We Share Information</h2>
      <p>
        We do not sell your personal information. We may share limited data
        with:
      </p>
      <ul>
        <li>
          Service providers who help us operate the Site (such as our
          hosting provider, Supabase for data storage, and our content
          management system).
        </li>
        <li>
          Advertising and analytics partners, who may set their own cookies
          subject to their respective privacy policies.
        </li>
        <li>
          Authorities, where required by Nigerian law or in response to a
          valid legal request.
        </li>
      </ul>

      <h2>5. Newsletter Subscriptions</h2>
      <p>
        If you subscribe to our newsletter, we store your email address
        solely for the purpose of sending you updates from Insight by
        CitiPlug. You can unsubscribe at any time via the link in any email,
        or by contacting us directly; your email is then marked as
        unsubscribed and removed from future sends.
      </p>

      <h2>6. Comments</h2>
      <p>
        Where comments are enabled, any information you include in a
        comment (including your name, if provided) may be publicly visible.
        Please avoid sharing sensitive personal information in comments.
      </p>

      <h2>7. Data Retention</h2>
      <p>
        We retain personal data only as long as necessary for the purposes
        described in this Policy, or as required by law. Analytics data is
        generally retained in aggregate form for readership reporting.
      </p>

      <h2>8. Your Rights</h2>
      <p>
        Depending on applicable law, you may have the right to request
        access to, correction of, or deletion of your personal data, and to
        withdraw consent for communications such as our newsletter at any
        time. To make a request, contact us using the details on our About
        Us page.
      </p>

      <h2>9. Children's Privacy</h2>
      <p>
        The Site is not directed at children under 13, and we do not
        knowingly collect personal information from children under that
        age.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Material
        changes will be reflected by updating the "Last updated" date above.
      </p>

      <h2>11. Contact</h2>
      <p>
        For privacy-related questions or requests, please reach our team
        through the contact details listed on our About Us page.
      </p>
    </LegalPage>
  );
}
