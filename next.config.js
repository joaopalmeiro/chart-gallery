/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/1',
        permanent: false,
      },
    ]
  },
  images: {
    domains: ['faqkcwjlhdjecqllvtrg.supabase.co'],
  },
}
