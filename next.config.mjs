/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@tensorflow/tfjs', '@tensorflow-models/pose-detection', 'chart.js', 'react-chartjs-2'],
  },
};

export default nextConfig;
