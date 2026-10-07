import React from "react";
import { Link } from "react-router";
import styles from "./PrivacyPolicy.module.css";

export const PRIVACY_POLICY_UPDATED = "7 October 2026";

const PrivacyPolicy = () => (
  <article className={styles.privacyPolicy}>
    <h1>Privacy Policy</h1>
    <p className={styles.updated}>Last updated {PRIVACY_POLICY_UPDATED}</p>

    <h2>Who we are</h2>
    <p>
      Coolours (coolours.perpetualsummer.ltd) is run by Perpetual Summer Ltd.
      You can contact us about this policy or your data at{" "}
      <a href="mailto:hello@perpetualsummer.ltd">hello@perpetualsummer.ltd</a>.
    </p>

    <h2>The short version</h2>
    <p>
      You don&apos;t need an account to use Coolours, and we don&apos;t ask for
      your name or email. Palettes you save stay on your device. We don&apos;t
      use cookies. We use our own analytics to see how the site is used.
    </p>

    <h2>What stays on your device</h2>
    <ul>
      <li>
        <strong>Saved palettes</strong> and your{" "}
        <strong>light or dark mode choice</strong> are kept in your
        browser&apos;s local storage. They are not sent to us. Clearing your
        browser&apos;s site data removes them.
      </li>
      <li>
        <strong>Images you import</strong> are processed in your browser to pick
        out their colours. They are not uploaded to us. If you import an image
        from a web address, your browser downloads it directly from that
        address.
      </li>
    </ul>

    <h2>What we collect</h2>
    <ul>
      <li>
        <strong>Analytics.</strong> We run our own analytics service, Umami, at
        analytics.perpetualsummer.ltd. It does not use cookies or store your IP
        address. It records page views, referring sites, browser types and
        countries, and which features are used, such as which buttons are
        clicked.
      </li>
      <li>
        <strong>Server logs.</strong> Our server records each page request: the
        address requested, the result and how long it took. Palette links
        contain their colours and palette name, so these appear in the logs.
        These logs do not include your IP address.
      </li>
      <li>
        <strong>Web server and hosting.</strong> Our web server and hosting
        provider handle your IP address to deliver the site. The web server may
        record IP addresses in its error log, for example when a request is
        refused for being sent too often.
      </li>
      <li>
        <strong>Fonts.</strong> Coolours uses the Inter font from Google Fonts,
        so your browser requests it from Google&apos;s servers, which see your
        IP address.
      </li>
    </ul>

    <h2>AI agents (MCP)</h2>
    <p>
      Coolours offers an <abbr title="Model Context Protocol">MCP</abbr> server
      at coolours.perpetualsummer.ltd/mcp, which AI agents can use to create and
      read palette links. When an agent uses it, we log the name and version of
      the agent app, which tool it used and how many colours it sent. We do not
      log IP addresses or the colours themselves. The colours an agent sends are
      used to answer that request and are not stored.
    </p>
    <p>
      Your conversation with the AI agent is handled by the agent&apos;s
      provider under their own privacy policy, not ours. We only receive the
      tool requests the agent sends to Coolours.
    </p>

    <h2>Why we use this information</h2>
    <p>
      To run Coolours, keep it secure and working, and understand how it is used
      so we can improve it. We rely on our legitimate interests in doing these
      things. We don&apos;t sell your information or use it for advertising.
    </p>

    <h2>Who we share it with</h2>
    <p>
      Google (for Google Fonts) and our hosting provider, who process it on our
      behalf. We don&apos;t share it with anyone else unless the law requires us
      to.
    </p>

    <h2>How long we keep it</h2>
    <p>
      Server logs and analytics data are kept only as long as they are useful
      for running and improving the site.
    </p>

    <h2>Your rights</h2>
    <p>
      Under UK data protection law you can ask to see, correct or delete
      personal information we hold about you, and object to how we use it. Email{" "}
      <a href="mailto:hello@perpetualsummer.ltd">hello@perpetualsummer.ltd</a>.
      You can also complain to the Information Commissioner&apos;s Office at{" "}
      <a href="https://ico.org.uk">ico.org.uk</a>.
    </p>

    <h2>Changes to this policy</h2>
    <p>
      If we change this policy, we&apos;ll update it here and change the date at
      the top.
    </p>

    <p>
      <Link to="/">Back to Coolours</Link>
    </p>
  </article>
);

export default PrivacyPolicy;
