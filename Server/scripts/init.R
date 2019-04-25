# install.packages("ngram");
# install.packages("corpus");
# install.packages("textstem");
# install.packages("rlist")

needs (rlist);
needs(ngram)
needs(corpus)
needs(textstem);
needs(jsonlite);
needs(tm)
needs("stringi");
needs("fastrtext");
needs("stringr")
needs(ngram)
needs("lsa")

# 
# library("fastrtext");
# library (rlist);
# library(ngram)
# library(corpus)
# library(textstem);
# library(jsonlite);
# library(tm)
# library("stringi")
# library("stringr")
# library("ngram")
# library("lsa")

############ SET PARAMETERS ############ 
#2; 3;
ngramN = 3;

#FALSE; TRUE
withoutstopwords = TRUE;

#######################################

#The saveDocumentRepresentation function creates the wordembedding representation;
#the signature.json with the ngrams from the entire collection; 
#the union.txt file with the text from the entire collection;
#coordinates_temp.json that will be used to create the scatterplot.
saveDocumentRepresentation <- function(corpus, path_core){
  #Load pre trained model
  model <- load_model("wiki.en.bin");
  
  #Retrieve the files from the corpus
  fileList <- list.files(path = corpus, full.names = TRUE, recursive = TRUE)
  
  #300 is the default number of columns of the fastText vectors
  vecMatrix <- matrix(ncol = 300, nrow = length(fileList));  DocNames <- c();

  ngramlist <- c();
  coord_body <- c();
  coord_bodypreprocessed <- c();
  docnames <- c();
  k <- 1;
  
  for (indexF in 1:length(fileList)){
    conn <- file(fileList[indexF],open="rt")
    doc <- readLines(conn);
    close(conn);
    
    doc <- concatenate(doc);
    coord_body[indexF] <- doc; 
    source("corpussettings.R")
    doc <- TextPreprocess(doc, TRUE, corpus);
    coord_bodypreprocessed[indexF] <- doc;
    
    #Retrieve the document's vector representation
    m <- get_sentence_representation(model, doc);
    docnames[indexF] = basename(fileList[indexF]);
    for (i in 1:300){
      vecMatrix[indexF, i] = m[1,i];
    }
    #concatenates the text of all the documents into the variable union
    if (indexF == 1){
      union <- doc;
    }else{
      union <- paste(union, doc, sep = " ");
    }
  }
  
  df_wordembedding <- data.frame(vecMatrix);
  df_wordembedding <- cbind(df_wordembedding, docnames);
  write.csv(df_wordembedding, file= sprintf("%s/wordembedding.csv", path_core))

  #Retrieve the ngrams from union
  y <- splitter (union, split.space = TRUE );
  ngUnion <- ngram(y, ngramN, sep = "_")
  tableUnion <- get.phrasetable(ngUnion)
  #Removing ngrams with freq <= 1
  tableUnion <- tableUnion[tableUnion$freq > 1,];
  k < - 1;
  for (j in 1: length(tableUnion[,1])){
        tableUnion[j,'ngrams'] <- str_squish(tableUnion[j,'ngrams']);
        #ngramlist should be used to store similar ngrams - not being used for now
        ngramlist[k] <- list(c('none'))
        k <- k + 1;
  }
  
  df_signature <- data.frame('ngram' = tableUnion$ngrams, 'freq' = tableUnion$freq, 'show' = TRUE)

  df_signature$ngramlist <- ngramlist;

  df_signature <- df_signature[order(-df_signature[,'freq']),]
  write(toJSON(df_signature, pretty=TRUE), sprintf("%s/signature.json", path_core))
  
  
  df_scatter <- data.frame('name' = docnames, 'body' = coord_body, 'body_preprocessed' = coord_bodypreprocessed)
  write(toJSON(df_scatter, pretty = TRUE), sprintf("%s/coordinates_temp.json", path_core))
  
  conn<-file(sprintf("%s/union.txt", path_core))
  writeLines(union, conn)
  close(conn)
}

#Save the cosine distance from the query document to the others
saveCosDistance <- function(base, path_core, path_users, embtech){
  
 #retrieve the wordembeddings representation or bag of words representation    
 if (embtech == "word_embeddings"){
    Embedding <- read.csv(file=sprintf("%s/wordembedding.csv", path_core), header=TRUE, check.names=FALSE)
    
    Docnames <- Embedding[,length(Embedding[1,])];
    
    Embedding <- Embedding[,2:(length(Embedding[1,]) - 1)];
    
  }else if (embtech == "bagofwords"){
    Embedding <- read.csv(file=sprintf("%s/bagofwords.csv", path_core), header=TRUE, check.names=FALSE)

    Docnames <- Embedding[,1];

    Embedding <- Embedding[,2:(length(Embedding[1,]))];
  }
  
  Embedding <- t(Embedding);
  colnames(Embedding) <- Docnames;
  #Calculates the cosine from the query document to others
  distanceCos <- cosine(Embedding[,basename(base)], Embedding);

  distanceCos <- distanceCos[order(-distanceCos)]

  write.csv(distanceCos, file=sprintf("%s/cosdistance.csv", path_users))
  
}
# getAll <- function(path_users){
#   MyData <- read.csv(file=sprintf("%s/cosdistance.csv", path_users), header=TRUE, check.names=FALSE)
#   header <- MyData[,1];
#   # header <- header[2:length(header)];
#   # MyData <- MyData[,baseDocument];
#   df <- data.frame(name = header, value = MyData[,2])
#   
#   newdata <- df[order(-df[,'value']),]
#   return(newdata);
# }

#Reads the cosinedistance file to get the K most similar documents to the query
getMostSimilar <- function(k, path_users){
  MyData <- read.csv(file=sprintf("%s/cosdistance.csv", path_users), header=TRUE, check.names=FALSE)
  header <- MyData[,1];

  df <- data.frame(name = header, value = MyData[,2])
  
  newdata <- df[order(-df[,'value']),]
  #not considering first document since it is the query document
  newdata <- newdata[1:(k+1),];
  
  return(newdata);
}

#This function is called when creating a new query document or setting multiple as not relevant.
#It gets the K most similar documents to a selected one.
getSimilarDocuments <- function(document, path_core, path_users, embtech){
  k <- 10;
  #retrieve the wordembeddings representation or bag of words representation  
  if (embtech == "word_embeddings"){
    Embedding <- read.csv(file=sprintf("%s/wordembedding.csv", path_core), header=TRUE, check.names=FALSE)
    
    Docnames <- Embedding[,length(Embedding[1,])];
    
    Embedding <- Embedding[,2:(length(Embedding[1,]) - 1)];
    
  }else if (embtech == "bagofwords"){
    Embedding <- read.csv(file=sprintf("%s/bagofwords.csv", path_core), header=TRUE, check.names=FALSE)
    
    Docnames <- Embedding[,1];
    
    Embedding <- Embedding[,2:(length(Embedding[1,]))];
  }

  Embedding <- t(Embedding);
  colnames(Embedding) <- Docnames

  distanceCos <- cosine(Embedding[,document], Embedding);

  distanceCos <- distanceCos[order(-distanceCos)]

  distanceCos <- distanceCos[2:(k+1)];

  return(names(distanceCos));
}

#Train a model using the text from the collection
CreateModel <- function(path_core){
  path <- sprintf("%s/union.txt", path_core);
  output <-sprintf("%s/model",path_core);
  execute(commands = c("skipgram", "-input", path, "-output", output))
}
