const axios = require('axios')

function FetchException(message, resource) {
    this.message = message;
    this.name = 'FetchException';
    this.resource = resource
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

    this.fetchExam = async function (examId) {
        return this.fetchResource(`/api/exams/${examId}`)
    }

    this.fetchParticipantsResults = async function (examId) {
        return this.fetchResource(`/api/exams/${examId}/participants_results`)
    }

    this.fetchExamQuestionnaire = async function (examId) {
        return this.fetchResource(`/api/exams/${examId}/questionnaire`)
    }

    this.fetchExamParticipants = async function (examId) {
        return this.fetchResource(`/api/exams/${examId}/participants`)
    }
}


module.exports = ResourceFinder
