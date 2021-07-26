const ResourceFinder = require('../api/resourceFinder')
const ResourceSendData = require('../api/resourceSendData')
const ResourceRemover = require('../api/resourceRemover')
const exporter = require('../utils/exporter')

class GroupSubscriptionRules {
    resourceFinder
    resourceSendData
    resourceRemover
    exportPath
    importFile

    constructor (resourceFinder, resourceSendData, resourceRemover, { exportPath, importFile }) {
        this.resourceFinder = resourceFinder
        this.resourceSendData = resourceSendData
        this.resourceRemover = resourceRemover
        this.exportPath = exportPath
        this.importFile = importFile
    }

    async getGroupSubscriptionRules ({ groupIds, page }) {

        let route = '/api/group_subscription_rules?group[]=' + groupIds.replace(',', '&group[]=') + '&page=' + page
        let resourceId = 'gr' + groupIds.replace(',', 'gr') + '-p' + page
        let groupRules = await this.resourceFinder.fetchCollection(route)
        let data = JSON.stringify(groupRules, null, 2)
        console.log(data)
        if (this.exportPath) {
            exporter.exportFile(
                this.exportPath,
                exporter.EXPORT_TYPES.groupSubscriptionRules,
                exporter.FORMATS.json,
                data,
                resourceId
            )
        }
    }

    async createGroupSubscriptionRule ({ groupRules }) {
        let groupRule = await this.resourceSendData.sendDataPost('/api/group_subscription_rules', groupRules)
        console.log(groupRule)

    }

    async editGroupSubscriptionRule ({ groupRuleId, rules }) {
        let groupRule = await this.resourceSendData.sendDataPut('/api/group_subscription_rules/' + groupRuleId, rules)
        console.log(groupRule)
    }

    async getSubscriptionGroupRules ({ groupRuleId }) {
        let groupRules = await this.resourceFinder.fetchResource('/api/group_subscription_rules/' + groupRuleId)
        let data = JSON.stringify(groupRules, null, 2)
        console.log(data)
        if (this.exportPath) {
            exporter.exportFile(
                this.exportPath,
                exporter.EXPORT_TYPES.groupSubscriptionRules,
                exporter.FORMATS.json,
                data,
                groupRuleId
            )
        }
    }

    async deleteSubscriptionGroupRule ({ groupRuleId }) {
        let success = await this.resourceRemover.deleteResource('/api/group_subscription_rules/' + groupRuleId)
    }

}

module.exports = { GroupSubscriptionRules }
