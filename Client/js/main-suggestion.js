function SuggestionBarClick(d, bar, barWidth, barColor, barHeight){
    d3.selectAll(".bartitlesSug-rect")
        .style("fill", "white")
    d3.select(bar)
        .style("fill", "#ffb3b3")
        .style("fill-opacity", 1);    
    SelectOnScatterplot(d);
    OpenDocument(d.docname);
    //Removing any existing menu
    d3.selectAll(".barmenu")
        .remove()
    //Disabiling scroll    
    d3.select("#suggestioncontainer")
        .style("overflow-x", "auto")
        .style("overflow-y", "hidden")
    //Creating a new menu
    //Defining the div that will contain the menu                 
    var options = d3.select("div#menucontainer").append("svg")     
            .attr("class", "barmenu")
            .attr("width", barWidth + 30)
            .attr("height", function(){
                return barHeight + 10                        
            })
            .attr("fill","#d8eaff")
    //Positioning the div                 
    yPos = bar.getBBox().y - $("#suggestioncontainer").scrollTop() + $("#termscontainer").height() + 65 ;
    d3.select("div#menucontainer")
        .style("left", (barWidth ) + "px")
        .style("top", function(){return yPos+ "px"})
    //Defining the background (rect) for the buttons
    options.append("rect")
        .attr("class","barmenu")
        .attr("height", barHeight)
        .attr("width", 100)
        .attr("fill", "#a9a9a9")                        
        .attr("y", 8)
        .attr("x", 0)                
    //Defining the close button     
    options.append("svg:image")
        .attr("class", "barmenu")
        .attr("xlink:href", "images/close.png")
        .attr("width", "20px")
        .attr("y", 0)
        .attr("x", 90) 
        .on("click", function(){                              
            d3.selectAll(".bartitlesSug-rect")
                .style("fill", barColor)
            d3.selectAll(".barmenu")
                .remove() 
            //Enabling scroll
            d3.select("#suggestioncontainer")
                .style("overflow-y", "scroll")
        })
    //Defining the delete buttton
    options.append("svg:image")
        .attr("class", "barmenu")
        .attr("xlink:href", "images/error.png")
        .attr("width", "25px")
        .attr("y", 10)
        .attr("x", 10) 
        .on("click", function(){
            d3.selectAll(".bartitlesSug-rect")
                .style("fill", barColor)
            d3.selectAll(".barmenu")
                .remove()
            //Enabling scroll
            d3.select("#suggestioncontainer")
                .style("overflow-y", "scroll")
            SetDocumentAsNotRelevant(d, 'suggestion');  
        })
        //Defining the add button
        options.append("svg:image")
            .attr("class", "barmenu")
            .attr("xlink:href", "images/navigation-1.png")
            .attr("width", "25px")
            .attr("y", 10)
            .attr("x", 50) 
            .on("click", function(){                              
                d3.selectAll(".bartitlesSug-rect")
                    .style("fill", barColor)
                d3.selectAll(".barmenu")
                    .remove()
                //Enabling scroll
                d3.select("#suggestioncontainer")
                    .style("overflow-y", "scroll")
                SetDocumentAsRelevant(d, 'suggestion');
                        
            })
    
}
function LoadNotRelevantList(callback){
    saveNotRelevantList();
    callback();    
}
function LoadSuggestionList(callback) {
    d3.request("http://127.0.0.1:3000/suggestionlist")    
     .header("Content-Type", "application/json")
     .post(function(error, d){
   
    //PARAMETERS AND VARIABLES    
       
    dataSuggestionList = JSON.parse(d.responseText);   
    saveSuggestionList(dataSuggestionList)
 

    d3.select(".suggestion-svg").remove();
    $("#suggestiontoggle")[0].disabled = false;      

    var margin = {top: 40, right: 20, bottom: 0, left: 40},
        width = $("#listcontainer").width(), //+svg.attr("width") - margin.left - margin.right,
        height = window.innerHeight - margin.top - margin.bottom - $("#termscontainer").height(),
        svg = d3.select("#suggestioncontainer").append("svg"),
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
    var barHeight = 30;  
    var barWidth = width;
    var barColor = "#FFFFFF";
    var max = 0;
    dataSuggestionList.forEach(function(d){       
       if (getTextWidth(d.title, "15px Arial") > max){
           max = getTextWidth(d.title, "15px Arial");
       }  
    })
    if (max < barWidth){
        max = barWidth;   
    }  
    var TitlesBarWidth = max;    
    d3.select("#suggestioncontainer")        
        .style("height", height + "px")
        .style("width", width + "px")
        .style("overflow", "auto")  
        
    svg.attr("height", dataSuggestionList.length*barHeight)
       .attr("width", TitlesBarWidth)         
       .attr("class", "suggestion-svg")
       
    svg.selectAll(".bartitlesSug-rect")
        .data(dataSuggestionList)     
        .enter()           
        .append("rect")
            .attr("height",barHeight)
            .attr("width",TitlesBarWidth)
            .attr("y", function(d, index){                 
                 return index * barHeight;   
            })
            .attr("x", 0)
            .style("fill", "white")  
            .attr("class", "bartitlesSug-rect")
            .on("click", function(d,i){
                SuggestionBarClick(d, this, barWidth, barColor, barHeight);
             }); 
     svg.selectAll(".label")
            .data(dataSuggestionList)
            .enter()        
            .append("text")
            .text(function(d){ return d.title;})
            .attr("y", function(d, index){                    
                return index * barHeight + barHeight/2 + 5;   
            })
            .attr("class", "label")
            .attr("x", 10)
            .attr("font-size", "15px")
            .attr("fill", "black")                
            .on("click", function(d,i){                        
                var rect = d3.selectAll(".bartitlesSug-rect")._groups[0][i];
                SuggestionBarClick(d, rect, barWidth, barColor, barHeight);
             });      
       callback();
        
 });
 $("#retrainbutton").unbind().click(function(e){  
         RetrainClassifier();
 });
}

