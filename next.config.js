// next.config.js

module.exports = {
    
    experimental: {
        appDir: true,
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: "img-src * data:;",
                    },
                ],
            },
        ];
    },
};
