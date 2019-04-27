
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var R = require('r-script');
var pathlib = require('path');

var base = "E:/Documents/USP/Projeto Mestrado/mestrado/The Project/data/teste/ILP-1297Ale37-44.txt";
var corpus = "E:/Documents/USP/Projeto Mestrado/mestrado/The Project/data/teste";
var username = 'mo';


var path_core = "../../core/"+pathlib.basename(corpus);
var path_users = "../../file/"+pathlib.basename(corpus)+"/"+username
app.use(bodyParser.urlencoded({ extended: true })); 

var projtech = "tsne";
var embtech = "bagofwords"; // or "word_embeddings"
var workingdir = "E:/Documents/USP/Projeto Mestrado/github/TRIVIR/Server/scripts";

// Add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/', function (req, res) {
  res.send('Hello Rivi!');
});

app.post('/saveparameters', function (req, res) {
    
    
    
    
});

app.post('/scatterplot', function (req, res) {
  console.log("Initializing scatterplot"); 
  fs.readFile("../file/"+pathlib.basename(corpus)+"/"+username+"/coordinates.json", "utf8", function(err, data){
              if(err){
                  var out = R("./scripts/main.R")
                  .data({"command": "scatterplotdata", "corpus": corpus, "path_core": path_core, "path_users":path_users, "projtech": projtech, "embtech": embtech, "workingdir": workingdir})
                  .callSync()
                  console.log(out);              
                  if (out == "success"){
                       fs.readFile("../file/"+pathlib.basename(corpus)+"/"+username+"/coordinates.json", "utf8", function(err, data){
                              if(err) throw err;   
                                  res.send(data);
                       });      
                  }     
              }else{
                res.send(data);  
              }                     
  });      
});
app.post('/focuslist', function(req, res){
    console.log("Initializing focus list");
    fs.readFile("../file/"+pathlib.basename(corpus)+"/"+username+"/focuslist.json", "utf8", function(err, data){
          if(err){
              var out = R("./scripts/main.R")
                .data({"command": "focuslist", "corpus": corpus,  "baseDocument": base, "path_core": path_core, "path_users":path_users, "workingdir": workingdir})
                .callSync(); 
                console.log(out)
                if (out == "success"){                      
                      fs.readFile("../file/"+pathlib.basename(corpus)+"/"+username+"/focuslist.json", "utf8", function(err, data){
                      if(err) throw err;   
                        res.send(data);
                      });           
                }             
          }else{
             res.send(data);
          }           
    }); 
})
app.post('/suggestionlist', function(req, res){
    console.log("Initializing suggestion list");
    
    fs.readFile("../file/"+pathlib.basename(corpus)+"/"+username+"/suggestionlist.json", "utf8", function(err, data){
            if(err) {
                var out = R("./scripts/main.R")
                  .data({"command": "suggestion", "corpus": corpus, "path_core": path_core, "path_users":path_users, "workingdir": workingdir})
                  .callSync();
                console.log(out);
                if (out == "success"){
                    fs.readFile("../file/"+pathlib.basename(corpus)+"/"+username+"/suggestionlist.json", "utf8", function(err, data){
                        if(err) throw err;   
                        res.send(data);
                    });           
                }                                
            }else{
                res.send(data);
            }          
    });      
})
app.post('/signature', function (req, res) {

  console.log("Initializing signature");
        
  var currentdate = new Date(); 
  var datetime = "Last Sync: " + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
  console.log(datetime)
    

  R("./scripts/main.R")
      .data({"command": "init", "baseDocument": base, "corpus": corpus, "username": username, "path_core": path_core, "path_users":path_users, "embtech": embtech, "workingdir": workingdir})
      .call(function(err,d){
           if (err) console.log(err);
           console.log(d);

           if (d == "success"){
              fs.readFile("../core/"+pathlib.basename(corpus)+"/signature.json", "utf8", function(err, data){
                  if(err) console.log(err);
                  var currentdate = new Date(); 
                  var datetime = "Last Sync: " + currentdate.getDate() + "/"
                    + (currentdate.getMonth()+1)  + "/" 
                    + currentdate.getFullYear() + " @ "  
                    + currentdate.getHours() + ":"  
                    + currentdate.getMinutes() + ":" 
                    + currentdate.getSeconds();
                  console.log(datetime);
                  res.send(data);
                });      
            } 
      });  
 
});

app.post('/terms', function(req, res){
    console.log("Retrieving terms" ); 
    fs.readFile("../file/"+pathlib.basename(corpus)+"/"+username+"/ImportantTerms.json", "utf8", function(err, data){
        if(err) throw err;   
            res.send(data);
    });     
});

app.get('/getsynonyms', function(req, res){
    console.log("Getting synonyms")
    R("./scripts/main.R")
      .data({"command": "getsynonyms", "term": req.query.term.toString().trim(), "path_core": path_core, "path_users":path_users, "workingdir": workingdir})
      .call(function(err,d){
           if (err) throw err;
           res.send(d);
      });  
})
app.get('/getsimilardocuments', function(req, res){
    console.log("Getting similar documents");
    var path = "../file/"+pathlib.basename(corpus)+"/"+username+"/cosdistance.csv";        
 
    fs.readFile(path, "utf8", function(err, data){
            if (err) console.log(err);  
            var rows = data.split('\n');
            var doclist = [];
            var k = 0;
            for (var i=1; i < rows.length; i++){
                var cell = rows[i].split(',');
                doclist[k] = cell[0];
                k = k + 1;
            } 
            res.send(doclist);
    }) 
    
})

app.get('/getdocument', function(req, res){
    console.log("Getting document: " + req.query.docname);
    
    var path = "../data/"+pathlib.basename(corpus)+"/"+req.query.docname;  
    fs.readFile(path, "utf8", function(err, data){
            if (err) console.log(err); 
            res.send(data);
    })       
});

app.get('/deleteterm', function(req, res){
   console.log("Deleting term: " + req.query.term);
   //Remove ngram from JSON file
    fs.readFile("../file/"+pathlib.basename(corpus)+"/"+username+"/ImportantTerms.json", "utf8", function(err, data){
                  if(err) throw err;   
                  file = JSON.parse(data);
                  var keys = Object.keys(file);
                  
                  for (var i = 0; i < keys.length; i++){
                      if (file[keys[i]].term == req.query.term){
                        file.splice([keys[i]],1)
                        break;
                      }
                  }
                  json = JSON.stringify(file, null, 2)
                  fs.writeFile("../file/"+pathlib.basename(corpus)+"/"+username+"/ImportantTerms.json", json, "utf8", (err) => {
                        if (err) throw err;
                          res.send('The file has been saved!');
                  });     
                  
    }) 
});

app.get('/addterm', function(req, res){
   console.log("Adding term: " + req.query.term);
   R("./scripts/main.R")
      .data({"command": "addterm", "term": req.query.term, "corpus": corpus, "path_core": path_core, "path_users":path_users, "workingdir": workingdir})
      .call(function(err,out){
        console.log(err)
        console.log(out);
        res.send("success");
      });  
});

app.post('/retrainclassifier', function (req, res) {
    console.log("Retraining classifier" );  
    var currentdate = new Date(); 
              var datetime = "Last Sync: " + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
    console.log(datetime);
    R("./scripts/main.R")
      .data({"command": "retrainclassifier", "corpus": corpus, "path_core": path_core, "path_users":path_users, "workingdir": workingdir})
      .call(function(err,out){
        fs.access("../file/"+pathlib.basename(corpus)+"/"+username+"/suggestionlist.json", error => {
          if (!error) {
                fs.unlink("../file/"+pathlib.basename(corpus)+"/"+username+"/suggestionlist.json",function(error){
                    if (error) console.log(error);
                    var currentdate = new Date(); 
                    var datetime = "Last Sync: " + currentdate.getDate() + "/"
                        + (currentdate.getMonth()+1)  + "/" 
                        + currentdate.getFullYear() + " @ "  
                        + currentdate.getHours() + ":"  
                        + currentdate.getMinutes() + ":" 
                        + currentdate.getSeconds();
                    console.log(datetime);
                    res.send("success");
                });
            } else {
                console.log(error);
            }
        });    
    }); 
});

app.get('/setasnotrelevant', function (req, res) {    
    
    console.log("Setting a document as NOT relevant " + req.query.docname + " from: " + req.query.origin);
    if (req.query.origin == 'suggestion'){
           fs.readFile("../file/"+pathlib.basename(corpus)+"/"+username+"/suggestionlist.json", "utf8", function(err, data){
                      if(err) console.log(err);   
                      file = JSON.parse(data);
                      var keys = Object.keys(file);

                      for (var i = 0; i < keys.length; i++){
                          if (file[keys[i]].docname == req.query.docname){
                            file.splice([keys[i]],1)
                            break;
                          }
                      }
                      json = JSON.stringify(file, null, 2)
                      fs.writeFile("../file/"+pathlib.basename(corpus)+"/"+username+"/suggestionlist.json", json, "utf8", (err) => {
                            if (err) console.log(err);                         
                             console.log('deleted from suggestion ');
                      });     

        }) 
     }else if (req.query.origin == 'focus'){
        fs.readFile("../file/"+pathlib.basename(corpus)+"/"+username+"/focuslist.json", "utf8", function(err, data){
                      if(err) throw err;   
                      file = JSON.parse(data);
                      var keys = Object.keys(file);

                      for (var i = 0; i < keys.length; i++){
                          if (file[keys[i]].docname == req.query.docname){
                            file.splice([keys[i]],1)
                            break;
                          }
                      }
                      json = JSON.stringify(file, null, 2)
                      fs.writeFile("../file/"+pathlib.basename(corpus)+"/"+username+"/focuslist.json", json, "utf8", (err) => {
                            if (err) console.log(err);
                            console.log('deleted from focus ');                             
                      });     

        })    
    }    
    fs.readFile("../file/"+pathlib.basename(corpus)+"/"+username+"/notrelevant.json", "utf8", function(err, data){
            if(err) console.log(err);   
            file = JSON.parse(data);
            var keys = Object.keys(file);
            var added = false;
            for (var i = 0; i < keys.length; i++){
                if (file[keys[i]].docname == req.query.docname){                   
                    added = true;                   
                    break;
                }
            }
            if (!added){
                var body = "";
                var path = "../data/"+pathlib.basename(corpus)+"/"+req.query.docname;        
                            
                var title = R("./scripts/main.R")
                .data({"command": "gettitle", "corpus": corpus, "docname": req.query.docname, "path_core": path_core, "path_users":path_users, "workingdir": workingdir})
                .callSync()
                var element = {"docname": req.query.docname, "title": title};

                file.push(element)
                json = JSON.stringify(file, null, 2)
                fs.writeFile("../file/"+pathlib.basename(corpus)+"/"+username+"/notrelevant.json", json, "utf8", (err) => {
                    if (err) console.log(err);                    
                    res.send('The file has been saved!');
                });      
            }           
    }); 
    
});

app.get('/setasrelevant', function (req, res) {
  console.log("Setting a document as relevant " + req.query.docname + " from: " + req.query.source);  
  if (req.query.docname != 'undefined'){
      var currentdate = new Date(); 
      var datetime = "Last Sync: " + currentdate.getDate() + "/"
                    + (currentdate.getMonth()+1)  + "/" 
                    + currentdate.getFullYear() + " @ "  
                    + currentdate.getHours() + ":"  
                    + currentdate.getMinutes() + ":" 
                    + currentdate.getSeconds();
      console.log(datetime);
      
      if (req.query.source == 'suggestion'){          
          fs.readFile("../file/"+pathlib.basename(corpus)+"/"+username+"/suggestionlist.json", "utf8", function(err, data){
                  if(err) console.log(err);   
                  file = JSON.parse(data);
                  var keys = Object.keys(file);
                  
                  for (var i = 0; i < keys.length; i++){
                      if (file[keys[i]].docname == req.query.docname){
                        file.splice([keys[i]],1)
                        break;
                      }
                  }
                  json = JSON.stringify(file, null, 2)
                  fs.writeFile("../file/"+pathlib.basename(corpus)+"/"+username+"/suggestionlist.json", json, "utf8", (err) => {
                        if (err) console.log(err);
                        console.log('deleted from suggestion ');
                  });               
          })
         
      }
      if (req.query.source == 'notrelevant'){        
     
         fs.readFile("../file/"+pathlib.basename(corpus)+"/"+username+"/notrelevant.json", "utf8", function(err, data){
                  if(err) console.log(err);   
                  file = JSON.parse(data);
                  var keys = Object.keys(file);
                  
                  for (var i = 0; i < keys.length; i++){
                      if (file[keys[i]].docname == req.query.docname){
                        file.splice([keys[i]],1)
                        break;
                      }
                  }
                  json = JSON.stringify(file, null, 2)
                  fs.writeFile("../file/"+pathlib.basename(corpus)+"/"+username+"/notrelevant.json", json, "utf8", (err) => {
                        if (err) console.log(err);                       
                        console.log('deleted from not relevant '); 
                  });     
                  
          })
           
      }
      
      fs.readFile("../file/"+pathlib.basename(corpus)+"/"+username+"/focuslist.json", "utf8", function(err, data){
                if(err) console.log(err);   
                file = JSON.parse(data);
                var keys = Object.keys(file);
                var added = false;
                for (var i = 0; i < keys.length; i++){
                    if (file[keys[i]].docname == req.query.docname){                   
                        added = true;                   
                        break;
                    }
                }
                if (!added){          
                    
                    var body = "";
                    var path = "../data/"+pathlib.basename(corpus)+"/"+req.query.docname;         
                
                    var title = R("./scripts/main.R")
                        .data({"command": "gettitle", "corpus": corpus, "docname": req.query.docname, "path_core": path_core, "path_users":path_users, "workingdir": workingdir})
                        .callSync()
                    var element = {"docname": req.query.docname, "title": title, "isbase": false, "label": 1};       
                    file.push(element)
                    json = JSON.stringify(file, null, 2)
                    fs.writeFile("../file/"+pathlib.basename(corpus)+"/"+username+"/focuslist.json", json, "utf8", (err) => {
                        if (err) console.log(err);                            
                            res.send('The file has been saved!');
                            var currentdate = new Date(); 
                            var datetime = "Last Sync: " + currentdate.getDate() + "/"
                                            + (currentdate.getMonth()+1)  + "/" 
                                            + currentdate.getFullYear() + " @ "  
                                            + currentdate.getHours() + ":"  
                                            + currentdate.getMinutes() + ":" 
                                            + currentdate.getSeconds();
                            console.log(datetime);
                    });          

                }else{
                    res.send("Already added");
                }           
        });
  }else{
      console.log("error in document name")
  }
  
});
app.get('/setasrelevantdocwithngram', function(req, res){
    console.log("Setting relevant documents with ngram "+ req.query.ngram ); 
    var currentdate = new Date(); 
    var datetime = "Last Sync: " + currentdate.getDate() + "/"
                    + (currentdate.getMonth()+1)  + "/" 
                    + currentdate.getFullYear() + " @ "  
                    + currentdate.getHours() + ":"  
                    + currentdate.getMinutes() + ":" 
                    + currentdate.getSeconds();
    console.log(datetime);
    if (req.query.ngram.length > 2){
           R("./scripts/main.R")
          .data({"command": "setrelevantngrambatch", "ngram": req.query.ngram.toString().trim(), "path_core": path_core, "path_users":path_users, "corpus": corpus, "workingdir": workingdir})
          .call(function(err,out){
            if (err) console.log(err);
            console.log(out);             
            var currentdate = new Date(); 
            var datetime = "success: " + currentdate.getDate() + "/"
                        + (currentdate.getMonth()+1)  + "/" 
                        + currentdate.getFullYear() + " @ "  
                        + currentdate.getHours() + ":"  
                        + currentdate.getMinutes() + ":" 
                        + currentdate.getSeconds();
            console.log(datetime);
            res.send('success'); 
          })        
    }   
})
app.get('/setasnotrelevantdocwithngram', function(req, res){
    console.log("Setting as not relevant documents with ngram "+ req.query.ngram ); 
    var currentdate = new Date(); 
    var datetime = "Last Sync: " + currentdate.getDate() + "/"
                    + (currentdate.getMonth()+1)  + "/" 
                    + currentdate.getFullYear() + " @ "  
                    + currentdate.getHours() + ":"  
                    + currentdate.getMinutes() + ":" 
                    + currentdate.getSeconds();
    console.log(datetime);
    if (req.query.ngram.length > 2){
           R("./scripts/main.R")
          .data({"command": "setnotrelevantngrambatch", "ngram": req.query.ngram.toString().trim(), "path_core": path_core, "path_users":path_users, "corpus": corpus, "baseDocument": base, "workingdir": workingdir})
          .call(function(err,out){
            if (err) console.log(err);
            console.log(out);            
            var currentdate = new Date(); 
            var datetime = "success: " + currentdate.getDate() + "/"
                        + (currentdate.getMonth()+1)  + "/" 
                        + currentdate.getFullYear() + " @ "  
                        + currentdate.getHours() + ":"  
                        + currentdate.getMinutes() + ":" 
                        + currentdate.getSeconds();
            console.log(datetime);
            res.send('success');  
          })
    }else{
       res.send('success');   
    }
    
})

app.get('/setsimilarasrelevant', function(req, res){
    console.log("Setting as relevant similar documents to: "+ req.query.document );  
    
    if (req.query.document.length > 2){
           R("./scripts/main.R")
          .data({"command": "setsimilarasrelevantbatch", "document": req.query.document.toString().trim(), "path_core": path_core, "path_users":path_users, "corpus": corpus, "baseDocument": base, "embtech": embtech, "workingdir": workingdir})
          .call(function(err,out){
                if (err) console.log(err);
                
                console.log(out); 
                res.set('Content-Type', 'text/plain');
                res.send('success');
                
         });
    }
})

app.get('/setsimilarasnotrelevant', function(req, res){
    console.log("Setting as not relevant similar documents to: "+ req.query.document ); 
    var currentdate = new Date(); 
    var datetime = "Last Sync: " + currentdate.getDate() + "/"
                    + (currentdate.getMonth()+1)  + "/" 
                    + currentdate.getFullYear() + " @ "  
                    + currentdate.getHours() + ":"  
                    + currentdate.getMinutes() + ":" 
                    + currentdate.getSeconds();
    console.log(datetime);
    if (req.query.document.length > 2){
           R("./scripts/main.R")
          .data({"command": "setsimilarasnotrelevantbatch", "document": req.query.document.toString().trim(), "path_core": path_core, "path_users":path_users, "corpus": corpus, "baseDocument": base, "embtech": embtech, "workingdir": workingdir})
          .call(function(err,out){
            if (err) console.log(err);
            console.log(out);
            res.send('success');  
            var currentdate = new Date(); 
            var datetime = "success: " + currentdate.getDate() + "/"
                        + (currentdate.getMonth()+1)  + "/" 
                        + currentdate.getFullYear() + " @ "  
                        + currentdate.getHours() + ":"  
                        + currentdate.getMinutes() + ":" 
                        + currentdate.getSeconds();
            console.log(datetime);
          })
    }else{
       res.send('success');   
    }
    
})

app.get('/getnotrelevantlist', function(req, res){
  console.log("Getting list of not relevant documents");
  fs.readFile("../file/"+pathlib.basename(corpus)+"/"+username+"/notrelevant.json", "utf8", function(err, data){
        if(err) console.log(err);   
        console.log("success")
        res.send(data);
  });  
    
})
app.listen(3000, function () {
  console.log('Listening on port 3000!');
});