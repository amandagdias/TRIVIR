#This script is the only one that communicates with the server (index.js). 
#It receives commands and calls the respective functions. 


#install.packages("needs")
#install.packages("jsonlite")
# install.packages("stringr")
# install.packages("stringi")
#install.packages("qdap")
#print(input)
#install.packages('tm')
# if(! require("jsonlite")) install.packages("jsonlite", repos = "http://cran.us.r-project.org")
# if(! require("ngram")) install.packages("ngram", repos = "http://cran.us.r-project.org")
# if(! require("corpus")) install.packages("corpus", repos = "http://cran.us.r-project.org")
# if(! require("textstem")) install.packages("textstem", repos = "http://cran.us.r-project.org")
# if(! require("rlist")) install.packages("rlist", repos = "http://cran.us.r-project.org")
# if (! require("tm")) install.packages("tm", repos = "http://cran.us.r-project.org")
# if (!require("pacman")) install.packages("pacman")
# pacman::p_load_gh(
#   "trinker/qdapDictionaries",
#   "trinker/qdapRegex",
#   "trinker/qdapTools",
#   "trinker/qdap"
# )

# install.packages("devtools")
# 
# library(devtools)
# install_github("trinker/qdapDictionaries")
# install_github("trinker/qdapRegex")
# install_github("trinker/qdapTools")
# install_github("trinker/qdap")
#install.packages('openNLP')
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
# library("stringi");
# library("stringr")
# library("jsonlite")
# library(tm)
# library(corpus)
# library(textstem)
# library(ngram)
#library(qdap)
#library(fastrtext)
#setwd("E:\\Documents\\USP\\Projeto Mestrado\\mestrado\\The Project\\Server\\scripts")

attach(input[[1]])

setwd(workingdir);
if (command == "init"){

  dir.create(file.path("../../core/", basename(corpus)), showWarnings = FALSE)
  dir.create(file.path("../../file/", basename(corpus)), showWarnings = FALSE)
  dir.create(file.path(sprintf("../../file/%s/", basename(corpus)), username), showWarnings = FALSE)

  if ((!file.exists(sprintf("%s/wordembedding.csv", path_core)))||(!file.exists(sprintf("%s/signature.json", path_core)))){
    source("init.R")
    saveDocumentRepresentation(corpus, path_core);
  }
  #ngramsrepresentation
  if (!file.exists(sprintf("%s/ngramembedding.csv", path_core))){
    source("similarngrams.R")
    createNgramRepresentation(corpus, path_core);
  }
  if (!file.exists(sprintf("%s/bagofwords.csv", path_core))){
    source("tfidf.R");
    CreateBagofWords(corpus, path_core);
  }
  if (!file.exists(sprintf("%s/model.bin", path_core))){
    source("init.R")
    CreateModel(path_core);
  }
  #distance to the query document
  if (!file.exists(sprintf("%s/cosdistance.csv", path_users))){
    source("init.R")
    saveCosDistance(baseDocument, path_core, path_users, embtech);
  }

  #Term's visualization
  if (!file.exists(sprintf("%s/ImportantTerms.json", path_users))){
    source("tfidf.R");
    SaveMostImportantTerms(baseDocument, corpus, path_core, path_users);
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
    
    k <- 10;
    source("init.R")
    docsnames <- getMostSimilar(k, path_users);
    docsnames <- docsnames[,'name'];
   
    title <- c();
    label <- c();
    isbase <- c();
    for (i in 1:length(docsnames)){
      path <- sprintf("%s/%s", corpus, docsnames[i]);
      con <- file(path);
      lines <- as.character(readLines(con, warn = FALSE));
      for (j in 1:length(lines)){
        if ((lines[j] == ""))
          break;
      }
      if ((basename(corpus) == "cbr ilp ir son")||(basename(corpus) == "teste")){
        titlelines <- lines[1:j];
        title[i] <- toString(concatenate(titlelines));
      }else if (basename(corpus) == "WOS all"){
        title[i] <- toString(docsnames[i]);
        title[i] <- substr(title[i], 1, nchar(title[i]) - 4)
      }else{
        title[i] <- lines[1];
      }
      if (basename(baseDocument) == docsnames[i]){
        isbase[i] = TRUE;
        label[i] = 2;
      }else{
        isbase[i] = FALSE;
        label[i] = 1;
      }
      
      close(con);

    }
    df <- data.frame("docname" = docsnames, "title" = title, "isbase" = isbase, "label" = label);
 
    write(toJSON(df, pretty=TRUE), sprintf("%s/focuslist.json", path_users));
  }
  print("success");
}else if (command == "suggestion"){
  if (!file.exists(sprintf("%s/suggestionlist.json", path_users))){
    source("textclassifier.R")
    fasttextClassifier(corpus, path_users, path_core)
  }
  print("success");
}else if (command == "retrievesimilarngrams"){
 
  Embedding <- read.csv(file=sprintf("%s/ngramembedding.csv", path_core), header=TRUE, check.names=FALSE)
  source("similarngrams.R")
  ngramlist <- getSimilarNgramsList(ngram, Embedding);
  
  con <- file(sprintf("%s/signature.json", path_core), encoding = "latin1");
  test <- as.character(readLines(con, warn = FALSE));
  test <- iconv(test, to = "utf8")
  signature <- fromJSON(test);
  
  
  for (i in 1:length(signature[,1])){
    if (signature[i,'ngram'] == ngram)
    {
      break;
    }
  }
  
  signature[i,'ngramlist'][[1]] <- list(ngramlist);
  
  write(toJSON(signature, pretty=TRUE), sprintf("%s/signature.json", path_core));
  print("success")

}else if (command == "gettitle"){
  path <- sprintf("%s/%s", corpus, docname);
  con <- file(path);
  lines <- as.character(readLines(con, warn = FALSE));
  for (j in 1:length(lines)){
    if (lines[j] == "")
      break;
  }
  if ((basename(corpus) == "cbr ilp ir son")||(basename(corpus) == "teste")){
    titlelines <- lines[1:j];
    title <- toString(concatenate(titlelines));
  }else if (basename(corpus) == "WOS all"){
    title <- toString(docname);
    title <- substr(title, 1, nchar(title) - 4)
  }else{
    title <- lines[1];
  }
  
  print(title)
}else if (command == "retrainclassifier"){
 
  con <- file(sprintf("%s/suggestionlist.json", path_users), encoding = "latin1");
  test <- as.character(readLines(con, warn = FALSE));
  test <- iconv(test, to = "utf8")
  
  suggestion <- fromJSON(test);
  
  if (length(suggestion[,1]) > 0){
    con <- file(sprintf("%s/notrelevant.json", path_users), encoding = "latin1");
    test <- as.character(readLines(con, warn = FALSE));
    test <- iconv(test, to = "utf8")
    
    notrelevant <- fromJSON(test);
    
    docname_list <- c();
    title_list <- c();
 
    for (i in 1:length(suggestion[,1])){
      path <- sprintf("%s/%s", corpus, suggestion[i,'docname']);
      con <- file(path);
      body <- as.character(readLines(con, warn = FALSE));
      docname_list[i] = suggestion[i,'docname'];
      title_list[i] = suggestion[i,'title'];
      close(con)
      
    }
    df <- data.frame('docname' = docname_list, 'title' = title_list);
    
    notrelevant <- rbind(notrelevant, df);
    
    write(toJSON(notrelevant, pretty=TRUE), sprintf("%s/notrelevant.json", path_users));
  }
  print("success");
}else if (command == "getsimilardocuments"){
  cosdistance = read.csv(sprintf("%s/cosdistance.csv", path_users));
  cosdistance <- cosdistance[order(-cosdistance[,'x']),]
  
  cosdistance <- cosdistance[,1];
  for (i in 1:length(cosdistance)){
    cosdistance[i] = toString(cosdistance[i]);
  }
  
  print(cosdistance);

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

  syn <- suppressMessages(synonyms(c(term), return.list = TRUE, multiwords = TRUE))

  modelCorpus <- load_model(sprintf("%s/model.bin", path_core))
  syn_nn <- c()

  if (length(syn) > 0){
    syn_nn <- get_nn(modelCorpus, term, 3)
    syn_nn <- names(syn_nn)
    
    k <- length(syn_nn) + 1;
    
    
    if (length(syn) < 3){
      max = length(syn);
    }else{
      max = 3;
    }
    for (i in 1:max){
      for (j in 1:length(syn[[1]])){
        syn_nn[k] <- syn[[i]][j];
        if (k >= 10){
          break;
        }
        k <- k + 1;
        
      }
    }
  }else{
    syn_nn <- get_nn(modelCorpus, term, 5)
    syn_nn <- names(syn_nn)
  }
  return(syn_nn);
  
}else if (command == "addterm"){
  terms <- strsplit(term, " ")[[1]];
  term_list <- c();
  syn <- c();
  con <- file(sprintf("%s/ImportantTerms.json", path_users), encoding = "latin1");
  test <- as.character(readLines(con, warn = FALSE));
  test <- iconv(test, to = "utf8")
  
  importantterms <- fromJSON(test);
  
  for (i in 1:length(terms)){
    source("corpussettings.R")
    newterm <- TextPreprocess(terms[i], TRUE, corpus);
    newterm = str_squish(newterm);
    
    if (!(newterm %in% importantterms[,'term'] )){
      source("corpussettings.R")
      syn[i] <- list(getSynonyms(newterm, path_core))
      term_list[i] <- toString(newterm);
    }
  }
  if (length(term_list) > 0){
    df <- data.frame('term' = term_list, 'show' = TRUE)
    df$synonyms <- syn;
    importantterms <- rbind(importantterms, df);
    write(toJSON(importantterms, pretty=TRUE), sprintf("%s/ImportantTerms.json", path_users))
  }
  print("success");
}
