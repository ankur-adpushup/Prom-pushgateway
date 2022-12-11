const express = require('express');
const cors = require('cors');
const requestIp = require('request-ip');
const { events, register } = require('./events');
const eventNames = require('./constants');

const app = express();

app.use(express.json());
app.use(cors());

app.use(requestIp.mw());

//exposing metrics endpoint
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-type', register.contentType);
  res.end(await register.metrics());
});

//whitelisting ips
app.use((req, res, next) => {
  let validIps = ['20.114.155.129', '52.251.118.129']; // Put your IP whitelist in this array
  if (validIps.includes(req.clientIp)) {
    // IP is ok, so go on
    console.log('IP ok', req.clientIp);
    next();
  } else {
    // Invalid ip
    console.log('Bad IP: ' + req.clientIp);
    const err = new Error('Bad IP: ' + req.clientIp);
    next(err);
  }
});

app.get('/test', (req, res) => {
  return res.status(200).json('Server is working!');
});

app.post('/log', (req, res) => {
  try {
    let { eventName, eventData } = req.body;
    console.log('', { eventName, eventData });

    //INSTREAM_AP_PLAYER_AD_ERROR
    if (eventName === eventNames.INSTREAM_AP_PLAYER_AD_ERROR) {
      // [{siteId,value}]
      eventData.forEach((data) => {
        const { siteId, value } = data;
        events[eventNames.INSTREAM_AP_PLAYER_AD_ERROR].set(
          { siteId },
          Number(value)
        );
      });
    }

    return res.status(200).send('Data updated!');
  } catch (err) {
    return res.status(500).send('Oops Error occured!');
  }
});

app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  console.log('THE ERROR IS : ', err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, (req, res) => {
  console.log(`Server started on port ${PORT}`);
});
