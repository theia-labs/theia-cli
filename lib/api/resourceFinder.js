const axios = require("../utils/axios")
const LRU = require('lru-cache')

function FetchException(message, resource) {
    this.message = message;
    this.name = 'FetchException';
    this.resource = resource
}

function NotCollectionException(route) {
    this.message = 'Fetch resource isn\'t collection';
    this.name = 'NotCollectionException';
    this.route = route;
}

function ResourceFinder(token, environment) {
    this.cache = new LRU()
    this.token = token;
    this.environment = environment;
    this.countCall = 0;

    this.fetchResource = async function (route, strictMode = true) {
        if (this.cache.get(route) !== undefined) {
            return this.cache.get(route)
        }

        this.countCall++
        return new Promise((resolve, reject) => {
            axios.get(`${this.environment}${route}`, {
                headers: {
                    'authorization': token
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

    this.fetchCollection = async function (route) {
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

    this.fetchExam = async function (examId) {
        return this.fetchResource(`/api/exams/${examId}`)
    }

    this.fetchAllExams = async function () {
        return this.fetchCollection('/api/exams')
    }

    this.fetchParticipantsResults = async function (examId) {
        return this.fetchCollection(`${examId}/participants_results`)
    }

    this.fetchExamQuestionnaire = async function (examId) {
        return this.fetchResource(`/api/exams/${examId}/questionnaire`)
    }

    this.fetchExamParticipants = async function (examId) {
        return this.fetchCollection(`${examId}/participants`)
    }
}


module.exports = ResourceFinder
