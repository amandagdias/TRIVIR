needs("jsonlite");

#When running the code from RStudio, you need to comment the lines above and uncomment the lines bellow
# library(jsonlite);

getDocumentsWithNgram <-function(ngram, path_users){
  
  con <- file(sprintf("%s/coordinates.json", path_users), encoding = "latin1");
  test <- as.character(readLines(con, warn = FALSE));
  close(con)
  test <- iconv(test, to = "utf8")
  coordinates <- fromJSON(test);
  
  doclist <- c();
  k <- 1;
  for (i in 1:length(coordinates[,1])){
    if ((grepl(ngram, coordinates[i,'body_preprocessed']))){
      doclist[k] <- coordinates[i, 'name'];
      k <- k +1;
    }
  }
  return(doclist);
}


setRelevantNgramBatch <- function(ngram, path_users, corpus){
  
  #retrieve docs with ngram
  doclist <- getDocumentsWithNgram(ngram, path_users);
  
  con <- file(sprintf("%s/focuslist.json", path_users), encoding = "latin1");
  jsondata <- as.character(readLines(con, warn = FALSE));
  jsondata <- iconv(jsondata, to = "utf8")
  
  focus <- fromJSON(jsondata);
  
  con <- file(sprintf("%s/notrelevant.json", path_users), encoding = "latin1");
  jsondata <- as.character(readLines(con, warn = FALSE));
  jsondata <- iconv(jsondata, to = "utf8")
  
  notrelevant <- fromJSON(jsondata);
  
  con <- file(sprintf("%s/suggestionlist.json", path_users), encoding = "latin1");
  jsondata <- as.character(readLines(con, warn = FALSE));
  jsondata <- iconv(jsondata, to = "utf8")
  
  suggestion <- fromJSON(jsondata);
  close(con)
  # #run over each document and check
  # #if document is not on focus list - check
  # #if document is on suggestion list - remove from suggestion + add to focus list
  # #else if document is on not relevant list - remove from not relevant + add to focus list
  k <- 1;
  sugg <- 1;
  title <- c();
  label <- c();
  docsnames <- c();
  
  for (i in 1:length(doclist)){
    if ((!(doclist[i] %in% focus[,'docname']))&&(!(doclist[i] %in% notrelevant[,'docname']))){
      if (length(suggestion) > 0){ 
        if (doclist[i] %in% suggestion[,'docname']){
          suggestion <- suggestion[suggestion$docname != doclist[i],];
          sugg <- sugg + 1;
        }
      }
      path <- sprintf("%s/%s", corpus, doclist[i]);
      con <- file(path);
      lines <- as.character(readLines(con, warn = FALSE));
      for (j in 1:length(lines)){
        if (lines[j] == "")
          break;
      }
      if ((basename(corpus) == "cbr ilp ir son")||(basename(corpus) == "demo")){
        titlelines <- lines[1:j];
        title[k] <- concatenate(titlelines);
      }else if (basename(corpus) == "WOS all"){
        title[k] <- doclist[i];
        title[k] <- substr(title[k], 1, nchar(title[k]) - 4)
      }else{
        title[k] <- lines[1];
      }
      
      label[k] <- 1;
      docsnames[k] <- doclist[i];
      
      close(con);
      k <- k + 1;
    }
    
  }
  if (k > 1){
    df <- data.frame("docname" = docsnames, "title" = title, "isbase" = FALSE, "label" = label);
    focus <- rbind(focus, df);
    write(toJSON(focus, pretty=TRUE), sprintf("%s/focuslist.json", path_users));
    if (sugg > 1){
      write(toJSON(suggestion, pretty=TRUE), sprintf("%s/suggestionlist.json", path_users));
    }
    
  }
}

setNotRelevantNgramBatch <- function(ngram, path_users, corpus){
  
  #retrieve docs with ngram
  doclist <- getDocumentsWithNgram(ngram, path_users);
  
  con <- file(sprintf("%s/focuslist.json", path_users), encoding = "latin1");
  jsondata <- as.character(readLines(con, warn = FALSE));
  jsondata <- iconv(jsondata, to = "utf8")
  
  focus <- fromJSON(jsondata);
  close(con)
  con <- file(sprintf("%s/notrelevant.json", path_users), encoding = "latin1");
  jsondata <- as.character(readLines(con, warn = FALSE));
  jsondata <- iconv(jsondata, to = "utf8")
  
  notrelevant <- fromJSON(jsondata);
  close(con)
  con <- file(sprintf("%s/suggestionlist.json", path_users), encoding = "latin1");
  jsondata <- as.character(readLines(con, warn = FALSE));
  jsondata <- iconv(jsondata, to = "utf8")
  
  suggestion <- fromJSON(jsondata);
  close(con)
  # #run over each document and check
  # #if document is not on focus list - check
  # #if document is on suggestion list - remove from suggestion + add to focus list
  # #else if document is on not relevant list - remove from not relevant + add to focus list
  k <- 1;
  sugg <- 1;
  title <- c();
  
  docsnames <- c();
  for (i in 1:length(doclist)){
    if ((!(doclist[i] %in% notrelevant[,'docname'])&&(!(doclist[i] %in% focus[,'docname'])))){
      if (length(suggestion) > 0){
        if (doclist[i] %in% suggestion[,'docname']){
          suggestion <- suggestion[suggestion$docname != doclist[i],];
          sugg <- sugg + 1;
        }
      }  
      
      
      path <- sprintf("%s/%s", corpus, doclist[i]);
      con <- file(path);
      lines <- as.character(readLines(con, warn = FALSE));
      for (j in 1:length(lines)){
        if (lines[j] == "")
          break;
      }
      
      if ((basename(corpus) == "cbr ilp ir son")||(basename(corpus) == "demo")){
        titlelines <- lines[1:j];
        title[k] <- concatenate(titlelines);
      }else if (basename(corpus) == "WOS all"){
        title[k] <- doclist[i];
        title[k] <- substr(title[k], 1, nchar(title[k]) - 4)
      }else{
        title[k] <- lines[1];
      }
      
      
      docsnames[k] <- doclist[i];
      close(con);
      k <- k + 1;
    }
    
  }
  if (k > 1){
    df <- data.frame("docname" = docsnames, "title" = title);
    notrelevant <- rbind(notrelevant, df);
    write(toJSON(notrelevant, pretty=TRUE), sprintf("%s/notrelevant.json", path_users));
    if (sugg > 1){
      write(toJSON(suggestion, pretty=TRUE), sprintf("%s/suggestionlist.json", path_users));
    }
    
  }
}

setRelevantSimilarBatch <- function(document, path_users, path_core, corpus, embtech){
  
  source("init.R")
  doclist <- c();
  doclist <- getSimilarDocuments(document, path_core, path_users, embtech);
  
  con <- file(sprintf("%s/focuslist.json", path_users), encoding = "latin1");
  jsondata <- as.character(readLines(con, warn = FALSE));
  jsondata <- iconv(jsondata, to = "utf8")
  
  focus <- fromJSON(jsondata);
  
  con <- file(sprintf("%s/notrelevant.json", path_users), encoding = "latin1");
  jsondata <- as.character(readLines(con, warn = FALSE));
  jsondata <- iconv(jsondata, to = "utf8")
  
  notrelevant <- fromJSON(jsondata);
  
  con <- file(sprintf("%s/suggestionlist.json", path_users), encoding = "latin1");
  jsondata <- as.character(readLines(con, warn = FALSE));
  jsondata <- iconv(jsondata, to = "utf8")
  
  suggestion <- fromJSON(jsondata);
  close(con)
  # #run over each document and check
  # #if document is not on focus list - check
  # #if document is on suggestion list - remove from suggestion + add to focus list
  # #else if document is on not relevant list - remove from not relevant + add to focus list
  k <- 1;
  sugg <- 1;
  title <- c();
  label <- c();
  docsnames <- c();
  
  for (i in 1:length(doclist)){
    if ((!(doclist[i] %in% focus[,'docname']))&&(!(doclist[i] %in% notrelevant[,'docname']))){
      if (length(suggestion) > 0){
        if (doclist[i] %in% suggestion[,'docname']){
          suggestion <- suggestion[suggestion$docname != doclist[i],];
          sugg <- sugg + 1;
        }
      }
      path <- sprintf("%s/%s", corpus, doclist[i]);
      con <- file(path);
      lines <- as.character(readLines(con, warn = FALSE));
      for (j in 1:length(lines)){
        if (lines[j] == "")
          break;
      }
      if ((basename(corpus) == "cbr ilp ir son")||(basename(corpus) == "demo")){
        titlelines <- lines[1:j];
        title[k] <- concatenate(titlelines);
      }else if (basename(corpus) == "WOS all"){
        title[k] <- doclist[i];
        title[k] <- substr(title[k], 1, nchar(title[k]) - 4)
      }else{
        title[k] <- lines[1];
      }
      
      
      docsnames[k] <- doclist[i];
      label[k] <- 0.5;
      close(con);
      k <- k + 1;
    }
    
  }
  for (i in 1:length(focus[,1])){
    if (focus[i,'docname'] == document){
      focus[i, 'isbase'] = TRUE;
      focus[i, 'label'] = 2;
      break;
    }
  }
  if (k > 1){
    df <- data.frame("docname" = docsnames, "title" = title, "isbase" = FALSE, "label" = label);
    focus <- rbind(focus, df);
    if (sugg > 1){
      write(toJSON(suggestion, pretty=TRUE), sprintf("%s/suggestionlist.json", path_users));
    }
    
  }
  write(toJSON(focus, pretty=TRUE), sprintf("%s/focuslist.json", path_users));
  resdf <- data.frame("response" = "success");
  return(doclist);
}

setNotRelevantSimilarBatch <- function(document, path_users, path_core, corpus, embtech){
  
  source("init.R")
  doclist <- c();
  doclist <- getSimilarDocuments(document, path_core, path_users, embtech);
  
  con <- file(sprintf("%s/focuslist.json", path_users), encoding = "latin1");
  jsondata <- as.character(readLines(con, warn = FALSE));
  jsondata <- iconv(jsondata, to = "utf8")
  
  focus <- fromJSON(jsondata);
  
  con <- file(sprintf("%s/notrelevant.json", path_users), encoding = "latin1");
  jsondata <- as.character(readLines(con, warn = FALSE));
  jsondata <- iconv(jsondata, to = "utf8")
  
  notrelevant <- fromJSON(jsondata);
  
  con <- file(sprintf("%s/suggestionlist.json", path_users), encoding = "latin1");
  jsondata <- as.character(readLines(con, warn = FALSE));
  jsondata <- iconv(jsondata, to = "utf8")
  
  suggestion <- fromJSON(jsondata);
  close(con)
  # #run over each document and check
  # #if document is not on not relevant list - check
  # #if document is on suggestion list - remove from suggestion + add to not relevant list
  # #else if document is on not focus list - remove from focus + add to not relevant
  k <- 1;
  sugg <- 1;
  title <- c();
  docsnames <- c();
  for (i in 1:length(doclist)){
    if ((!(doclist[i] %in% notrelevant[,'docname']))&&(!(doclist[i] %in% focus[,'docname']))){
      if (length(suggestion) > 0){
        if (doclist[i] %in% suggestion[,'docname']){
          suggestion <- suggestion[suggestion$docname != doclist[i],];
          sugg <- sugg + 1;
        }
      }
      path <- sprintf("%s/%s", corpus, doclist[i]);
      con <- file(path);
      lines <- as.character(readLines(con, warn = FALSE));
      for (j in 1:length(lines)){
        if (lines[j] == "")
          break;
      }
      if ((basename(corpus) == "cbr ilp ir son")||(basename(corpus) == "demo")){
        titlelines <- lines[1:j];
        title[k] <- concatenate(titlelines);
      }else if (basename(corpus) == "WOS all"){
        title[k] <- doclist[i];
        title[k] <- substr(title[k], 1, nchar(title[k]) - 4)
      }else{
        title[k] <- lines[1];
      }
      
      
      docsnames[k] <- doclist[i];
      close(con);
      k <- k + 1;
    }
    
  }
  if (k > 1){
    df <- data.frame("docname" = docsnames, "title" = title);
    notrelevant <- rbind(notrelevant, df);
    write(toJSON(notrelevant, pretty=TRUE), sprintf("%s/notrelevant.json", path_users));
    if (sugg > 1){
      write(toJSON(suggestion, pretty=TRUE), sprintf("%s/suggestionlist.json", path_users));
    }
    
  }
  
  
}