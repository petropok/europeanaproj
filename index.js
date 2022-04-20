const express = require("express");
const europeana = require("europeana") ("xxx")
const app = express();
const path = require('path');

app.use(express.static('public'))

app.get('/',function(req,res){
    res.sendFile(path.join(__dirname, 'pages/index.html'));
  });

  app.get('/search/:search',function(req,res){
    console.log(req.params.search);
    let params = {
      query: req.params.search ,
      rows: 20,
      media: true ,
      thumbnail: true ,
      qf: "TYPE:IMAGE"
    };
    europeana ('search', params, function(err, data) {
      if (err) {
        res.send("error");
      } else {
        res.send(data);
      }
    });
  });

app.listen(process.env.port || 3000, () => console.log(`App available on http://localhost:3000`))