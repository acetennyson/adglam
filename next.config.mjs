/** @type {import('next').NextConfig} */
export default { reactStrictMode: true, transpilePackages: ["three"], experimental: { serverActions: { bodySizeLimit: "2mb" }, serverComponentsExternalPackages: ["firebase-admin"] } };
