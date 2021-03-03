const os = require("os");

const help = () => {
    const {modules} = require('./modules')
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
`
    console.log(helpText)
}

module.exports = {help}
