const region = process.env.NEXT_PUBLIC_POSTHOG_REGION === "eu" ? "eu" : "us";

/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  transpilePackages: ["three"],
  experimental: { serverActions: { bodySizeLimit: "2mb" }, serverComponentsExternalPackages: ["firebase-admin", "nodemailer"] },
  // Analytics goes through our own domain (/ingest) so ad blockers do not hide real visitors.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: `https://${region}-assets.i.posthog.com/static/:path*` },
      { source: "/ingest/array/:path*", destination: `https://${region}-assets.i.posthog.com/array/:path*` },
      { source: "/ingest/:path*", destination: `https://${region}.i.posthog.com/:path*` },
    ];
  },
};
