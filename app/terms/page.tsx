import { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "The terms that govern your use of Insight by CitiPlug.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms and Conditions" updated="24 July 2026">
      <p>
        These Terms and Conditions ("Terms") govern your access to and use of
        Insight by CitiPlug (the "Site"), operated by 1105 Media Ltd
        ("1105 Media," "we," "us," or "our"), a company registered in Ogun
        State, Nigeria. By visiting or using the Site, you agree to these
        Terms. If you do not agree, please do not use the Site.
      </p>

      <h2>1. Who We Are</h2>
      <p>
        Insight by CitiPlug is a digital magazine covering culture, city
        life, campus life, and events across Ijebu Ode and the wider Ogun
        State region, published as part of 1105 Media Ltd's media portfolio,
        which also includes CitiPlug, The Finest NG, TicketPass
        Technologies, and related brands.
      </p>

      <h2>2. Use of the Site</h2>
      <p>
        You may browse, read, and share content from the Site for personal,
        non-commercial purposes. You agree not to reproduce, republish, or
        redistribute our articles, photography, or video content without
        prior written permission, except as permitted under fair use or as
        described in our Copyright page.
      </p>
      <p>
        You agree not to use the Site to upload or transmit anything
        unlawful, defamatory, obscene, or infringing on the rights of
        others, and not to attempt to interfere with the Site's operation,
        security, or the experience of other visitors.
      </p>

      <h2>3. Comments and User Contributions</h2>
      <p>
        Where the Site allows comments or user-submitted content, you retain
        ownership of what you post, but you grant us a non-exclusive,
        royalty-free licence to display, moderate, and remove it at our
        discretion. We reserve the right to remove any contribution that
        violates these Terms or that we otherwise deem inappropriate.
      </p>

      <h2>4. Third-Party Links and Sponsored Content</h2>
      <p>
        The Site may contain links to external websites, sponsored features,
        or promotional placements from our network of brands or paid
        partners. We do not control and are not responsible for the content,
        accuracy, or practices of any third-party site linked from Insight.
        Sponsored or promotional content is identified as such where
        applicable.
      </p>

      <h2>5. Advertising</h2>
      <p>
        The Site displays advertising, including both directly-sold
        placements and automated advertising served through third-party
        networks (such as Google AdSense). Advertising partners may use
        cookies and similar technologies as described in our Privacy Policy.
      </p>

      <h2>6. Newsletter and Email Communications</h2>
      <p>
        If you subscribe to our newsletter, you consent to receive email
        updates from Insight by CitiPlug. You may unsubscribe at any time
        using the link provided in any email we send, or by contacting us
        directly.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        All original articles, photography, video, graphics, and branding on
        the Site are the property of 1105 Media Ltd or its licensors and are
        protected under Nigerian and international copyright law. See our
        Copyright page for details on permitted use and how to report
        infringement.
      </p>

      <h2>8. Disclaimer of Warranties</h2>
      <p>
        The Site and its content are provided "as is" without warranties of
        any kind, express or implied. We do not guarantee that the Site will
        be uninterrupted, error-free, or free of viruses or other harmful
        components.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, 1105 Media Ltd shall not be
        liable for any indirect, incidental, or consequential damages
        arising from your use of, or inability to use, the Site.
      </p>

      <h2>10. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the
        Site after changes are posted constitutes acceptance of the revised
        Terms. The "Last updated" date above reflects the most recent
        revision.
      </p>

      <h2>11. Governing Law</h2>
      <p>
        These Terms are governed by the laws of the Federal Republic of
        Nigeria. Any disputes arising from these Terms or use of the Site
        shall be subject to the exclusive jurisdiction of the Nigerian
        courts.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about these Terms can be sent to our team through the
        contact details listed on our About Us page.
      </p>
    </LegalPage>
  );
}
