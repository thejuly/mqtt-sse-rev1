var express = require('express');
var mqtt = require('mqtt');
var router = express.Router();
var url = require('url');

//var mqtt_url = process.env.CLOUDMQTT_URL || 'mqtt://localhost:1883'; //ok local
//var topic = process.env.CLOUDMQTT_TOPIC || 'test';
//var mqtt_url = process.env.CLOUDMQTT_URL || 'broker.hivemq.com:8000';
var mqtt_url = process.env.CLOUDMQTT_URL || 'mqtt://broker.hivemq.com:1883'; //ok heroku
var topic = process.env.CLOUDMQTT_TOPIC || 'thongpoon/myTemp'; //ok heroku
const myAuthor = 'Thongpoon_s (5-0684)';

var client = mqtt.connect(mqtt_url);

/* GET home page. */
router.get('/', function(req, res, next) {
  var config =  url.parse(mqtt_url);
  config.topic = topic;
  config.auth = myAuthor;
  res.render('index', {
	connected: client.connected,
	config: config
  });
});

client.on('connect', function() {
  router.post('/publish', function(req, res) {
  console.log(req.body.msg); //myScript
	var msg = JSON.stringify({
	  date: new Date().toString(),
	  msg: req.body.msg
	});
    client.publish(topic, msg, function() {
      res.writeHead(204, { 'Connection': 'keep-alive' });
      res.end();
    });
  });

  router.get('/stream', function(req, res) {
    console.log('work at /stream'); //myScript
    // send headers for event-stream connection
    // see spec for more information
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('\n');

    // Timeout timer, send a comment line every 20 sec
    var timer = setInterval(function() {
      res.write('event: ping' + '\n\n');
    }, 20000);

    client.subscribe(topic, function() {
      client.on('message', function(topic, msg, pkt) {
        //console.log(msg.toString()); //myScript
        console.log(`myNew msg =  ${msg.toString()}`) //myScript


        var json = JSON.parse(msg);
        //console.log(json.date); //myScript
        //console.log(json.msg); //myScript

        //res.write("data: " + json.date + ": " + json.msg + "\n\n");
        res.write("data: "+ msg + "\n\n"); //Ok

        });
    });
  });
});

module.exports = router;
