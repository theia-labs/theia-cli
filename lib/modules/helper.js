const os = require("os");

const help = () => {
    const {modules} = require('../cliConf')
    const maxLength = Object.keys(modules).reduce((acc, command) => {
        if (command.length > acc) {
            return command.length
        } else {
            return acc
        }
    }, 0)
    const helpText =
`
theia-cli helps you to retrieve data in theia API.

usage:
    theia-cli <command>

commands can be:

${Object.entries(modules).map(([command, mod]) => (
    `    ${command}: ${' '.repeat(maxLength - command.length)}${mod.description}`)
).join(os.EOL)}

Run 'theia-cli <command> help' for more information on a command.
`
    console.log(helpText)
}

const commandHelp = (commandName) => {
    const {modules, options} = require('../cliConf')
    const command = modules[commandName];
    if (command === undefined) {
        console.log(`Commmand ${commandName} not found`)
        return;
    }

    const commandOptions = command.arguments.map(argName => options[argName]);
    const maxLength = commandOptions.reduce((acc, option) => {
        if (option.label.length > acc) {
            return option.label.length
        } else {
            return acc
        }
    }, 0)
    const helpText =
`
Usage: theia-cli ${commandName} [OPTIONS]

${command.description}

Options:
${commandOptions.map(option => (
        `    ${option.hasOwnProperty('alias') ? option.alias + ',' : '   '} ${option.label}${' '.repeat(maxLength - option.label.length)}  ${option.description}`
    )
).join(os.EOL)}
`

    console.log(helpText)
}

module.exports = {help, commandHelp}
