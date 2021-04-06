const inquire = require('inquirer')
const arg = require('arg')
const auth = require('./api/auth')
const {getConfiguredParameters, configureMissingParameters} = require("./modules/configurator")
const cliConf = require("./cliConf")
const ResourceFinder = require("./api/resourceFinder")

function parseArgumentsIntoOptions() {
    const options = {};
    Object.values(cliConf.options).forEach(option => {
        options[option.label] = option.type;
        if (option.aliases !== undefined) {
            option.aliases.map(alias => {
                options[alias] = option.label;
            })
        }
    })

    const args = arg(options);

    const parsedArguments = {};
    Object.entries(cliConf.options).forEach(([key, option]) => {
        if (args[option.label] !== undefined) {
            parsedArguments[key] = args[option.label];
        }
    })

    return parsedArguments;
}

async function promptForMissingArguments(options, requireOptions) {
    const questions = [];

    requireOptions.forEach(option => {
        if (options[option] === undefined) {
            questions.push(cliConf.arguments[option])
        }
    })

    const answers = await inquire.prompt(questions);

    return {
        ...options,
        ...answers
    };
}

async function cli() {
    let options = parseArgumentsIntoOptions();

    const command = process.argv[2];
    if (command === undefined || !cliConf.modules.hasOwnProperty(command)) {
        cliConf.modules.help.method()
        process.exit(0)
    }

    const runningModule = cliConf.modules[command];

    if (command === "config") {
        await runningModule.method(options)
        process.exit(0)
    }

    options = {
        ...getConfiguredParameters(),
        ...options
    }

    await configureMissingParameters(runningModule.arguments.filter(argument => {
        return Object.entries(options).indexOf(argument) === -1
    }))

    options = {
        ...getConfiguredParameters(),
        ...options
    }

    options = await promptForMissingArguments(options, runningModule.arguments);

    if (runningModule.auth) {
        options.token = await auth.auth(options)
            .catch(error => console.log(error.message))

        if (options.token === undefined) {
            console.log('Can\'t authenticate.')
            return
        }

        const resourceFinder = new ResourceFinder(options.token, options.environment);
        runningModule.method(options, resourceFinder)
            .then(() => console.log(`Number of calls to the api: ${resourceFinder.countCall}`))
    } else {
        runningModule.method(options)
    }
}

module.exports = {cli}
