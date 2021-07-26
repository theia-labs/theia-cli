const axios = require('../utils/axios');
const LRU = require('lru-cache');

class ResourceSendData {
    token;
    cache;
    environment;
    countCall;

    constructor (token, environment) {
        this.token = token;
        this.environment = environment;
        this.cache = new LRU();
        this.countCall = 0;
    }

    async sendDataPost (route, data, strictMode = true, firstCall = true) {
        //console.log(data)
        if (this.cache.get(route) !== undefined) {
            return this.cache.get(route);
        }
        if (this.cache.get(data) !== undefined) {
            return this.cache.get(data);
        }
        this.countCall++;
        return new Promise((resolve, reject) => {
            console.log(data);
            console.log('totototo');
            axios.post(`${this.environment}${route}`, data, {
                headers: {
                    'authorization': this.token,
                    'Content-Type': 'application/ld+json'
                }
            })
                .then(response => {
                    this.cache.set(route, response.data);
                    resolve(response.data);
                })
                .catch(async (error) => {
                    console.log(`POST ${this.environment + route} : ${error.message}`);
                    this.cache.set(route, null);
                    if (strictMode) {
                        process.exit(1);
                    }
                    reject(null);
                });
        });
    }

    async sendDataPut (route, data, strictMode = true, firstCall = true) {
        //console.log(data)
        if (this.cache.get(route) !== undefined) {
            return this.cache.get(route);
        }
        if (this.cache.get(data) !== undefined) {
            return this.cache.get(data);
        }
        this.countCall++;
        return new Promise((resolve, reject) => {

            axios.put(`${this.environment}${route}`, data, {
                headers: {
                    'authorization': this.token,
                    'Content-Type': 'application/ld+json'
                }
            })
                .then(response => {
                    this.cache.set(route, response.data);
                    resolve(response.data);
                })
                .catch(async (error) => {
                    console.log(`PUT ${this.environment + route} : ${error.message}`);
                    this.cache.set(route, null);
                    if (strictMode) {
                        process.exit(1);
                    }
                    reject(null);
                });
        });
    }
}

module.exports = ResourceSendData;
