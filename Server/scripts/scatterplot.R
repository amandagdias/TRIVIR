needs("mp")
needs("Rtsne")
needs("jsonlite");
needs("fastrtext");
needs("stringi");
needs("stringr")
needs(tm)
needs(corpus)
needs(textstem);
needs(ngram)
needs(lsa)

#When running the code from RStudio, you need to comment the lines above and uncomment the lines bellow
# library("mp")
# library("Rtsne")
# library("jsonlite")
# library("fastrtext")
# library("stringi")
# library("stringr")
# library(tm);
# library(corpus);
# library(textstem);
# library(ngram);
# library(lsa);


createScatterplotCoordinates <- function(path_core, path_users, projtech, embtech){

  if (embtech == "word_embeddings"){
    #Using the wordembedding
    embedding <- read.csv(file = sprintf("%s/wordembedding.csv", path_core), header=TRUE, check.names=FALSE)
    embedding <- embedding[,2:length(embedding[1,])];
    
    embedding <- embedding[!duplicated(embedding[1:300]), ]
    DocNames <- embedding$DocNames;
    embedding <- embedding[,1:300];
  }else if (embtech == "bagofwords"){
    embedding <- read.csv(file = sprintf("%s/bagofwords.csv", path_core), header=TRUE, check.names=FALSE)
    embedding <- embedding[!duplicated(embedding[,2:length(embedding[1,])]), ]
    DocNames <- embedding[,1];
    embedding <- embedding[,2:length(embedding[1,])];
  }
  
  if (projtech == 'tsne'){
    #Using the vector representation of text # p = 50
    if (basename(path_core) == 'demo'){
      coordEmb <- Rtsne(embedding, perplexity = 15)
    }else{
      coordEmb <- Rtsne(embedding)
    }
    df <- data.frame(coordEmb$Y);
    df <- cbind(df, name = DocNames)
  }else if (projtech == 'lsp'){
    cos <- cosine(as.matrix(embedding));
    coordEmb <- lsp(cos);
    df <- data.frame(coordEmb);
    df <- cbind(df, name = DocNames)
  }

  con <- file(sprintf("%s/coordinates_temp.json", path_core), encoding = "latin1");
  jsondata <- as.character(readLines(con, warn = FALSE));
  jsondata <- iconv(jsondata, to = "utf8")
  df_coord <- fromJSON(jsondata);

  df_coord <- merge(df_coord, df, by= c('name'), all=FALSE)
  
  write(toJSON(df_coord, pretty=TRUE), sprintf("%s/coordinates.json", path_users));
}
