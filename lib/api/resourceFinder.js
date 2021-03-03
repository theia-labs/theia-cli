const axios = require('axios')

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
    this.token = token;
    this.environment = environment;

    this.fetchResource = async function (route) {
        return new Promise((resolve, reject) => {
            axios.get(`${this.environment}${route}`, {
                headers: {
                    'authorization': token
                }
            })
                .then(response => resolve(response.data))
                .catch(error => {
                    console.log(error.message)
                    setTimeout(() => {throw new FetchException(error.message, route)});
                    reject(error)
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

                const nextPage = res['hydra:view']['hydra:next']
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

    this.fetchParticipantsResults = async function (examId) {
        return this.fetchCollection(`/api/exams/${examId}/participants_results`)
    }

    this.fetchExamQuestionnaire = async function (examId) {
        return this.fetchResource(`/api/exams/${examId}/questionnaire`)
    }

    this.fetchExamParticipants = async function (examId) {
        return this.fetchCollection(`/api/exams/${examId}/participants`)
    }
}


module.exports = ResourceFinder
