// next.config.js

module.exports = {
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
