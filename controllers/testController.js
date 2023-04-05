var axios = require('axios');

axios.defaults.baseURL = 'https://api.spotify.com' // the prefix of the URL
axios.defaults.headers.get['Accept'] = 'application/json' 

const test = (req, res, next) => {
    res.render('test', {
        title: 'This is a test for spotify api',
        results: false
    })
}

const search = (req, res, next) => {
  
    const client_id = process.env.CLIENT_ID; 
    const client_secret = process.env.CLIENT_SECRET; 
    const authOptions = {
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        params: {
            grant_type: 'client_credentials'
        }
    };

    axios(authOptions)
        .then(response => {
            const token = response.data.access_token;
            const options = {
                method: 'get',
                url: `https://api.spotify.com/v1/search?query=${req.body.search}&type=artist&market=US&locale=en-US%2Cen%3Bq%3D0.5&offset=0&limit=5`,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            axios(options)
                .then(response => {
                    console.log(response.data);
                   // const responseStr = 
                    res.render('test', {
                        title: 'results from test',
                        results: response.data.artists.items
                    })
                })
                .catch(error => {
                    console.log(error);
                    res.render('test', {
                        title: 'results from test',
                        results: error
                    })
                });
        })
        .catch(error => {
            console.log(error);
        });
}


module.exports = {
    test, 
    search
}