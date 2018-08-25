const csvFilePath='/Users/estevandefaz/Downloads/export-2.csv'
const csv=require('csvtojson')
var nompersona=''

/////tweets
var Twitter = require('twitter');
var client = new Twitter({
  consumer_key: 'SrIUe15lmBm7fgSRHrp9TsSYE',
  consumer_secret:'9eK0Odz9cNvGOuXteMZt1jWfniTYFmS05HljMiSD0s58a5YmIf',
  access_token_key:'1483605390-oSq2H0MHytY4sDzZ9TtFLpjG2p8SBGjPsusT4eQ',
  access_token_secret: 'WrUGC4oX1fcFim5F3ImcaEDQlrEHoEjhlxtchw7bTap81'
});


csv()
.fromFile(csvFilePath)
.on('json',(jsonObj)=>{
    // combine csv header row and csv line to a json object
    // jsonObj.a ==> 1 or 4
    nompersona=jsonObj.name
    console.log(nompersona)
    client.post('statuses/update', {status: 'prueba'  }, function(error, tweet, response) {
      if (!error) {
        console.log(tweet);
      }
    });
})
.on('done',(error)=>{
    console.log('end')
})
