
var barColor = "#FFFFFF";

$(document).ready(function() {
    $("#focuscontainer")[0].style.visibility = 'hidden';
    $("#suggestioncontainer")[0].style.visibility = 'hidden';
    $("#signaturecontainer")[0].style.visibility = 'visible';


    $(".btn-group").on("change", function(e){
      
      var target = e.target.getAttribute("id");
      if (target == "signaturetoggle"){
        if (($("#signaturecontainer")[0].style.visibility == 'hidden') && ($("#signaturetoggle")[0].disabled == false)){  
            
            d3.selectAll(".barmenu")
                .remove()
            d3.selectAll(".bar-rect")
                    .style("fill", barColor)
            $("#focuscontainer")[0].style.visibility = 'hidden';
            $("#suggestioncontainer")[0].style.visibility = 'hidden';
            $("#signaturecontainer")[0].style.visibility = 'visible';
          
        }else if ($("#signaturecontainer")[0].style.visibility == 'visible'){          
            $("#signaturecontainer")[0].style.visibility = 'hidden'; 
        }     
      }else if (target == "focustoggle"){
        if (($("#focuscontainer")[0].style.visibility == 'hidden')&& ($("#focustoggle")[0].disabled == false)){                 d3.selectAll(".barmenu")
                .remove()  
            d3.selectAll(".bartitles-rect")
                .style("fill", barColor)                                                                                                          
                                                                                            
            $("#suggestioncontainer")[0].style.visibility = 'hidden';
            $("#signaturecontainer")[0].style.visibility = 'hidden';
            $("#focuscontainer")[0].style.visibility = 'visible';     
       
        }else if ($("#focuscontainer")[0].style.visibility == 'visible'){
            $("#focuscontainer")[0].style.visibility = 'hidden';    
        }   
          
      }else if (target == "suggestiontoggle"){
          if (($("#suggestioncontainer")[0].style.visibility == 'hidden')&& ($("#focustoggle")[0].disabled == false)){        d3.selectAll(".barmenu")
                .remove() 
              d3.selectAll(".bartitlesSug-rect")
                .style("fill", barColor)                                                                                                                  
            $("#suggestioncontainer")[0].style.visibility = 'visible';
            $("#signaturecontainer")[0].style.visibility = 'hidden';
            $("#focuscontainer")[0].style.visibility = 'hidden';   
    
        }else if ($("#suggestioncontainer")[0].style.visibility == 'visible'){
            $("#suggestioncontainer")[0].style.visibility = 'hidden';
        }   
     }
    })   
});