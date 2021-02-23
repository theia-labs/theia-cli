const scoreCalculator = require('./scoreCalculator')
const authenticator = require('./authenticator')
const helper = require('./helper')

const authArguments = ['key', 'password', 'environment']

const modules = {
    "auth": {
        command: "auth",
        name: "authenticator",
        arguments: [...authArguments],
        description: "Authenticate to lama API to retrieve Token",
        method: authenticator.auth,
        auth: true
    },
    "calculate-score": {
        command: "calculate-score",
        name: "scoreCalculator",
        arguments: [...authArguments, 'examId'],
        description: "Calculate score of exam",
        method: scoreCalculator.calculateAndExportScore,
        auth: true
    },
    "help": {
        command: "help",
        name: "help",
        arguments: [],
        description: "Display theia-cli help",
        method: helper.help,
        auth: false
    }
}

const arguments = {
    examId: {
        type: 'number',
        name: 'examId',
        message: 'Exam ID: '
    },
    environment: {
        type: 'list',
        name: 'environment',
        message: 'Environment: ',
        choices: ['https://elffe.theia.fr', 'https://side-sante.fr']
    },
    password: {
        type: 'password',
        name: 'password',
        message: 'Password: '
    },
    key: {
        type: 'input',
        name: 'key',
        message: 'Api key: '
    }
}

module.exports = {modules, arguments}
