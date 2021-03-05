const inquire = require('inquirer')
const arg = require('arg')
const auth = require('./api/auth')
const dotenv = require("dotenv")
const modules = require("./modules/modules")

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

async function promptForMissingArguments(options, requireOptions) {
    const questions = [];

    requireOptions.forEach(option => {
        if (!options[option]) {
            questions.push(modules.arguments[option])
        }
    })

    const answers = await inquire.prompt(questions);

    return {
        ...options,
        ...answers
    };
}

async function cli() {
    dotenv.config()
    let options = parseArgumentsIntoOptions();

    const command = process.argv[2];
    if (command === undefined || !modules.modules.hasOwnProperty(command)) {
        modules.modules.help.method()
        process.exit(0)
    }

    const runningModule = modules.modules[command];

    options = await promptForMissingArguments(options, runningModule.arguments);

    if (runningModule.auth) {
        options.token = await auth.auth(options)
            .catch(error => console.log(error.message))

        if (options.token === undefined) {
            console.log('Can\'t authenticate.')
            return
        }
    }

    runningModule.method(options)
}

module.exports = {cli}
