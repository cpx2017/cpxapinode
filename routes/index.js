var express = require('express');
const apix = require('axios')
var router = express.Router();
const requestIp = require('request-ip');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/status', function (req, res, next) {
  res.send("OK")
})

async function Covid(cc) {
  const response = await apix({
      url: "https://disease.sh/v3/covid-19/countries/" + cc,
      method: 'get'
  });
  return response.data;
}

router.post('/getcovid', async function (req, res, next) {
  const usrAPI = requestIp.getClientIp(req);
  const response = await apix({
    url: "http://ip-api.com/json/" + usrAPI,
    method: 'get'
});
  res.json(await Covid(response.data.countryCode))
})

router.post('/getcountry', async function (req, res, next) {
  const usrAPI = requestIp.getClientIp(req);
  const response = await apix({
    url: "http://ip-api.com/json/" + usrAPI,
    method: 'get'
});
  res.send(response.data.countryCode)
})

module.exports = router;
