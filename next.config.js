/** @type {import('next').NextConfig} */
const nextConfig = {
    // SSR habilitado por defecto - compatible con AWS Amplify
    images: {
        unoptimized: true, // Simplifica despliegue
    },
}

module.exports = nextConfig
