const axios = require("axios")

const MAX_REQUESTS_COUNT = 5;
const INTERVAL_MS = 10;
const REQUEST_TIMESTAMP = [];

axios.interceptors.request.use(function (config) {
    return new Promise((resolve) => {
        let interval = setInterval(() => {
            const now = new Date();
            if (REQUEST_TIMESTAMP.length < MAX_REQUESTS_COUNT || REQUEST_TIMESTAMP[0] <= now.setSeconds(now.getSeconds() - 1)) {
                if (REQUEST_TIMESTAMP.length === MAX_REQUESTS_COUNT) {
                    REQUEST_TIMESTAMP.shift();
                }
                REQUEST_TIMESTAMP.push(new Date())
                clearInterval(interval)
                resolve(config)
            }
        }, INTERVAL_MS)
    })
})

module.exports = axios
