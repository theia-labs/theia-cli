const axios = require('axios')
const https = require('https')
const instance = axios.create({
    httpsAgent: new https.Agent({  
      rejectUnauthorized: false
    })
  });
const agent = new https.Agent({  
    rejectUnauthorized: false
  });
async function auth(settings) {
    console.log(settings)
    return new Promise((resolve, reject) => {
        instance.post(`${settings.environment}/api/login_check`, {
            'username': settings.key,
            'password': settings.password,
            httpsAgent: agent
        })
            .then(response => resolve(`Bearer ${response.data.token}`))
            .catch(error => reject(error))
    })
}

module.exports = {auth}
