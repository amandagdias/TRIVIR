var filter_list = []
var dataServer;
var signaturelist = [];

function init(update, callback) {  
    d3.request("http://127.0.0.1:3000/signature")    
     .header("Content-Type", "application/json")
     .post(function(error, d){
        console.log(d);
        if (d!= undefined){
           //PARAMETERS AND VARIABLES
            dataServer = JSON.parse(d.responseText);
            dataServer.forEach(function(d, index){
                signaturelist[index] = d.ngram.replace(/\s+/g,' ').trim();        
            });
            LoadSignature(update, callback);         
        }          
  
    });
}
function barClick(d, bar, barColor, barWidth, barHeight){
    //Changing style of bar
    d3.selectAll(".bar-rect")
        .style("fill", barColor)
    d3.select(bar)
        .style("fill", "#ffb3b3")
        .style("fill-opacity", 1);                    
    //Removing any existing menu
    d3.selectAll(".barmenu")
        .remove()
    //Disabiling scroll
    d3.select("#signaturecontainer")
        .style("overflow-x", "auto")
        .style("overflow-y", "hidden")
    //Creating a new menu
    //Defining the div that will contain the menu                 
    var ngramlist = d3.select("div#menucontainer").append("svg")     
                        .attr("class", "barmenu ngramlist")
                        .attr("width", barWidth + 30)
                        .attr("height", function(){  
                            console.log(d.ngramlist.length)
                            if (d.ngramlist.length == 1){
                                return  2*barHeight + 10 ;
                            }
                            return d.ngramlist.length * barHeight + barHeight + 10                        
                        })
                        .attr("fill","#d8eaff")
     //Positioning the div                 
     yPos = bar.getBBox().y - $("#signaturecontainer").scrollTop() + $("#termscontainer").height() + 85;

     d3.select("div#menucontainer")
            .style("left", (barWidth ) + "px")
            .style("top", function(){return yPos+ "px"})
    //Defining the background (rect) for the buttons
    ngramlist.append("rect")
        .attr("class","barmenu")
        .attr("height", barHeight)
        .attr("width", 50)
        .attr("fill", "#a9a9a9")                        
        .attr("y", 8)
        .attr("x", 0)                
    //Defining the close button      
     ngramlist.append("svg:image")
            .attr("class", "barmenu")
            .attr("xlink:href", "images/close.png")
            .attr("width", "20px")
            .attr("y", 0)
            .attr("x", function(){
                return 45;
            }) 
            .on("click", function(){                              
                d3.selectAll(".bar-rect")
                    .style("fill", barColor)
                d3.selectAll(".barmenu")
                    .remove()
                //Enabling scroll
                d3.select("#signaturecontainer")
                    .style("overflow-y", "scroll")
            })

      //Defining the button to visualize the documents with the ngram
      ngramlist.append("svg:image")
            .attr("class", "barmenu")
            .attr("xlink:href", "images/search.png")
            .attr("width", "25px")
            .attr("y", 10)
            .attr("x", function(){
                return 10;
            }) 
            .on("click", function(){                       
               showDocumentsWithNgram(d.ngram);
                //Defining the delete buttton
                ngramlist.attr("height", 2*barHeight + 10)
                ngramlist.append("rect")
                        .attr("class","barmenu")
                        .attr("height", barHeight)
                        .attr("width", 90)
                        .attr("fill", "#a9a9a9")                        
                        .attr("y", 38)
                        .attr("x", 0)   
                 ngramlist.append("svg:image")
                        .attr("class", "barmenu")
                        .attr("xlink:href", "images/error.png")
                        .attr("width", "25px")
                        .attr("y", 40)
                        .attr("x", 10) 
                        .on("click", function(){                              
                            d3.selectAll(".bar-rect")
                                .style("fill", barColor)
                            d3.selectAll(".barmenu")
                                .remove()
                            //Enabling scroll
                            d3.select("#signaturecontainer")
                                .style("overflow-y", "scroll")
                            setNotRelevantDocumentsWithNgram(d.ngram)
                 })
                 //Defining the button to set documents with ngram relevant
                 ngramlist.append("svg:image")
                        .attr("class", "barmenu")
                        .attr("xlink:href", "images/navigation-1.png")
                        .attr("width", "25px")
                        .attr("y", 40)
                        .attr("x", function(){
                            return 50;
                        }) 
                        .on("click", function(){                                  
                          d3.selectAll(".bar-rect")
                              .style("fill", barColor)
                          d3.selectAll(".barmenu")
                              .remove()
                          //Enabling scroll
                          d3.select("#signaturecontainer")
                              .style("overflow-y", "scroll")
                          setRelevantDocumentsWithNgram(d.ngram);                             
                  }) 

        }) 
}
function LoadSignature(update, callback){
 
    if (filter_list.length > 0){       
       data = dataServer.filter(function(d){ if (filter_list.includes(d.ngram) == true) return true; else{ return false;}})        
    }else{
       data = dataServer; 
    }  
        
    d3.select(".signature-svg").remove();
    $("#signaturetoggle")[0].disabled == false;
 
    var color = d3.scaleSequential(d3["interpolateBlues"])
                .domain([0, d3.max(data.filter(function(d){ return d.show == true; }).map(function(d){return d.freq}))]);  
    
    var svg = d3.select("#signaturecontainer").append("svg"),
        margin = {top: 60, right: 20, bottom: 0, left: 40},
        width = $("#listcontainer").width()  , 
        height = window.innerHeight - margin.top - $("#termscontainer").height() ,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
    var barHeight = 30;
    var barWidth = width;
    var barColor = "#FFFFFF";
    var max = 0;
    data.forEach(function(d){       
       if (getTextWidth(d.ngram, "15px Arial") > max){
           max = getTextWidth(d.ngram, "15px Arial");
       }  
    })
    if (max < barWidth){
        max = barWidth;
    }
    var TitlesSignatureBarWidth = max;      
     d3.select("#signaturecontainer")        
        .style("height", height+"px")
        .style("width", width + "px")
        .style("overflow", "auto") 
        
    svg.attr("height", data.filter(function(d){ return d.show == true; }).length*barHeight)
       .attr("width", TitlesSignatureBarWidth + 30)         
       .attr("class", "signature-svg")
    svg.selectAll(".bar-rect")
        .data(data.filter(function(d){ return d.show == true; }))     
        .enter()           
        .append("rect")
            .attr("height",barHeight)
            .attr("width",TitlesSignatureBarWidth + 30)
            .attr("y", function(d, index){                 
                 return index * barHeight;   
            })
            .attr("x", 0)
            .style("fill", barColor) 
            .attr("class", "bar-rect")
            .on("click", function(d,i){               
                barClick(d, this, barColor, barWidth, barHeight);
               
            }) 

     svg.selectAll(".bar-rect-color")
        .data(data.filter(function(d){ return d.show == true; }))     
        .enter()           
        .append("rect")
            .attr("height",barHeight)
            .attr("width", 30)
            .attr("y", function(d, index){                 
                 return index * barHeight;   
            })
            .attr("x", 0)
            .style("fill", function(d) { return color(d.freq); })  
            .attr("class", "bar-rect-color")          
        
     svg.selectAll(".label")
            .data(data.filter(function(d){ return d.show == true; }))
            .enter()        
            .append("text")
            .text(function(d){ return d.ngram})
            .attr("y", function(d, index){                    
                return index * barHeight + barHeight/2 + 5;   
            })
            .attr("class", "label")
            .attr("x", function(d){
                return 40; //barWidth/2 - (this.getBBox().width / 2) + 30
            })
            .attr("font-size", "15px")
            .attr("fill", "black")  
            .on("click",function(d,i){
                var rects = d3.selectAll(".bar-rect")._groups[0];
                bar = rects[i];                
                barClick(d, bar, barColor, barWidth, barHeight);
            })
    callback();
}        


$("#resetsignaturebutton").unbind().click(function(e){  
   
    $("#resetsignaturebutton").css("visibility", "hidden");    
    $("#resultCount").css("visibility", "hidden");
    document.getElementById('searchngraminput').value = ""; 
    filter_list = [];
    if (dataServer.length <= 0){
        init("one", function(){});
        
    }else{        
        LoadSignature("one", function(){});
    }
    
})

$("#filtersignaturebutton").unbind().click(function(e){

    $("#resetsignaturebutton").css("visibility", "visible");
   
    var bars = d3.selectAll(".bar-rect")._groups[0];        
        
    var k = 0;
    filter_list = [];
    for (var i = 0; i < bars.length; i++){ 
        if (bars[i].__data__.ngram != undefined){
            var ngram_name = bars[i].__data__.ngram.toLowerCase();
            for (var j = 0; j < dataTerms.length; j++){
                if(ngram_name.includes(dataTerms[j].term)){
                    filter_list[k] = bars[i].__data__.ngram;   
                    k = k + 1;
                    break;
                }              
            }                 
        } 
    } 
    $("#resultCount").css("visibility", "visible");
    document.getElementById('resultCount').innerHTML = "results: "+filter_list.length;
    if (dataServer.length <= 0){
        init("one", function(){});
    }else{
        LoadSignature("one", function(){
            
        });
    }   
})

$("#searchngrambutton").unbind().click(function(e){  
    filter_list = [];
    LoadSignature("one", function(){});
    var text = document.getElementById('searchngraminput').value;
    if ((text != undefined)&&(text != "")){
        $("#resetsignaturebutton").css("visibility", "visible");
        
        var bars = d3.selectAll(".bar-rect")._groups[0];     
        
        var k = 0;
        filter_list = [];
        for (var i = 0; i < bars.length; i++){ 
            if (bars[i].__data__.ngram != undefined){
                var ngram_name = bars[i].__data__.ngram.toLowerCase();
                text = text.toLowerCase();
                if(ngram_name.includes(text)){
                    filter_list[k] = bars[i].__data__.ngram;   
                    k = k + 1;
                }            
            } 
        } 
        $("#resultCount").css("visibility", "visible");
        document.getElementById('resultCount').innerHTML = "results: "+filter_list.length;
        if (dataServer.length <= 0){
            init("one", function(){});
        }else{
            LoadSignature("one", function(){});
        }   
    }
})

init("all", function(){
    LoadTerms(function(){
        LoadFocusList(function(){
            LoadSuggestionList(function(){                        
                LoadNotRelevantList(function(){
                    if (d3.select("#scatterplotcontainer")._groups[0][0].children.length == 0){
                        LoadScatterplot();
                    }
                })                            
            })
        })
    }) 
});    