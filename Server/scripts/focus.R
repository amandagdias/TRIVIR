needs("jsonlite");

#When running the code from RStudio, you need to comment the lines above and uncomment the lines bellow
#library(jsonlite);

createFocusList <- function(path_users, corpus, baseDocument){
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