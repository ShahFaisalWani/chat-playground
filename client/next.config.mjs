// const NEXT_PUBLIC_API_PROXY_PREFIX = process.env.NEXT_PUBLIC_API_PROXY_PREFIX;
// const NEXT_PUBLIC_API_PROXY = process.env.NEXT_PUBLIC_API_PROXY;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // async rewrites() {
  //   return [
  //     {
  //       source: `${NEXT_PUBLIC_API_PROXY_PREFIX}/:path*`,
  //       destination: `${NEXT_PUBLIC_API_PROXY}/:path*`,
  //     },
  //   ];
  // },
};

export default nextConfig;
