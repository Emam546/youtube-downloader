// next.config.js

module.exports = {
    appDir: true,
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: "img-src 'self' data: https://i.ytimg.com;",
                    },
                ],
            },
        ];
    },
};
