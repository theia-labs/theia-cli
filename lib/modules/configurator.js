const Conf = require('conf');
const inquire = require('inquirer');
const config = new Conf();

const configurableValues = ['key', 'environment', 'exportPath', 'ratingScale'];

const configure = (options) => {
    if (Object.entries(options).filter(([option, value]) => value !== false && configurableValues.indexOf(option) !== -1).length === 0) {
        configurableValues.forEach(value => {
            if (config.get(value, false) !== false) {
                console.log(`${value} : ${config.get(value)}`)
            }
        })
    }
    configurableValues.forEach(value => {
        if (options[value] !== false) {
            console.log(value)
            console.log(options[value])
            config.set(value, options[value]);
        }
    })
}

const resetConfig = () => {
    const configuredValues = configurableValues.filter(value => config.get(value, false) !== false);
    if (configuredValues.length > 0) {
        inquire.prompt([
            {
                type: 'checkbox',
                name: 'resetValues',
                message: 'Values to be reset: ',
                choices: configuredValues.map(name => ({name}))
            }
        ])
            .then(response => {
                response.resetValues.forEach(value => {
                    config.delete(value)
                })
            })
    }
}

const getConfiguredValues = () => {
    const configuredValues = {}
    configurableValues.filter(value => config.get(value, false) !== false).forEach(value => {
        configuredValues[value] = config.get(value)
    })
    return configuredValues
}

module.exports = {configure, resetConfig, getConfiguredValues}
