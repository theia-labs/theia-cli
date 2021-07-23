const axios = require("../utils/axios")
const LRU = require('lru-cache')

class ResourceRemover {
    token;
    cache;
    environment;
    countCall;

    constructor(token, environment) {
        this.token = token;
        this.environment = environment;
        this.cache = new LRU();
        this.countCall = 0;
    }

    async deleteResource (route, strictMode = true, firstCall = true) {
        if (this.cache.get(route) !== undefined) {
            return this.cache.get(route)
        }

        this.countCall++
        return new Promise((resolve, reject) => {
            axios.delete(`${this.environment}${route}`, {
                headers: {
                    'authorization': this.token
                }
            })
                .then(response => {
                    this.cache.set(route, response.status)
                    resolve(response.status)
                })
                .catch(async (error) => {
                    console.log(`Delete ${this.environment + route} : ${error.message}`)
                    if (firstCall) {
                        // wait 1s before retry API call
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        return await this.deleteResource(route, strictMode, false)
                            .then(res => resolve(res))
                            .catch(err => reject(err))
                    }
                    this.cache.set(route, null)
                    if (strictMode) {
                        process.exit(1)
                    }
                    reject(null);
                })
        })
    }



}

module.exports = ResourceRemover
