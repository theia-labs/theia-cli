const { ScoreCalculator } = require('./modules/scoreCalculator');
const authenticator = require('./modules/authenticator');
const helper = require('./modules/helper');
const configurator = require('./modules/configurator');
const { UserAttributes } = require('./modules/userAttributes');
const { GroupSubscriptionRules } = require('./modules/groupSubscriptionRules');

const authArguments = ['key', 'password', 'environment'];

const modules = {
    auth: {
        arguments: [...authArguments],
        description: 'Authenticate to lama API to retrieve Token',
        method: authenticator.auth,
        auth: false,
    },
    'calculate-score': {
        arguments: [...authArguments, 'examId', 'ratingScale', 'exportPath'],
        description: 'Calculate score of exam',
        method: (options, resourceFinder) =>
            new ScoreCalculator(resourceFinder, options).calculateAndExportScore(
                options
            ),
        auth: true,
    },
    'calculate-multiple-scores': {
        arguments: [...authArguments, 'ratingScale', 'exportPath'],
        description: 'Calculate score for all exams',
        method: (options, resourceFinder) =>
            new ScoreCalculator(
                resourceFinder,
                options
            ).calculateAndExportScoreForMultipleExams(options),
        auth: true,
    },
    help: {
        arguments: [],
        description: 'Display theia-cli help',
        method: helper.help,
        auth: false,
    },
    config: {
        arguments: [],
        description: 'Configure CLI parameters',
        method: configurator.configure,
        auth: false,
    },
    'reset-config': {
        arguments: [],
        description: 'Reset configuration parameters',
        method: configurator.resetConfig,
        auth: false,
    },
    'get-custom-user-attributes': {
        arguments: [...authArguments],
        description: 'Return platform custom user attribute.',
        method: (options, resourceFinder) =>
            new UserAttributes(resourceFinder).getCustomUserAttributes(options),
        auth: true,
    },
    'get-group-subscription-rules': {
        arguments: [...authArguments, 'groupIds', 'page'],
        description: 'return all groups affiliate rules',
        method: (options, resourceFinder, resourceSendData, resourceRemover) =>
            new GroupSubscriptionRules(resourceFinder, resourceSendData, resourceRemover, options).getGroupSubscriptionRules(
                options
            ),
        auth: true,
    },
    'create-group-subscription-rules': {
        arguments: [...authArguments],
        description: 'create groups subscription rules',
        method: (options, resourceFinder, resourceSendData, resourceRemover) =>
            new GroupSubscriptionRules(resourceFinder, resourceSendData, resourceRemover, options).createGroupSubscriptionRule(
                options
            ),
        auth: true,
    },
    'edit-group-subscription-rules': {
        arguments: [...authArguments],
        description: 'return all groups affiliate rules',
        method: (options, resourceFinder, resourceSendData, resourceRemover) =>
            new GroupSubscriptionRules(resourceFinder, resourceSendData, resourceRemover, options).editGroupSubscriptionRule(
                options
            ),
        auth: true,
    },
    'get-subscription-group-rule': {
        arguments: [...authArguments, 'groupRuleId'],
        description: 'return a group rule',
        method: (options, resourceFinder, resourceSendData, resourceRemover) =>
            new GroupSubscriptionRules(resourceFinder, resourceSendData, resourceRemover, options).getSubscriptionGroupRules(
                options
            ),
        auth: true,
    },
    'delete-subscription-group-rule': {
        arguments: [...authArguments, 'groupRuleId'],
        description: 'return a group rule',
        method: (options, resourceFinder, resourceSendData, resourceRemover) =>
            new GroupSubscriptionRules(resourceFinder, resourceSendData, resourceRemover, options).deleteSubscriptionGroupRule(
                options
            ),
        auth: true,
    },
};

/**
 * Use by Inquire
 */
const arguments = {
    examId: {
        type: 'number',
        name: 'examId',
        message: 'Exam ID: ',
    },
    password: {
        type: 'password',
        name: 'password',
        message: 'Password: ',
    },
    key: {
        type: 'input',
        name: 'key',
        message: 'Api key: ',
    },
    groupIds: {
        type: 'input',
        name: 'groupIds',
        message: 'group Ids (separate by coma)'
    },
    page: {
        type: 'number',
        default: 1,
        name: 'page',
        message: 'Page'
    },
    groupRuleId: {
        type: 'number',
        name: 'groupRuleId',
        message: 'Group rule Id'
    },
    groupRules: {
        type: 'input',
        name: 'groupRules',
        message: 'group and Rules (Json format)'
    },
    rules: {
        type: 'input',
        name: 'rules',
        message: 'Rules (Json format)'
    }
};

/**
 * Use by args
 */
const options = {
    password: {
        type: String,
        label: '--password',
        alias: '-p',
        description: 'User password',
    },
    key: {
        type: String,
        label: '--key',
        alias: '-k',
        description: 'User API key',
    },
    environment: {
        type: String,
        label: '--env',
        description: 'The URL of your environment',
    },
    examId: {
        type: Number,
        label: '--exam',
        alias: '-e',
        description: 'Exam ID',
    },
    exportPath: {
        type: String,
        label: '--exportPath',
        description:
            'The absolute path of the folder where you want to save the files exported by the CLI',
    },
    ratingScale: {
        type: Number,
        label: '--ratingScale',
        description: 'The rating scale you want to use when exporting scores',
    },
    importFile: {
        type: String,
        label: '--importFile',
        description:
            'The absolute path of the file',
    }
};

module.exports = { modules, arguments, options };
