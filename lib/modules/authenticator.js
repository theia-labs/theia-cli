const apiAuth = require("../api/auth")

const auth = async (options) => {
    console.log(await apiAuth.auth(options)
        .catch(error => error.message))
}

module.exports = {auth}
