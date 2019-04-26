var svg;
var xScale;
var yScale;
var datascatterplot;
var colorFocus = "#17a2b8";
var colorSuggestion = "#ffc107";
var colorNotRelevant = "#d75a4a";
var colorBase = "#007527";
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? "rgb(" + [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ].join(', ') + ")" : null;
}
function LoadScatterplot() {
     d3.request("http://127.0.0.1:3000/scatterplot")    
     .header("Content-Type", "application/json")
     .post(function(error, d){
   
        //PARAMETERS AND VARIABLES
        datascatterplot = JSON.parse(d.responseText);    
       
        d3.select(".scatterplot-svg").remove();
        
        // add the tooltip area to the webpage
        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);      
       
        svg = d3.select("#scatterplotcontainer").append("svg"),
            margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = $("#scatterplotcontainer").width() - 10, // - margin.left - margin.right,
            height = window.innerHeight - margin.top - margin.bottom - $("#termscontainer").height(),
            g = svg.append("g").attr("transform", "translate(" + (margin.left) + "," + margin.top + ")");
         
        var barHeight = 30;  
        var barWidth = 110;
         
        // setup x 
        var xValue = function(d) { return +d.X1;}; // data -> value
        xScale = d3.scaleLinear().range([0, width]).nice(); // value -> display
        var xMap = function(d) { return xScale(xValue(d));} // data -> display     

        // setup y
        var yValue = function(d) { return +d.X2;}; // data -> value
        yScale = d3.scaleLinear().range([height, 0]).nice(); // value -> display
        var yMap = function(d) { return yScale(yValue(d));} // data -> display           
        
        xScale.domain([d3.min(datascatterplot, xValue)-1, d3.max(datascatterplot, xValue)+1]);
        yScale.domain([d3.min(datascatterplot, yValue)-1, d3.max(datascatterplot, yValue)+1]); 
             
       var zoomBeh = d3.zoom()
        .scaleExtent([.5, 20])
        .extent([[0, 0], [width, height]])
       .on("zoom", zoom);
         
        d3.select("#scatterplotcontainer")        
              .style("height", height+"px")
              .style("width", width +"px")        
        svg.attr("height", height)
                 .attr("width", width)         
                 .attr("class", "scatterplot-svg")
                 .call(zoomBeh)
      
        
        svg.selectAll(".dot")
          .data(datascatterplot)
          .enter().append("circle")         
          .attr("r", 6)
          .attr("cx", xMap)
          .attr("cy", yMap)    
          .style("fill", function(d) {return ScatterplotColor(d.name)})  
          .style("stroke", "#000")
          .attr("class", "dot")
          .on("mouseover", function(d) {           
              d3.transition()
                   .duration(200)
                   .select('.tooltip')                   
                   .style("opacity", .9)                   
              tooltip.html("<tooltiptext>"+d.name+"</tooltiptext>")
                   .style("width", (getTextWidth(d.name, "12px Arial") + 20) + "px")
                   .style("left", svg.node().getBoundingClientRect().left + "px")
                   .style("top", svg.node().getBoundingClientRect().top + "px") 
          })
          .on("mouseout", function(d) {
              d3.transition()
                   .duration(500)
                   .select('.tooltip') 
                   .style("opacity", 0); 
          })
          .on("click", function(d, i){ 
            d3.selectAll(".dot").style("stroke-width", "1px")
            if (d3.select(this).style("stroke-width") == "1px"){                
                d3.select(this).style("stroke-width", "3px")
                OpenDocument(d.name);
                var selected_circle = d3.select(this);
                //Removing any existing menu
                d3.selectAll(".barmenu")
                    .remove()    
                if (($("#focustoggle")[0].disabled == false) && ($("#signaturetoggle")[0].disabled == false) && ($("#suggestiontoggle")[0].disabled == false) && (selected_circle.style("fill") != hexToRgb(colorBase))){
                    //Creating a new menu
                    //Defining the div that will contain the menu                 
                     var options_scatter = d3.select("div#menucontainer").append("svg")     
                                        .attr("class", "barmenu")
                                        .attr("width", function(){
                                            return barWidth;
                                        })
                                        .attr("height", function(){
                                            return barHeight + 10                        
                                        })
                                        .attr("fill","#d8eaff")
                     //Positioning the div                 
                     yPos = d3.event.pageY - 35;

                     d3.select("div#menucontainer")
                            .style("left", function(){
                                if ((selected_circle.style("fill") != hexToRgb(colorFocus)) && (selected_circle.style("fill")) != hexToRgb(colorNotRelevant)){
                                    return (d3.event.pageX - 110) + "px";
                                }else{
                                    return (d3.event.pageX - 55) + "px";
                                }       

                            })
                            .style("top", function(){return yPos+ "px"})
                    //Defining the background (rect) for the buttons
                    options_scatter.append("rect")
                        .attr("class","barmenu")
                        .attr("height", barHeight)
                        .attr("width", 100)
                        .attr("fill", "#a9a9a9")                        
                        .attr("y", 8)
                        .attr("x", 0)                
                    //Defining the close button      
                     options_scatter.append("svg:image")
                            .attr("class", "barmenu")
                            .attr("xlink:href", "images/close.png")
                            .attr("width", "20px")
                            .attr("y", 0)
                            .attr("x", function(){
                                return 90;
                            }) 
                            .on("click", function(){                            
                                d3.selectAll(".barmenu")
                                    .remove() 

                            })
                    //Defining the delete buttton
                    if (selected_circle.style("fill") != hexToRgb(colorNotRelevant)){
                         options_scatter.append("svg:image")
                                .attr("class", "barmenu")
                                .attr("xlink:href", "images/error.png")
                                .attr("width", "25px")
                                .attr("y", 10)
                                .attr("x", 10) 
                                .on("click", function(){                       
                                    d3.selectAll(".barmenu")
                                        .remove() 
                                    selected_circle.style("fill", hexToRgb(colorNotRelevant))
                                    SetDocumentAsNotRelevant(d, 'scatter')           

                                })  
                     }
                     if (selected_circle.style("fill") != hexToRgb(colorFocus)){
                        //Defining the add button
                        options_scatter.append("svg:image")
                            .attr("class", "barmenu")
                            .attr("xlink:href", "images/navigation-1.png")
                            .attr("width", "25px")
                            .attr("y", 10)
                            .attr("x", function(){
                                if (selected_circle.style("fill") == hexToRgb(colorNotRelevant)){
                                    return 10;
                                }else{
                                  return 50;  
                                }
                                
                            }) 
                            .on("click", function(){                        
                                d3.selectAll(".barmenu")
                                    .remove()  
                                selected_circle.style("fill", hexToRgb(colorFocus));
                                SetDocumentAsRelevant(d, 'scatter');                            
                            })     
                    }
                    if (selected_circle.style("fill") == hexToRgb(colorFocus)){
                        options_scatter.append("svg:image")
                            .attr("class", "barmenu")
                            .attr("xlink:href", "images/add-1.png")
                            .attr("width", "25px")
                            .attr("y", 10)
                            .attr("x", 50)                           
                            .on("click", function(){                        
                                d3.selectAll(".barmenu")
                                    .remove()
                                selected_circle.style("fill", hexToRgb(colorBase))
                                setSimilarDocumentsAsRelevant(d.name)                            
                            })
                        
                    }
                    if (selected_circle.style("fill") == hexToRgb(colorNotRelevant)){
                         options_scatter.append("svg:image")
                            .attr("class", "barmenu")
                            .attr("xlink:href", "images/addred.png")
                            .attr("width", "25px")
                            .attr("y", 10)
                            .attr("x", 50)                           
                            .on("click", function(){                        
                                d3.selectAll(".barmenu")
                                    .remove()  
                                
                                setSimilarDocumentsAsNotRelevant(d.name)                            
                            })                        
                    }              
                }                         
            }
         });          
          
    })

}
function zoom() {
    var new_xScale = d3.event.transform.rescaleX(xScale);
    var new_yScale = d3.event.transform.rescaleY(yScale);
    svg.selectAll(".dot")
        .attr('cx', function(d) {return new_xScale(d['X1'])})
        .attr('cy', function(d) {return new_yScale(d['X2'])});
}
function transform(d) {
    return "translate(" + xScale(d['X1']) + "," + yScale(d['X2']) + ")";
}

/* Functions called from control.js */

function StrokeCircle(docname){
    var circles = d3.selectAll(".dot")._groups[0]; 
    d3.selectAll(".dot").style("stroke-width", "1px")
    for (var i = 0; i < circles.length; i++){      
         if(circles[i].__data__.name == docname){
             var doc = circles[i];
             break;
         }       
    }
    doc.setAttribute("style", "fill: "+doc.style.fill+"; stroke: "+doc.style.stroke +"; stroke-width: 3px;");  
}

function UpdateScatterplotColors(name){    
    if (name != "null"){
        var circles = d3.selectAll(".dot")._groups[0];
    
        for (var i = 0; i < circles.length; i++){  
            if (circles[i].__data__.name == name){
                circles[i].setAttribute("style", "fill: "+ ScatterplotColor(circles[i].__data__.name)+"; stroke: "+circles[i].style.stroke +"; stroke-width: 1px; opactity: 1.0; visibility: "+circles[i].style.visibility)
                break;
            }       
        }  
    }else{
        
        var circles = d3.selectAll(".dot")._groups[0];
    
        for (var i = 0; i < circles.length; i++){ 
            circles[i].setAttribute("style", "fill: "+ ScatterplotColor(circles[i].__data__.name)+"; stroke: "+circles[i].style.stroke +"; stroke-width: 1px; opactity: 1.0; visibility: "+circles[i].style.visibility)      
        }         
    }
   
}

function FilterScatterplot(documents){
    $("#resetscatterplotbutton").css("visibility", "visible");
    k = +document.getElementById('filterscatterplotinput').value;
    k = k +1;    
    documents = documents.slice(0, k)
    
    d3.selectAll(".dot").style("visibility", "hidden")
    var circles = d3.selectAll(".dot")._groups[0]; 
    for (var i = 0; i < circles.length; i++){ 
        for (var j = 0 ; j < documents.length; j++){        
            if (circles[i].__data__.name == documents[j].replace(/['"]+/g, '')){
                
                circles[i].setAttribute("style", "fill: "+circles[i].style.fill+"; stroke: "+circles[i].style.stroke +"; stroke-width: 1px; opactity: 1.0; visibility: visible"); 
            }
            
        }        
    }      
    
}

function showDocumentsWithNgram(text){ 
    if ((text != undefined)&&(text != "")){
        $("#resetscatterplotbutton").css("visibility", "visible");
        d3.selectAll(".dot").style("visibility", "hidden")
   
        var circles = d3.selectAll(".dot")._groups[0]; 
        for (var i = 0; i < circles.length; i++){   
            circle_name = circles[i].__data__.body_preprocessed.toLowerCase();
            text = text.toLowerCase();
            if(circle_name.includes(text)){
                circles[i].setAttribute("style", "fill: "+circles[i].style.fill+"; stroke: "+circles[i].style.stroke +"; stroke-width: 1px; opactity: 1.0; visibility: visible");                         
            }        
        }   
    }  
}
/* Scatterplot Menu Buttons*/

$("#resetscatterplotbutton").unbind().click(function(e){  
    $("#resetscatterplotbutton").css("visibility", "hidden");
    d3.selectAll(".dot").style("visibility", "visible")
    d3.selectAll(".dot").style("opacity", "1.0")
    document.getElementById('searchdocumentinput').value = "";
    document.getElementById('filterscatterplotinput').value = "";
})

$("#searchdocumentbutton").unbind().click(function(e){
    var text = document.getElementById('searchdocumentinput').value;
    if ((text != undefined)&&(text != "")){
        $("#resetscatterplotbutton").css("visibility", "visible");
        d3.selectAll(".dot").style("visibility", "hidden")
   
        var circles = d3.selectAll(".dot")._groups[0]; 
        for (var i = 0; i < circles.length; i++){   
            circle_name = circles[i].__data__.body.toLowerCase();
            text = text.toLowerCase();
            if(circle_name.includes(text)){
                circles[i].setAttribute("style", "fill: "+circles[i].style.fill+"; stroke: "+circles[i].style.stroke +"; stroke-width: 1px; opactity: 1.0; visibility: visible");                         
            }        
        }   
    }
})

$("#filterrelevantsbutton").unbind().click(function(e){
   $("#resetscatterplotbutton").css("visibility", "visible");
   d3.selectAll(".dot").style("visibility", "hidden") 
   var circles = d3.selectAll(".dot")._groups[0]; 
   for (var i = 0; i < circles.length; i++){ 
       if ((circles[i].style.fill == hexToRgb(colorFocus))||(circles[i].style.fill == hexToRgb(colorBase))||(circles[i].style.fill == hexToRgb(colorSuggestion))){
           circles[i].setAttribute("style", "fill: "+circles[i].style.fill+"; stroke: "+circles[i].style.stroke +"; stroke-width: 1px; opactity: 1.0; visibility: visible"); 
           
       }  
    }   
    
});

$("#filterscatterplotbutton").unbind().click(function(e){
    
    k = document.getElementById('filterscatterplotinput').value;
    if ((k!=null)&&(k > 0)){
         getSimilarDocuments();     
    }
})