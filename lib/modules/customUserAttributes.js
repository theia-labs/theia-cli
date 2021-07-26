const ResourceFinder = require('../api/resourceFinder')

class CustomUserAttributes {
    resourceFinder

    constructor (resourceFinder) {
        this.resourceFinder = resourceFinder
    }

    async getCustomUserAttributes () {
        console.log(this.resourceFinder.token)
        console.log(
            await this.resourceFinder.fetchCollection('/api/custom_user_attributes')
        )
    }
}

module.exports = { CustomUserAttributes }
