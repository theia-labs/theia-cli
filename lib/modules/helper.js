const os = require("os");

const help = () => {
    const {modules} = require('./modules')
    const maxLength = Object.values(modules).reduce((acc, curr) => {
        if (curr.command.length > acc) {
            return curr.command.length
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

${Object.values(modules).map(module => (`${module.command}: ${' '.repeat(maxLength - module.command.length)}${module.description}`)).join(os.EOL)}
`
    console.log(helpText)
}

module.exports = {help}
