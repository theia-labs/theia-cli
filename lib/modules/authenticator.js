const apiAuth = require("../api/auth")

const auth = async (options) => {
    console.log(await apiAuth.auth(options))
}

module.exports = {auth}
