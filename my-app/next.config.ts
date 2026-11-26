import type { NextConfig } from "next";

// Optional for frontend work without cloud credentials:
//   VAYU_API_PROXY=https://vayuai.vercel.app npm run dev
// sends /api/* to that deployment instead of the local route handlers.
const apiProxy = process.env.VAYU_API_PROXY;

const nextConfig: NextConfig = {
  async rewrites() {
    if (!apiProxy) return [];
    return {
      beforeFiles: [{ source: "/api/:path*", destination: `${apiProxy.replace(/\/$/, "")}/api/:path*` }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
