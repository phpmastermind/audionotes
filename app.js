var express = require('express');
var BinaryServer = require('binaryjs').BinaryServer;
var speech = require('./recognize')
var fs = require('fs');
var wav = require('wav');

var port = 3000;
var outFile = 'demo.wav';
var filename = 'audio.raw';

var app = express();

app.set('views', __dirname + '/tpl');
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/public'))

app.get('/', function(req, res){
  res.render('index');
});

app.get('/stream', function (req, res) {
 // res.send("Transcripting... Please wait.");
  speech.streamingRecognize(filename, function(data){
    res.send(`Transcsiption ${data}`);
    //console.log("Transcription", transcription);
  }); 
})

app.listen(port, function(){
  console.log('Example app listening on port '+ port);
  console.log(speech);
});

//console.log('server open on port ' + port);

binaryServer = BinaryServer({port: 9001});

binaryServer.on('connection', function(client) {
  console.log('new connection');

  var fileWriter = new wav.FileWriter(outFile, {
    channels: 1,
    sampleRate: 16000,
    bitDepth: 16,
  });

  client.on('stream', function(stream, meta) {
    console.log('new stream');
    stream.pipe(fileWriter);

    stream.on('end', function() {
      fileWriter.end();
      console.log('wrote to file ' + outFile);
      speech.streamingRecognize(filename, function(transcription){
        alert("Transcription: "+ transcription);
        console.log("Transcription", transcription);
      });
    });
  });
});
