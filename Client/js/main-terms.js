function getTextWidth(text, font) {
        // if given, use cached canvas for better performance
        // else, create new canvas
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        context.font = font;
        var metrics = context.measureText(text);
        return metrics.width;
} 
var dataTerms;
function LoadTerms(callback){
    d3.request("http://127.0.0.1:3000/terms")    
     .header("Content-Type", "application/json")
     .post(function(error, d){

        //PARAMETERS AND VARIABLES
       
        dataTerms = JSON.parse(d.responseText);      
        
        d3.select(".terms-svg").remove();
        $("#addtermbutton").attr("src", "images/add-1.png");
        var svg = d3.select("#termsrectcontainer").append("svg"),
        margin = {top: 20, right: 0, bottom: 0, left: 40},
        width = window.innerWidth - margin.left - margin.right, 
        height = 55,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
        var barHeight = 30;
        var barWidth = 150;
        var barMargin = 10;
        d3.select("#termsrectcontainer")        
            .style("height", height+"px")            
            .style("overflow-x", "auto")  
            .style("overflow-y", "hidden")
        var bwidth = 0;
        dataTerms.forEach(function(d, index){
            if (d.show == true)
                bwidth = bwidth + getTextWidth(d.term, "20px Arial") + 55;
        })    
        bwidth = bwidth + (dataTerms.length) * barMargin + barMargin;
        svg.attr("height", height)
           .attr("width", bwidth)              
           .attr("class", "terms-svg")
        var sumrect = 0;
        var i = 0;
        var rectwidth = [];
        svg.selectAll("rect")
            .data(dataTerms.filter(function(d){ return d.show == true;}))     
            .enter()           
            .append("rect")
                .attr("height",barHeight)
                .attr("width", function(d){ return getTextWidth(d.term, "15px Arial") + 55;})
                .attr("x", function(d, index){
                     x = index * barMargin + sumrect + barMargin;
                     sumrect = sumrect + (+this.getAttribute("width"));    
                     rectwidth[i] = +this.getAttribute("width");
                     i = i + 1;
                     return x;   
                })
                .attr("y", height/2 - barHeight/2)
                .style("fill", "#212121")              
                .style("stroke-width", "2px")
                .style("stroke", "#7fdfff")
                .attr("rx", 5)
                .attr("class", "terms-bar")
            .on("click", function(d, i){
                d3.selectAll(".termslist")
                    .remove()                 
                AppendSynonyms(d.synonyms, barHeight, rectwidth, barMargin, i);
                
                     
            })
        sumrect = 0;
        svg.selectAll(".barterms")        
            .data(dataTerms.filter(function(d){  return d.show == true;}))
            .enter()
            .append("svg:image")
            .attr("class", "barterms")
            .attr("xlink:href", "images/close2.png")
            .attr("width", "20px")
            .attr("height", "20px")
            .attr("y", height/2 - barHeight/2 + 5)
            .attr("x", function(d, index){   
                    x = index * barMargin + sumrect + barMargin + rectwidth[index] - 25;
                    sumrect = sumrect + rectwidth[index];                 
                    return x;                   
            }) 
            .on("click", function(d, i){          
                d3.selectAll(".terms-bar")._groups[0][i].remove();
                d3.selectAll(".label-terms")._groups[0][i].remove();
                d3.select(this).remove();                          
                RemoveTerm(d);
            
            })
                
         sumrect = 0;
         svg.selectAll(".label-terms")
            .data(dataTerms.filter(function(d){  return d.show == true;}))
            .enter()        
            .append("text")
            .text(function(d){ return d.term})
            .attr("x", function(d, index){            
                    x = index * barMargin + sumrect + barMargin + 10;
                    sumrect = sumrect + rectwidth[index];                 
                    return x; 
                     
            })
            .attr("y", barHeight/2 + 18)
            .attr("class", "label-terms")           
            .attr("font-size", "15px")
            .attr("fill", "white") 
            .on("click", function(d, i){
                d3.selectAll(".termslist")
                    .remove()                 
                AppendSynonyms(d.synonyms, barHeight, rectwidth, barMargin, i);
             
             
             })
        callback();  
    });
}
function AppendSynonyms(terms, barHeight, rectwidth, barMargin, i){
    var max = 0;
    for (var index = 0; index < terms.length; index++){
        if (max < (getTextWidth(terms[index], "15px Arial") + 55)){
            max = (getTextWidth(terms[index], "15px Arial") + 55);
        }
    }
    var termslist = d3.select("div#menutermscontainer").append("svg")     
                    .attr("class", "termslist")
                    .attr("width", max + 20)
                    .attr("height", function(){                                        
                            if (terms.length == 1){
                                    return  2*barHeight + 10 ;
                            }
                            return terms.length * barHeight + barHeight + 20                        
                    })
                    .attr("fill","#d8eaff")
    //Positioning the div                 
    yPos = 0;
    var sumrect = 0;
    for (var index = 0; index < i; index++){
             sumrect = sumrect + (rectwidth[index])
    }
    
    d3.select("div#menutermscontainer")
            .style("left", i * barMargin + sumrect   + "px")
            .style("top", function(){return yPos+ "px"})


    terms.forEach(function(term, index){                        
        termslist.append("rect")               
                 .attr("class", "termslist-rect")
                 .attr("height", barHeight)
                 .attr("width", max) 
                 .attr("fill","#d8eaff")                            
                 .attr("y", function(){                            
                       return index * barHeight + barHeight + 20;   
                 })
                 .attr("x", 15)                                 
        termslist.append("text")
                 .attr("class", "label")
                 .text(term)
                 .attr("y", function(){                            
                       return index * barHeight + barHeight/2 + barHeight + 20;  
                  })
                  .attr("x", 25)                      
    })
    termslist.append("svg:image")
             .attr("class", "termslist")
             .attr("xlink:href", "images/close.png")
             .attr("width", "20px")
             .attr("y", barHeight + 10)
             .attr("x", function(){
                  return 0;
              }) 
             .on("click", function(){                                                       
                  d3.selectAll(".termslist")
                      .remove()                           
             })    
}
$("#addtermbutton").unbind().click(function(e){  
    if (($("#addtermbutton").attr("src") != "images/loading.gif")&&(document.getElementById('addterminput').value != "")){        
        AddTerm(document.getElementById('addterminput').value);  
        document.getElementById('addterminput').value = "";        
    } 
    
})