

needs(fastrtext);
needs(jsonlite)
needs(ngram);
needs(e1071);

#When running the code from RStudio, you need to comment the lines above and uncomment the lines bellow
# library("fastrtext");
# library("jsonlite");
# library(ngram)
# library(e1071);

createNotRelevant <- function(corpus, path_users){
  
  MyData <- read.csv(file=sprintf("%s/cosdistance.csv", path_users), header=TRUE, check.names=FALSE)
  header <- MyData[,1];
  
  df <- data.frame(name = header, value = MyData[,2])
  
  lesssimilar <- df[order(df[,'value']),]
  lesssimilar <- lesssimilar[1:10,1];
  
  title <- c();            

  for (i in 1:length(lesssimilar)){
    path <- sprintf("%s/%s", corpus, lesssimilar[i]);
    con <- file(path);
    lines <- as.character(readLines(con, warn = FALSE));
    for (j in 1:length(lines)){
      if (lines[j] == "")
        break;
    }
    if ((basename(corpus) == "cbr ilp ir son")||(basename(corpus) == "teste")){
      titlelines <- lines[1:j];
      title[i] <- toString(concatenate(titlelines));
    }else if (basename(corpus) == "WOS all"){
      title[i] <- toString(lesssimilar[i]);
    }else{
      title[i] <- lines[1];
    }
  
    close(con);
    
  }
  df <- data.frame("docname" = lesssimilar, "title" = title);
  
  write(toJSON(df, pretty=TRUE), sprintf("%s/notrelevant.json", path_users));
}

fasttextClassifier <- function(corpus, path_users, path_core){

  con <- file(sprintf("%s/coordinates_temp.json", path_core), encoding = "latin1");
  jsondata <- as.character(readLines(con, warn = FALSE));
  jsondata <- iconv(jsondata, to = "utf8")
  coordinates <- fromJSON(jsondata);
  
  con <- file(sprintf("%s/focuslist.json", path_users), encoding = "latin1");
  jsondata <- as.character(readLines(con, warn = FALSE));
  jsondata <- iconv(jsondata, to = "utf8")
  relevant <- fromJSON(jsondata);
  
  if (!file.exists(sprintf("%s/notrelevant.json", path_users))){
    createNotRelevant(corpus, path_users);
  }
  con <- file(sprintf("%s/notrelevant.json", path_users), encoding = "latin1");
  jsondata <- as.character(readLines(con, warn = FALSE));
  jsondata <- iconv(jsondata, to = "utf8")
  notrelevant <- fromJSON(jsondata);
  
  body_relevant1 <- c();
  body_relevant2 <- c();
  body_relevant3 <- c();
  body_notrelevant <- c();
  a <- 1;
  b <- 1;
  c <- 1;
  for (i in 1:length(relevant[,1])){
    doc <- coordinates[which(coordinates[,'name'] == toString(relevant[i,'docname'])), 'body_preprocessed'];
    if (relevant[i,'label'] == 0.5){
      body_relevant3[c] = doc;
      c <- c + 1;
    }else{
      if (relevant[i, 'label'] == 1){
        body_relevant2[b] = doc;
        b <- b + 1;
      }else{
        if (relevant[i,'label'] == 2){
          body_relevant1[a] = doc;
          a <- a + 1;
        }
      }
    }
  }
  for (i in 1:length(notrelevant[,1])){
    doc <- coordinates[which(coordinates[,'name'] == toString(notrelevant[i,'docname'])), 'body_preprocessed'];
    body_notrelevant[i] = doc;
  }

  if (length(body_relevant1) > 0){
    df_relevant1 <- data.frame(class = "__label__relevant1", text = body_relevant1)#body_relevant)
  }
  if (length(body_relevant2) > 0){
    df_relevant2 <- data.frame(class = "__label__relevant2", text = body_relevant2)
  }
  if (length(body_relevant3) > 0){
    df_relevant3 <- data.frame(class = "__label__relevant3", text = body_relevant3)
  }
  
  df_notrelevant <- data.frame(class = "__label__notrelevant", text = body_notrelevant)#body_notrelevant)
  
  if (length(body_relevant1) > 0){
    df_train <- rbind(df_relevant1, df_notrelevant);
  }
  if (length(body_relevant2) > 0){
    df_train <- rbind(df_train,body_relevant2);
  }
  if (length(body_relevant3) > 0){
    df_train <- rbind(df_train,body_relevant3);
  }
  
  df_train <-  sapply(df_train, as.character)

  train_tmp_file_txt <- tempfile();
 
  tmp_file_model <- tempfile()

  writeLines(text = df_train, con = train_tmp_file_txt)
  write(toJSON(df_train, pretty=TRUE), sprintf("%s/train.json", path_users));
  execute(commands = c("supervised", "-input", train_tmp_file_txt, "-dim",100,"-lr", 1, "-wordNgrams", 2,
                         "-epoch", 20,"-output", tmp_file_model))

  modelClass <- suppressMessages(load_model(tmp_file_model))
  
  #go over the corpus and see if new files are found as relevant. Save it on the suggestionlist.json
  title <- c();
  docsnames <- c();
  prob <- c();
  label <- c();
  k <- 1;
  for (indexF in 1:length(coordinates[,1])){
    if ((!(coordinates[indexF,'name'] %in% relevant[,'docname'])) && (!(coordinates[indexF,'name'] %in% notrelevant[,'docname']))){
  
      p <- predict(modelClass, sentences = coordinates[indexF,'body_preprocessed'])
      
      if ((names(p[[1]]) == "relevant1")||(names(p[[1]]) == "relevant2")||(names(p[[1]]) == "relevant3")){
        path <- sprintf("%s/%s", corpus, coordinates[indexF,'name']);
        con <- file(path);
        lines <- as.character(readLines(con, warn = FALSE));
        for (j in 1:length(lines)){
          if (lines[j] == "")
            break;
        }
        if ((basename(corpus) == "cbr ilp ir son")||(basename(corpus) == "teste")){
          titlelines <- lines[1:j];
          title[k] <- concatenate(titlelines);
        }else if (basename(corpus) == "WOS all"){
          title[k] <- coordinates[indexF,'name'];
          title[k] <- substr(title[k], 1, nchar(title[k]) - 4)
        }else{
          title[k] <- lines[1];
        }
        docsnames[k] <- coordinates[indexF,'name'];
  
        prob[k] <- p[[1]];
        if (names(p[[1]]) == "relevant1"){
          label[k] = 2;
        }else if (names(p[[1]]) == "relevant2"){
          label[k] = 1;
        }else if (names(p[[1]]) == "relevant3"){
          label[k] = 0.5;
        }
        
        k <- k + 1;
      }
    }
  }
  df_prob <- data.frame("docname" = docsnames, "title" = title, "prob" = prob, "label" = label);
  df_prob <- df_prob[order(-df_prob[,'label']),]
  
  if(length(df_prob[,1]) > 20){
    df <- df_prob[1:20,];
  }else{
    df <- df_prob;
  }
  
  write(toJSON(df, pretty=TRUE), sprintf("%s/suggestionlist.json", path_users));

}

retrainClassifier <- function(path_users, corpus){
  con <- file(sprintf("%s/suggestionlist.json", path_users), encoding = "latin1");
  jsondata <- as.character(readLines(con, warn = FALSE));
  jsondata <- iconv(jsondata, to = "utf8")
  
  suggestion <- fromJSON(jsondata);
  
  if (length(suggestion[,1]) > 0){
    con <- file(sprintf("%s/notrelevant.json", path_users), encoding = "latin1");
    jsondata <- as.character(readLines(con, warn = FALSE));
    jsondata <- iconv(jsondata, to = "utf8")
    
    notrelevant <- fromJSON(jsondata);
    
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
}