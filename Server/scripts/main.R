#This script is the only one that communicates with the server (index.js). 
#It receives commands and calls the respective functions. 

needs("jsonlite");
needs("stringr")
needs("stringi");
needs(corpus)
needs(textstem);
needs(ngram)
needs(openNLP)
needs(qdap)
needs(tm)
needs(fastrtext);

#When running the code from RStudio, you need to comment the lines above and uncomment the lines bellow
# library("stringi");
# library("stringr")
# library("jsonlite")
# library(tm)
# library(corpus)
# library(textstem)
# library(ngram)
# library(qdap)
# library(fastrtext)


attach(input[[1]])

## commands to run from RStudio. Obs: You will need to comment the line above: attach(input[[1]])

# command = "init";
# baseDocument = "E:/Documents/USP/Projeto Mestrado/mestrado/The Project/data/teste/ILP-1297Ale37-44.txt";
# corpus = "E:/Documents/USP/Projeto Mestrado/mestrado/The Project/data/teste";
# username = "mo";
# path_core = "../../core/teste";
# path_users = "../../file/teste/mo";
# embtech = "bagofwords";
# workingdir = "E:/Documents/USP/Projeto Mestrado/github/TRIVIR/Server/scripts";

############################################################################################

setwd(workingdir);

if (command == "init"){
  dir.create(file.path("../../core/", basename(corpus)), showWarnings = FALSE)
  dir.create(file.path("../../file/", basename(corpus)), showWarnings = FALSE)
  dir.create(file.path(sprintf("../../file/%s/", basename(corpus)), username), showWarnings = FALSE)

  if ((!file.exists(sprintf("%s/wordembedding.csv", path_core)))||(!file.exists(sprintf("%s/signature.json", path_core)))){
    source("init.R")
    saveDocumentRepresentation(corpus, path_core);
  }
  if (!file.exists(sprintf("%s/bagofwords.csv", path_core))){
    source("tfidf.R");
    createBagofWords(corpus, path_core);
  }
  if (!file.exists(sprintf("%s/model.bin", path_core))){
    source("init.R")
    suppressMessages(createModel(path_core));
  }
  #distance to the query document
  if (!file.exists(sprintf("%s/cosdistance.csv", path_users))){
    source("init.R")
    saveCosDistance(baseDocument, path_core, path_users, embtech);
  }
   
  #Term's visualization
  if (!file.exists(sprintf("%s/ImportantTerms.json", path_users))){
    source("tfidf.R");
    saveMostImportantTerms(baseDocument, corpus, path_core, path_users);
  }
 
  print("success");


}else if (command == "scatterplotdata"){
  source("scatterplot.R")
  if (!file.exists(sprintf("%s/coordinates.json", path_users))){
    CreateScatterplotCoordinates(path_core, path_users, projtech, embtech);
  }
  print("success");
}else if (command == "focuslist"){

  if (!file.exists(sprintf("%s/focuslist.json", path_users))){
    source("focus.R");
    createFocusList(path_users, corpus, baseDocument);
  }
  
  print("success");
  
}else if (command == "suggestion"){
  
  if (!file.exists(sprintf("%s/suggestionlist.json", path_users))){
    source("textclassifier.R")
    fasttextClassifier(corpus, path_users, path_core)
  }
  
  print("success");
  
}else if (command == "gettitle"){
  
  source("corpussettings.R");
  title <- getTitle(corpus, docname);
  
  print(title)
  
}else if (command == "retrainclassifier"){
  
  source("textclassifier.R");
  retrainClassifier(path_users, corpus);
  
  print("success");
  
}else if (command == "setrelevantngrambatch"){
  source("labelDocuments.R");
  setRelevantNgramBatch(ngram, path_users, corpus);
  print("success");
  
}else if (command == "setnotrelevantngrambatch"){
  source("labelDocuments.R");
  setNotRelevantNgramBatch(ngram, path_users, corpus);
  print("success");
  
}else if (command == 'setsimilarasrelevantbatch'){
  source("labelDocuments.R");
  doclist <- c();
  doclist <- setRelevantSimilarBatch(document, path_users, path_core, corpus, embtech);
  
  return(doclist);
  
}else if (command == 'setsimilarasnotrelevantbatch'){
  source("labelDocuments.R");
  setNotRelevantSimilarBatch(document, path_users, path_core, corpus, embtech);
  
  print("success");
  
}else if (command == 'getsynonyms'){
  
  source("corpussettings.R");
  syn_nn <- c();
  syn_nn <- getSynonyms(term, path_core);
  return(syn_nn);
  
}else if (command == "addterm"){

  source("corpussettings.R");
  addTerm(term, path_core, path_users, corpus);
  
  print("success");
  
}
