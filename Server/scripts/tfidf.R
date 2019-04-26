needs("dplyr")
needs("tidytext")
needs("ngram")
needs(textstem);
needs("stringi");
needs("tm")
needs("tokenizers");

#When running the code from RStudio, you need to comment the lines above and uncomment the lines bellow
# library("dplyr")
# library("janeaustenr")
# library("tidytext")
# library("ngram")
# library(textstem);
# library("stringi");
# library("tm")
# library("tokenizers");

createBagofWords <- function(corpus, path_core){
  
  
  con <- file(sprintf("%s/coordinates_temp.json", path_core), encoding = "latin1");
  test <- as.character(readLines(con, warn = FALSE));
  test <- iconv(test, to = "utf8")
  coordinates <- fromJSON(test);
  
  
  data <- data.frame("doc_id" = coordinates[,'name'], "text" = coordinates[,'body_preprocessed']);

  corpus <-  VCorpus(DataframeSource(data))

  dtm_tfidf <- DocumentTermMatrix(corpus, control = list(weighting = weightTfIdf))
  dtm_tfidf = removeSparseTerms(dtm_tfidf, 0.95)
  m <- as.matrix(dtm_tfidf) 
  write.csv(m, file=sprintf("%s/bagofwords.csv", path_core))
  
}

saveMostImportantTerms <- function(baseDocument, corpus, path_core, path_users){

  tfidf = read.csv(sprintf("%s/bagofwords.csv", path_core), header = TRUE)
  k <- 5;

  basedoc <- tfidf[tfidf$X == toString(basename(baseDocument)), ];

  basedoc <- basedoc[1,2:length(basedoc[1,])]

  basedoc <- sort(basedoc, decreasing = TRUE)

  syn <- c();
  terms <- c();
  terms <- names(basedoc[1:k]);
  for (i in 1:length(terms)){
    source("corpussettings.R")
    syn[i] <- list(getSynonyms(terms[i], path_core));
  }
    
  df <- data.frame(term = terms, show = TRUE);
  df$synonyms <- syn;
  write(toJSON(df, pretty=TRUE), sprintf("%s/ImportantTerms.json", path_users))
}
