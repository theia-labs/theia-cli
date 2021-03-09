const axios = require("../utils/axios")
const LRU = require('lru-cache')

class ResourceFinder {
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

    async fetchResource (route, strictMode = true) {
        if (this.cache.get(route) !== undefined) {
            return this.cache.get(route)
        }

        this.countCall++
        return new Promise((resolve, reject) => {
            axios.get(`${this.environment}${route}`, {
                headers: {
                    'authorization': this.token
                }
            })
                .then(response => {
                    this.cache.set(route, response.data)
                    resolve(response.data)
                })
                .catch(error => {
                    this.cache.set(route, null)
                    console.log(`GET ${this.environment + route} : ${error.message}`)
                    if (strictMode) {
                        process.exit(1)
                    }
                    reject(null);
                })
        })
    }

     async fetchCollection (route) {
        const data = []
        await this.fetchResource(route)
            .then(async (res) => {
                if (res['@type'] !== 'hydra:Collection') {
                    throw new NotCollectionException(route)
                }

                data.push(...res['hydra:member'])

                const nextPage = res['hydra:view'] ? res['hydra:view']['hydra:next'] : undefined;
                if (nextPage !== undefined) {
                    data.push(...await this.fetchCollection(nextPage))
                }
                return res
            })
            .catch()

        return data
    }

    async fetchExam (examId) {
        return this.fetchResource(`/api/exams/${examId}`)
    }

    async fetchAllExams () {
        return this.fetchCollection('/api/exams')
    }

    async fetchParticipantsResults (examId) {
        return this.fetchCollection(`${examId}/participants_results`)
    }

    async fetchExamQuestionnaire (examId) {
        return this.fetchResource(`/api/exams/${examId}/questionnaire`)
    }

    async fetchExamParticipants (examId) {
        return this.fetchCollection(`${examId}/participants`)
    }
}

function NotCollectionException(route) {
    this.message = 'Fetch resource isn\'t collection';
    this.name = 'NotCollectionException';
    this.route = route;
}

module.exports = ResourceFinder
