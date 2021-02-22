const inquire = require('inquirer')
const arg = require('arg')
const auth = require('./api/auth')
const scoreCalculator = require('./modules/scoreCalculator')
const dotenv = require("dotenv")

function parseArgumentsIntoOptions() {
    const args = arg(
        {
            '--password': String,
            '--key': String,
            '--env': String,
            '--exam': Number,

            '-p': '--password',
            '-k': '--key',
            '-e': '--exam',
        }
    )

    return {
        password: args['--password'] || false,
        key: args['--key'] || false,
        environment: args['--env'] || false,
        examId: args['--exam'] || false
    }
}

async function promptForMissingOptions(options) {
    const questions = [];

    if (!options.key) {
        questions.push({
            type: 'input',
            name: 'key',
            message: 'Api key: '
        })
    }

    if (!options.password) {
        questions.push({
            type: 'password',
            name: 'password',
            message: 'Password: '
        })
    }

    if (!options.environment) {
        questions.push({
            type: 'list',
            name: 'environment',
            message: 'Environment: ',
            choices: ['https://elffe.theia.fr', 'https://side-sante.fr']
        })
    }

    if (!options.examId) {
        questions.push({
            type: 'number',
            name: 'examId',
            message: 'Exam ID: '
        })
    }

    const answers = await inquire.prompt(questions);

    return {
        ...options,
        ...answers
    };
}

async function cli() {
    dotenv.config()
    let options = parseArgumentsIntoOptions();
    options = await promptForMissingOptions(options);

    options.token = await auth.auth(options)
        .catch(error => console.log(error.message))

    if (options.token === undefined) {
        console.log('Can\'t authenticate.')
        return
    }

    if (process.argv[2] === 'auth') {
        console.log(options.token)
        return
    }

    await scoreCalculator.calculateAndExportScore(options)

}

module.exports = {cli}
