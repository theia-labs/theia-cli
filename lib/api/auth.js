const axios = require('axios')

async function auth(settings) {
    return new Promise((resolve, reject) => {
        axios.post(`${settings.environment}/api/login_check`, {
            'username': settings.key,
            'password': settings.password
        })
            .then(response => resolve(`Bearer ${response.data.token}`))
            .catch(error => reject(error))
    })
}

module.exports = {auth}
