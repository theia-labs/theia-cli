const ResourceFinder = require('../api/resourceFinder')

class UserAttributes {
    resourceFinder

    constructor (resourceFinder) {
        this.resourceFinder = resourceFinder
    }

    async getCustomUserAttributes () {
        console.log(
            await this.resourceFinder.fetchCollection('/api/custom_user_attributes')
        )
    }

    async getAllUsersAttributes() {
        await this.resourceFinder.fetchCollection('/api/custom_user_attributes')

    }
}

module.exports = { UserAttributes }
