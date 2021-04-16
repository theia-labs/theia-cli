const {ScoreCalculator} = require('./modules/scoreCalculator')
const authenticator = require('./modules/authenticator')
const helper = require('./modules/helper')
const configurator = require('./modules/configurator')

const authArguments = ['key', 'password', 'environment']

const modules = {
    "auth": {
        arguments: [...authArguments],
        description: "Authenticate to lama API to retrieve Token",
        method: authenticator.auth,
        auth: false
    },
    "calculate-score": {
        arguments: [...authArguments, 'examId', 'ratingScale', 'exportPath'],
        description: "Calculate score of exam",
        method: (options, resourceFinder) => (new ScoreCalculator(resourceFinder, options)).calculateAndExportScore(options),
        auth: true
    },
    "calculate-multiple-scores": {
        arguments: [...authArguments, 'ratingScale', 'exportPath'],
        description: "Calculate score for all exams",
        method: (options, resourceFinder) => (new ScoreCalculator(resourceFinder, options)).calculateAndExportScoreForMultipleExams(options),
        auth: true
    },
    "help": {
        arguments: [],
        description: "Display theia-cli help",
        method: helper.help,
        auth: false
    },
    "config": {
        arguments: [],
        description: "Configure CLI parameters",
        method: configurator.configure,
        auth: false
    },
    "reset-config": {
        arguments: [],
        description: "Reset configuration parameters",
        method: configurator.resetConfig,
        auth: false
    }
}

const arguments = {
    examId: {
        type: 'number',
        name: 'examId',
        message: 'Exam ID: '
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

const options = {
    password: {
        type: String,
        label: '--password',
        alias: '-p',
        description: 'User password'
    },
    key: {
        type: String,
        label: '--key',
        alias: '-k',
        description: 'User API key'
    },
    environment: {
        type: String,
        label: '--env',
        description: 'The URL of your environment'
    },
    examId: {
        type: Number,
        label: '--exam',
        alias: '-e',
        description: 'Exam ID'
    },
    exportPath: {
        type: String,
        label: '--exportPath',
        description: 'The absolute path of the folder where you want to save the files exported by the CLI'
    },
    ratingScale: {
        type: Number,
        label: '--ratingScale',
        description: 'The rating scale you want to use when exporting scores'
    }
}

module.exports = {modules, arguments, options}

