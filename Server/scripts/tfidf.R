needs("dplyr")
needs("tidytext")
needs("ngram")
needs(textstem);
needs("stringi");
needs("tm")
needs("tokenizers");


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

# createTfidf <- function(corpus, path_core){
#   if (!file.exists(sprintf("%s/tidy.csv", path_core))){
#     fileList <- list.files(path = corpus, full.names = TRUE, recursive = TRUE)
#     DocNames <- c();
#     
#     textlist <- c();
#     docnames <- c();
#     k <- 1;
#     for (i in 1:length(fileList)){
#       conn <- file(fileList[i],open="rt")
#       doc <- readLines(conn);
#       doc <- concatenate(doc);
#       source("corpussettings.R")
#       doc <- textPreprocess(doc, TRUE, corpus);
#       DocName <- basename(fileList[i]);
#       
#       textlist[i] <- list(chunk_text(toString(doc), chunk_size = 10))
#       for (j in 1:length(textlist[[i]])){
#         docnames[k] <- toString(DocName);
#         k <- k + 1;
#       }
#       close(conn);
#     }
# 
#     tidy <- data.frame(text = unlist(textlist, use.names=FALSE), doc = docnames);
#     con <- file(sprintf("%s/tidy.csv", path_core), encoding = "UTF-8");
#     write.csv(tidy, file = con)
#  
#   }
#   data = read.csv(sprintf("%s/tidy.csv", path_core), header = TRUE, stringsAsFactors = FALSE)
#  
#   corpus_words <- data %>%
#     unnest_tokens(word, text) %>%
#     count(doc, word, sort = TRUE)
#   
#   total_words <- corpus_words %>% group_by(doc) %>% summarize(total = sum(n))
#   corpus_words <- suppressMessages(left_join(corpus_words, total_words))
#   
#   corpus_words <- corpus_words %>%
#     bind_tf_idf(word, doc, n)
#   
#   
#   corpus_words <- corpus_words %>%
#     select(-total) %>%
#     arrange(desc(tf_idf))
#   con <- file(sprintf("%s/tfidf.csv", path_core), encoding="UTF-8");
#   write.csv(corpus_words, file = con);
# 
# }

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
