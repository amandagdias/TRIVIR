needs("stringr")
needs("stringi");
needs(tm)
needs(corpus)
needs(textstem);
needs(ngram)
needs(qdap)
needs(fastrtext);

#When running the code from RStudio, you need to comment the lines above and uncomment the lines bellow
# library("stringi");
# library("stringr")
# library(tm)
# library(corpus)
# library(textstem)
# library(ngram)
# library(qdap)
# library(fastrtext);

defaultPreprocess <-function(text, withoutstopwords){
  connBase <- file("stop-word-list.txt",open="rt")
  stopwordlist <- readLines(connBase);
  close(connBase);
  
  text <- tolower(text);
  text <- gsub("<[^>]*>","", text)
  if (withoutstopwords){
    text <- removeWords(text,stopwordlist)
  }
  text <- lemmatize_strings(text);
  text <- gsub("\\W"," ", text)
  text <- gsub("\\d"," ", text)
  text <- str_squish(text);
  return(text)
}
textPreprocess <- function(text, withoutstopwords, corpus){
  #get basename of corpus if another preprocess is needed
  return(defaultPreprocess(text, withoutstopwords));
}

getSynonyms <- function(term, path_core){
  syn <- suppressMessages(synonyms(c(term), return.list = TRUE, multiwords = TRUE))
  
  modelCorpus <- load_model(sprintf("%s/model.bin", path_core))
  syn_nn <- c()
  
  if (length(syn) > 0){
    syn_nn <- suppressMessages(get_nn(modelCorpus, term, 3))
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
    syn_nn <- suppressMessages(get_nn(modelCorpus, term, 5))
    syn_nn <- names(syn_nn)
  }
  return(syn_nn);
  
}
addTerm <- function(term, path_core, path_users, corpus){
  terms <- strsplit(term, " ")[[1]];
  term_list <- c();
  syn <- c();
  con <- file(sprintf("%s/ImportantTerms.json", path_users), encoding = "latin1");
  test <- as.character(readLines(con, warn = FALSE));
  test <- iconv(test, to = "utf8")
  
  importantterms <- fromJSON(test);
  
  for (i in 1:length(terms)){
    newterm <- textPreprocess(terms[i], TRUE, corpus);
    newterm = str_squish(newterm);
    
    if (!(newterm %in% importantterms[,'term'] )){
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
}

getTitle <- function(corpus, docname){
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
  
  return(title);
}