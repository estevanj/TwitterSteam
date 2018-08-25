var express = require("express");
var bodyParser = require("body-parser");
var path = require('path');
var fs = require('fs');
const csvFilePath='C:/servidortwiter/CSV/'
const csv=require('csvtojson');
var Twitter = require('twitter');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


app.use('/static',express.static(__dirname + '/assets'));

app.get('/', function(req,resp){
    resp.sendFile('sendtweets.html',{root: path.join(__dirname, './files')});
});


app.get('/info', function(req,resp){
    resp.sendFile('info.html',{root: path.join(__dirname, './files')});
})

app.post("/",function(req,resp){

  //res.send("Recibimos tus datos")
  var tweet = req.body.tweet;
  var file = req.body.file;
  var ck=req.body.consumer_key;
  var cs=req.body.consumer_secret;
  var atk=req.body.access_token_key;
  var ats=req.body.access_token_secret;

  //var geo = req.body;
  //resp.send(user_id + ' ' + token + ' ' + geo);

enviotweets(file,tweet,ck,cs,atk,ats);
resp.end(JSON.stringify(req.body));
//resp.sendFile('info.html',{root: path.join(__dirname, './files')});

});

function enviotweets(file,tweet,ck,cs,atk,ats){
  //send tweet
  var nompersona=''
  /////tweets
  var client = new Twitter({
    consumer_key: ck,
    consumer_secret:cs,
    access_token_key:atk,
    access_token_secret: ats
  });

  csv()
  .fromFile(csvFilePath+file)
  .on('json',(jsonObj)=>{
      // combine csv header row and csv line to a json object
      // jsonObj.a ==> 1 or 4
      nompersona=jsonObj.screen_name
      //console.log(nompersona)
      client.post('statuses/update', {status: tweet +' @'+nompersona}, function(error, tweet, response) {
        if (!error) {
          console.log(tweet);
        }
      });
  })
  .on('done',(error)=>{
      console.log('Enviado Coreectamente');
      //resp.redirect('/info');
  })
}

app.listen(8080, function(){
  console.log('online');
});
