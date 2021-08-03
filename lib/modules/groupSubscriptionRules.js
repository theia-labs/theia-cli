const inquirer = require('inquirer');
const {Observable, from} = require('rxjs');
const ResourceFinder = require('../api/resourceFinder');
const ResourceSendData = require('../api/resourceSendData');
const ResourceRemover = require('../api/resourceRemover');
const exporter = require('../utils/exporter');
inquirer.registerPrompt('date', require('inquirer-date-prompt'));
const operatorWithoutValues = ['isnull', 'isnotnull'];

class GroupSubscriptionRules {
    resourceFinder;
    resourceSendData;
    resourceRemover;
    exportPath;
    importFile;

    constructor (resourceFinder, resourceSendData, resourceRemover, {exportPath, importFile}) {
        this.resourceFinder = resourceFinder;
        this.resourceSendData = resourceSendData;
        this.resourceRemover = resourceRemover;
        this.exportPath = exportPath;
        this.importFile = importFile;
    }

    async getGroupSubscriptionRules ({groupIds, page}) {

        let groupRules = await this.resourceFinder.fetchGroupSubscriptionRules(groupIds, page);
        let resourceId = 'gr' + groupIds.replace(',', 'gr') + '-p' + page;
        let data = JSON.stringify(groupRules, null, 2);
        console.log(data);
        if (this.exportPath) {
            exporter.exportFile(
                this.exportPath,
                exporter.EXPORT_TYPES.groupSubscriptionRules,
                exporter.FORMATS.json,
                data,
                resourceId
            );
        }
    }

    async createGroupSubscriptionRule () {

        let answers = await inquirer.prompt([{
            type: 'number',
            name: 'groupId',
            message: 'For witch group do you want creating rules ?'
        }]);
        let groupRules = {};
        if (answers.groupId > 0) {
            let group = this.resourceFinder.fetchGroup(answers.groupId);
            if (group) {
                groupRules.group = '/api/groups/' + answers.groupId;
                groupRules.rules = await this.createRules();
            } else {
                console.log('no group with this Id');
            }
        }
        console.log(JSON.stringify(groupRules));
        let createdGroupRule = await this.resourceSendData.postResourceDate('/api/group_subscription_rules', JSON.stringify(groupRules));
        console.log(createdGroupRule);

    }

    async editGroupSubscriptionRule () {
        let groupAnswer = await inquirer.prompt([{
            type: 'number',
            name: 'groupId',
            message: 'For witch group do you want edit subscription rules ?'
        }]);
        let groupId =groupAnswer.groupId
        console.log(JSON.stringify(await this.resourceFinder.fetchGroupSubscriptionRules(groupId.toString()), null, 2));
        let answers = await inquirer.prompt([{
            type: 'number',
            name: 'groupRulesId',
            message: 'Witch group  subscription rules do you want edit ?(only the number of Id)'
        }]);
        let groupRulesId=answers.groupRulesId
        let groupRules = await this.resourceFinder.fetchSubscriptionGroupRules(groupRulesId);
        console.log(groupRules)
        if (groupRules) {
            let actualRules = groupRules.rules;
            let newGroupRules={};
            newGroupRules.rules = await this.createRules(actualRules);
            let groupNewRules = await this.resourceSendData.putResourceDate('/api/group_subscription_rules/' + groupRulesId, JSON.stringify(newGroupRules));
            console.log(groupNewRules)
        }


    }

    async getSubscriptionGroupRules ({groupRuleId}) {
        let groupRules = await this.resourceFinder.fetchSubscriptionGroupRules(groupRuleId);
        let data = JSON.stringify(groupRules, null, 2);
        console.log(data);
        if (this.exportPath) {
            exporter.exportFile(
                this.exportPath,
                exporter.EXPORT_TYPES.groupSubscriptionRules,
                exporter.FORMATS.json,
                data,
                groupRuleId
            );
        }
    }

    async deleteSubscriptionGroupRule ({groupRuleId}) {
        let success = await this.resourceRemover.deleteResource('/api/group_subscription_rules/' + groupRuleId);
    }

    async createRules (actualRules = null) {

        let rules = [];
        let questions = [
            {
                type: 'confirm',
                name: 'useLoginType',
                message: 'Do you want to select login type',
                default: false
            },
            {
                type: 'list',
                choices: [{name: 'Local', value: 1}, {name: 'CSA', value: 2}],
                name: 'loginType',
                message: 'Login type choice',
                when (answers) {
                    return answers.useLoginType;
                },
                default () {
                    return (defaultRuleValues('loginType', actualRules)) ? parseInt(defaultRuleValues('loginType', actualRules).value) : 1;
                }
            },
            {
                type: 'confirm',
                name: 'useExternalId',
                message: 'ExternalId/matricule',
                default: false
            },
            {
                type: 'list',
                choices: ['like', 'beginwith', 'isnull', 'isnotnull'],
                name: 'externalIdOperator',
                message: 'Operator',
                default () {
                    return (defaultRuleValues('externalId', actualRules)) ? defaultRuleValues('externalId', actualRules).operator : 'like';
                },
                when (answers) {
                    return answers.useExternalId;
                }
            },
            {
                type: 'input',
                name: 'externalId',
                message: 'valeur/value',
                when (answers) {
                    return answers.useExternalId && !operatorWithoutValues.includes(answers.operator);
                },
                default () {
                    return (defaultRuleValues('externalId', actualRules) && defaultRuleValues('externalId', actualRules).value) ? defaultRuleValues('externalId', actualRules).value : '';
                },
                validate(value) {
                    return (value!=='')? true: 'Please enter a value'
                }
            },
            {
                type: 'confirm',
                name: 'useCreatedAt',
                message: 'Do you want to use created date',
                default: false
            },
            {
                type: 'list',
                name: 'createAtOperator',
                choices: [{name: 'Superior', value: 'sup'}, {name: 'Inferior', value: 'inf'}],
                message: 'Operator',
                when (answers) {
                    return answers.useCreatedAt;
                }
            },
            {
                type: 'date',
                name: 'createdAt',
                message: 'Date',
                when (answers) {
                    return answers.useCreatedAt;
                },
                default () {
                    return (defaultRuleValues('createdAt', actualRules)) ? parseInt(defaultRuleValues('createdAt', actualRules).value) : new Date();
                }
                
            },
            {
                type: 'confirm',
                name: 'useLastLoginId',
                message: 'Do you want to use connexion',
                default: false
            },
            {
                type: 'list',
                name: 'hasConnectOperator',
                choices: [{name: 'Yes', value: 'isnotnull'}, {name: 'No', value: 'isnull'}],
                message: 'did he connect',
                when (answers) {
                    return answers.useLastLoginId;
                }
            },
        ];
        let customAttributes = await this.resourceFinder.fetchCollection('/api/custom_user_attributes');
        let customAttributesIds = [];
        customAttributes.forEach((attribute) => {
            let attributeId = parseInt(attribute['@id'].replace('/api/custom_user_attributes/', ''));
            customAttributesIds.push(attributeId);
            questions.push({
                    type: 'confirm',
                    name: 'use' + attributeId,
                    message: 'do you want to use ' + attribute.name,
                    default: false
                },
                {
                    type: 'list',
                    choices: ['equal', 'notequal', 'like', 'notlike', 'beginwith', 'notbeginwith', 'sup', 'inf', 'isnull', 'isnotnull'],
                    name: 'operator' + attributeId,
                    message: 'Operator',
                    when (answers) {
                        return answers['use' + attributeId];
                    }
                },
                {
                    type: 'input',
                    name: 'customAttributeValue' + attributeId,
                    message: 'valeur/value',
                    when (answers) {
                        return answers['use' + attributeId] && !operatorWithoutValues.includes(answers['operator' + attributeId]);
                    },
                    default () {
                        return (defaultRuleValues(attributeId, actualRules)) ? parseInt(defaultRuleValues('createdAt', actualRules).value) : '';
                    },
                    validate(value) {
                        return (value!=='')? true: 'Please enter a value'
                    }
                });

        });
        let answers = await inquirer.prompt(questions);
        if (answers.useLoginType && answers.loginType) {
            rules.push(createRule('field', 'equal', 'loginType', null, answers.loginType));
        }
        if (answers.useExternalId) {
            if (operatorWithoutValues.includes(answers.externalIdOperator)) {
                rules.push(createRule('field', answers.externalIdOperator, 'externalId'));
            } else if (answers.externalId) {
                rules.push(createRule('field', answers.externalIdOperator, 'externalId', null, answers.externalId));
            }
        }
        if (answers.useCreatedAt) {
            rules.push(createRule('field', answers.createAtOperator, 'createdAt', null, answers.createdAt));
        }
        if (answers.useLastLoginId && answers.hasConnectOperator) {
            rules.push(createRule('field', answers.hasConnectOperator, 'lastLoginId'));
        }
        customAttributesIds.forEach((attributeId) => {
            if (answers['use' + attributeId]) {
                rules.push(createRule('custom_attribute', answers['operator' + attributeId], null, attributeId, (answers['customAttributeValue' + attributeId]) ? answers['customAttributeValue' + attributeId] : null
                ));
            }
        });
        return rules;

    }

}

function createRule (type, operator, name = null, customAttributeId = null, value = null) {

    rule = {
        type: type,
        operator: operator,
    };
    if (name) {
        rule.name = name;
    }
    if (customAttributeId) {
        rule.attributeId = customAttributeId;
    }
    if (!operatorWithoutValues.includes(operator) && value != null) {
        rule.value = value;
    }
    return rule;
}

function defaultRuleValues (rule, actualRules) {
    if (actualRules) {
        actualRule = actualRules.filter(obj => {
            return (obj.type === 'field') ? obj.name === rule : obj.attibuteId === rule;
        });
        return (actualRule.length > 0) ? actualRule.shift() : false;
    } else {
        return false;
    }

}

function checkRuleExists (actualRules, rule) {
    if (actualRules) {
        const checkRule = obj => (obj.type === 'field') ? (obj.name === rule) : (obj.attributeId === rule);
        return actualRules.some(checkRule);
    }
    return false;
}

module.exports = {GroupSubscriptionRules};
