const express = require('express');
const cors = require('cors');
const requestIp = require('request-ip');
var AccessControl = require('express-ip-access-control');
const app = express();
const { events, register } = require('./events');
const eventNames = require('./constants');

app.use(cors());

app.use(requestIp.mw());

app.use((req, res, next) => {
  let validIps = ['103.242.199.124', '20.114.155.129']; // Put your IP whitelist in this array

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

app.use(express.json());

app.get('/test', (req, res) => {
  return res.status(200).json('Server is working!');
});

app.post('/log', (req, res) => {
  try {
    let { eventName, eventData } = req.body;
    console.log('', { eventName, eventData });
    //instream error logging
    if (eventName === eventNames.INSTREAM_ERROR) {
      // [{siteId,value}]
      eventData.forEach((data) => {
        const { siteId, value } = data;
        events[eventNames.INSTREAM_ERROR].set({ siteId }, Number(value));
      });
    }

    return res.status(200).send('Data updated!');
  } catch (err) {
    return res.status(500).send('Oops Error occured!');
  }
});

//exposing metrics endpoint
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-type', register.contentType);
  res.end(await register.metrics());
});

app.listen(3000, (req, res) => {
  console.log('Server started on port 3000');
});
