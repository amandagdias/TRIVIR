var relevant_list;
var suggestion_list;
var notrelevant_list;
var similardocuments_list;

var colorFocus = "#17a2b8";
var colorSuggestion = "#ffc107";
var colorNotRelevant = "#d75a4a";
var colorBase = "#007527";

/* General */
function saveFocusList(focus){
    relevant_list = focus;    
}
function saveSuggestionList(sug){
    suggestion_list = sug;    
}
function saveNotRelevantList(){
     $.get('http://127.0.0.1:3000/getnotrelevantlist',function(resp) {                           
        notrelevant_list = JSON.parse(resp);   
    }); 
}
function isBaseDocument(name){    
    for (var i =0; i < relevant_list.length; i++){
        if (relevant_list[i].docname == name){
            if (relevant_list[i].isbase == true){
                return true;
            }else{
                return false;
            }            
        }            
    }   
    return false;    
}
function isRelevant(document){ 
    for (var i =0; i < relevant_list.length; i++){
        if (relevant_list[i].docname == document){
            return true;
        }            
    }   
    return false;   
}
function isSuggestion(document){  
    for (var i =0; i < suggestion_list.length; i++){
        if (suggestion_list[i].docname == document){
            return true;
        }           
    }   
    return false;   
}
function isNotRelevant(document){   
    for (var i =0; i < notrelevant_list.length; i++){
        if (notrelevant_list[i].docname == document){
            return true;
        }           
    }   
    return false;    
    
}

/* Signature */
function setRelevantDocumentsWithNgram(ngram){
    if (ngram.length > 2){
        $("#focustoggle")[0].disabled = true;
        $("#suggestiontoggle")[0].disabled = true;
        $("#suggestioncontainer").css("visibility", "hidden")
        $("#focuscontainer").css("visibility", "hidden")
        $.get('http://127.0.0.1:3000/setasrelevantdocwithngram?ngram='+ngram,function(resp) {                 
                 
                saveNotRelevantList();
                LoadFocusList(function(){
                    LoadSuggestionList(function(){
                        UpdateScatterplotColors("null")
                    })

                });            
        }); 
    }
    
}
function setNotRelevantDocumentsWithNgram(ngram){ 
    if (ngram.length > 2){
        $("#focustoggle")[0].disabled = true;
        $("#suggestiontoggle")[0].disabled = true;
        $("#suggestioncontainer").css("visibility", "hidden")
        $("#focuscontainer").css("visibility", "hidden")
        $.get('http://127.0.0.1:3000/setasnotrelevantdocwithngram?ngram='+ngram,function(resp) {                 
           
            saveNotRelevantList();
            LoadFocusList(function(){
                LoadSuggestionList(function(){                   
                    UpdateScatterplotColors("null")
                })
                 
            });            
        }); 
    }
  
    
}

/* Suggestion List */
function RetrainClassifier(){
  
    $("#suggestiontoggle")[0].disabled = true;
    $("#suggestioncontainer").css("visibility", "hidden")
    
    $.post('http://127.0.0.1:3000/retrainclassifier', function(resp){
        saveNotRelevantList();
        LoadSuggestionList(function(){
           LoadScatterplot(); 
        });    
        
    })  
    
}

/* Scatterplot */
function getSimilarDocuments(){  
   if (similardocuments_list == undefined){
       $.get('http://127.0.0.1:3000/getsimilardocuments',function(resp) {     
          similardocuments_list = resp;
          FilterScatterplot(similardocuments_list)
       }); 
   }else{
      FilterScatterplot(similardocuments_list); 
   }   
}
function ScatterplotColor(name){
    if (isBaseDocument(name)){
        return colorBase;
    }    
    if (isRelevant(name)){        
        return colorFocus;
    }
    if (isSuggestion(name)){
        return colorSuggestion;
    }
    if (isNotRelevant(name)){
        return colorNotRelevant;
    }
    return '#BDBDBD';
   
}
function setSimilarDocumentsAsNotRelevant(document){

    if (document.length > 2){
        $("#focustoggle")[0].disabled = true;       
        $("#suggestiontoggle")[0].disabled = true;
        $("#suggestioncontainer").css("visibility", "hidden")
        $("#focuscontainer").css("visibility", "hidden")
        $.get('http://127.0.0.1:3000/setsimilarasnotrelevant?document='+document,function(resp) {                 
       
            saveNotRelevantList();
            LoadFocusList(function(){
                LoadSuggestionList(function(){                   
                    UpdateScatterplotColors("null")
                })
                 
            });            
        }); 
    }
    
    
}
function setSimilarDocumentsAsRelevant(document){ 
    if (document.length > 2){
        $("#focustoggle")[0].disabled = true;        
        $("#suggestiontoggle")[0].disabled = true;
        $("#suggestioncontainer").css("visibility", "hidden")
        $("#focuscontainer").css("visibility", "hidden")
        $.get('http://127.0.0.1:3000/setsimilarasrelevant?document='+document,function(resp) {                 
          
            saveNotRelevantList();           
            LoadFocusList(function(){
                LoadSuggestionList(function(){                   
                    UpdateScatterplotColors("null")
                })
                 
            });            
        }); 
    }
    
    
}

/* Terms */
function RemoveTerm(d){
  
    $("#addtermbutton").attr("src", "images/loading.gif");  
    $.get('http://127.0.0.1:3000/deleteterm?term='+d.term,function(resp) {            
            LoadTerms(function(){});          
    });
}
function AddTerm(term){
    $("#addtermbutton").attr("src", "images/loading.gif");
    $.get('http://127.0.0.1:3000/addterm?term='+term,function(resp) {          
            LoadTerms(function(){});            
    });
}

/* Common to more than 1 view */
function SelectOnScatterplot(document){   
    StrokeCircle(document.docname)
}
function OpenDocument(name){
    $.get('http://127.0.0.1:3000/getdocument?docname='+name,function(resp) {                           
        document.getElementById("docview").value = resp;            
    });   
    
}
function SetDocumentAsRelevant(document, source){    
    
    $("#suggestiontoggle")[0].disabled = true;
    $("#focustoggle")[0].disabled = true;   
    $("#suggestioncontainer").css("visibility", "hidden")
    $("#focuscontainer").css("visibility", "hidden")
    
    
    if (document.docname){     
        var color = ScatterplotColor(document.docname);
        if (color == colorNotRelevant){
            source = 'notrelevant'
        }
        if (color == colorSuggestion){
            source = 'suggestion'
        }
        $.get('http://127.0.0.1:3000/setasrelevant?docname='+document.docname +'&source=' + source ,function(resp) {    
            
            console.log(resp)   
            LoadFocusList(function(){               
                if (source != 'scatter'){                    
                    LoadSuggestionList(function(){
                       UpdateScatterplotColors(document.docname); 
                    })                  
                }else{
                    LoadSuggestionList(function(){})
                }
            });


        });
    }else{       
        var color = ScatterplotColor(document.name);
        if (color == colorNotRelevant){
            source = 'notrelevant'
        }
        if (color == colorSuggestion){
            source = 'suggestion'
        }
         $.get('http://127.0.0.1:3000/setasrelevant?docname='+document.name+'&source=' + source ,function(resp) {    
             
            console.log(resp)   
            LoadFocusList(function(){
                if (source != 'scatter'){                    
                    LoadSuggestionList(function(){
                        UpdateScatterplotColors(document.docname);
                    })                   
                }else{
                    LoadSuggestionList(function(){})
                }             
            });

        }); 
    }    
}
function SetDocumentAsNotRelevant(document, origin){   
    var document_name;
    if (origin == 'scatter'){
        document_name = document.name;
        var color = ScatterplotColor(document.name);
        if (color == colorFocus){
            origin = 'focus';
        }else if (color == colorSuggestion){
            origin = 'suggestion'
        }   
    }else{
         document_name = document.docname;   
    }
    var uri = encodeURI('http://127.0.0.1:3000/setasnotrelevant?docname='+ document_name + '&origin='+origin);
    if (origin == 'suggestion'){
        $("#suggestiontoggle")[0].disabled = true;
        $("#suggestioncontainer").css("visibility", "hidden")
    }else if (origin == 'focus'){
        $("#focustoggle")[0].disabled = true;
        $("#suggestiontoggle")[0].disabled = true;
        $("#suggestioncontainer").css("visibility", "hidden")
        $("#focuscontainer").css("visibility", "hidden")      
    }  
    $.get(uri,function(resp) {    
        console.log(resp)      
        if (origin == 'suggestion'){
            saveNotRelevantList();
            LoadSuggestionList(function(){
               UpdateScatterplotColors(document.docname) 
            });                  
        }else if (origin == 'focus'){        
            LoadFocusList(function(){    
               LoadSuggestionList(function(){
                    UpdateScatterplotColors(document.docname) 
               });
            });         
        }else{
            saveNotRelevantList();
        }        
    });    
}
