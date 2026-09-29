import type { NextConfig } from "next";

/**
 * URL migration strategy: every `.html` URL emitted by the legacy Python
 * generator keeps working via permanent (301) redirects, preserving SEO
 * equity while the platform moves to database-backed routes.
 */
const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      {
        source: "/osek-patur.html",
        destination: "/audiences/osek-patur",
        permanent: true,
      },
      {
        source: "/osek-mursheh.html",
        destination: "/audiences/osek-mursheh",
        permanent: true,
      },
      {
        source: "/how-to-open-osek-patur.html",
        destination: "/guides/how-to-open-osek-patur",
        permanent: true,
      },
      {
        source: "/digital-invoices-israel-rules.html",
        destination: "/guides/digital-invoices-israel-rules",
        permanent: true,
      },
      {
        source: "/recognized-expenses-freelancers.html",
        destination: "/guides/recognized-expenses-freelancers",
        permanent: true,
      },
      {
        source: "/morning-vs-icount.html",
        destination: "/compare/morning-vs-icount",
        permanent: true,
      },
      {
        source: "/ezcount-vs-sumit.html",
        destination: "/compare/ezcount-vs-sumit",
        permanent: true,
      },
      {
        source: "/morning-vs-ezcount.html",
        destination: "/compare/morning-vs-ezcount",
        permanent: true,
      },
      // The old JSON export keeps working via the live API.
      { source: "/tools.json", destination: "/api/tools", permanent: true },
      // Remaining legacy slugs are tool review pages.
      { source: "/:slug.html", destination: "/tools/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
