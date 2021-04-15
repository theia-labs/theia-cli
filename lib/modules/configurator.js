const Conf = require('conf');
const inquire = require('inquirer');
const config = new Conf();

const configurableParameters = {
    key: {
        type: "string",
        name: "key",
        message: "Api key (persistent): "
    },
    environment: {
        type: "list",
        name: "environment",
        message: "Environment (persistent): ",
        choices: ["https://elffe.theia.fr", "https://side-sante.fr"]
    },
    exportPath: {
        type: "string",
        name: "exportPath",
        message: "Export file path (persistent): "
    },
    ratingScale: {
        type: "number",
        name: "ratingScale",
        message: "Rating scale (persistent): "
    }
};

const configure = async (options) => {
    const configurableParametersNames = Object.keys(configurableParameters);
    if (Object.entries(options).filter(([option, value]) => value !== false && configurableParametersNames.indexOf(option) !== -1).length === 0) {
        const configuredParameters = configurableParametersNames.filter(parameter => config.get(parameter, false) !== false)
        configuredParameters.forEach(parameter => {
            console.log(`${parameter} : ${config.get(parameter)}`)
        })
        if (configuredParameters.length < configurableParametersNames.length) {
            await inquire.prompt([
                {
                    type: 'confirm',
                    name: 'configure',
                    message: 'do you want to configure the missing parameters ?'
                }
            ])
                .then(async (response) => {
                    if (response.configure) {
                        await configureMissingParameters(configurableParametersNames)
                    }
                })
        }
    }
    configurableParametersNames.forEach(parameter => {
        if (options.hasOwnProperty(parameter)) {
            config.set(parameter, options[parameter]);
        }
    })
}

const resetConfig = () => {
    const configuredParameters = Object.keys(configurableParameters).filter(parameter => config.get(parameter, false) !== false);
    if (configuredParameters.length > 0) {
        inquire.prompt([
            {
                type: 'checkbox',
                name: 'resetParameters',
                message: 'Parameters to be reset: ',
                choices: configuredParameters.map(name => ({name}))
            }
        ])
            .then(response => {
                response.resetParameters.forEach(parameter => {
                    config.delete(parameter)
                })
            })
    }
}

const getConfiguredParameters = () => {
    const configuredParameters = {}
    Object.keys(configurableParameters).filter(parameter => config.get(parameter, false) !== false).forEach(parameter => {
        configuredParameters[parameter] = config.get(parameter)
    })
    return configuredParameters
}

const configureMissingParameters = async (missingRequireArguments) => {
    const notConfiguredParameters = Object.entries(configurableParameters).filter(([parameter,]) => config.get(parameter, false) === false && missingRequireArguments.indexOf(parameter) !== -1);
    await inquire.prompt(notConfiguredParameters.map(([, inquireSettings]) => inquireSettings))
        .then(response => config.set(response))
}

module.exports = {configure, resetConfig, getConfiguredParameters, configureMissingParameters}
