import { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Copyright",
  description: "Copyright ownership, permitted use, and infringement reporting for Insight by CitiPlug.",
};

export default function CopyrightPage() {
  return (
    <LegalPage title="Copyright" updated="24 July 2026">
      <p>
        © {new Date().getFullYear()} 1105 Media Ltd. All rights reserved.
        Insight by CitiPlug, and all original articles, photography, video,
        graphics, and layouts published on this Site, are the property of
        1105 Media Ltd unless otherwise credited.
      </p>

      <h2>1. Ownership</h2>
      <p>
        Unless a piece of content is explicitly credited to another party
        (such as a guest contributor, syndicated partner, or stock imagery
        licensor), all text, photography, and video published on Insight by
        CitiPlug is created by or on behalf of 1105 Media Ltd and is
        protected under the Nigerian Copyright Act and applicable
        international copyright treaties.
      </p>

      <h2>2. What You May Do</h2>
      <p>You are welcome to:</p>
      <ul>
        <li>Share links to our articles on social media or elsewhere.</li>
        <li>
          Quote brief excerpts (a sentence or two) with clear attribution
          and a link back to the original article.
        </li>
        <li>
          Embed content using official share tools or embed codes we
          provide, where available.
        </li>
      </ul>

      <h2>3. What You May Not Do</h2>
      <p>Without our prior written permission, you may not:</p>
      <ul>
        <li>
          Republish full articles, or substantial portions of them, on
          another website, publication, or platform.
        </li>
        <li>
          Use our photography or video content outside of the original
          article context.
        </li>
        <li>
          Modify, remix, or create derivative works from our content for
          redistribution.
        </li>
        <li>
          Use our name, logo, or branding in a way that suggests
          endorsement or affiliation without our consent.
        </li>
      </ul>

      <h2>4. Third-Party and Licensed Content</h2>
      <p>
        Some images or content on the Site may be licensed from third
        parties or used with permission and remain the property of their
        respective owners. Credit is given where required by the license
        terms.
      </p>

      <h2>5. Reporting Infringement</h2>
      <p>
        If you believe your copyrighted work has been used on Insight by
        CitiPlug without authorization, please contact us through the
        details on our About Us page with:
      </p>
      <ul>
        <li>A description of the copyrighted work you believe was infringed.</li>
        <li>The specific URL(s) where the content appears on our Site.</li>
        <li>Your contact information and a statement confirming your good-faith belief that the use is unauthorized.</li>
      </ul>
      <p>
        We will review valid reports promptly and remove or correct
        attribution on infringing content where appropriate.
      </p>

      <h2>6. Licensing Our Content</h2>
      <p>
        If you're interested in licensing our articles, photography, or
        video for commercial use, syndication, or republication, please get
        in touch — we consider requests on a case-by-case basis.
      </p>
    </LegalPage>
  );
}
