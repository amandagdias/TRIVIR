
  if (!suppressMessages(require("needs")))  suppressMessages(install.packages("needs",  repos = "http://cran.us.r-project.org"));
  if (!suppressMessages(require("jsonlite"))) suppressMessages(install.packages("jsonlite", repos = "http://cran.us.r-project.org")); 
  if (!suppressMessages(require("stringr"))) suppressMessages(install.packages("stringr",  repos = "http://cran.us.r-project.org"));
  if (!suppressMessages(require("stringi"))) suppressMessages(install.packages("stringr", repos = "http://cran.us.r-project.org"));
  if (!suppressMessages(require("tm"))) suppressMessages(install.packages("tm", repos = "http://cran.us.r-project.org"));
  if (!suppressMessages(require("ngram"))) suppressMessages(install.packages("ngram", repos = "http://cran.us.r-project.org"));
  if (!suppressMessages(require("corpus"))) suppressMessages(install.packages("corpus", repos = "http://cran.us.r-project.org"));
  if (!suppressMessages(require("textstem"))) suppressMessages(install.packages("textstem", repos = "http://cran.us.r-project.org"));
  if (!suppressMessages(require("rlist"))) suppressMessages(install.packages("rlist", repos = "http://cran.us.r-project.org"));
  if (!suppressMessages(require("pacman"))) suppressMessages(install.packages("pacman", repos = "http://cran.us.r-project.org"));
  if (!suppressMessages(require("devtools"))) suppressMessages(install.packages("devtools", repos = "http://cran.us.r-project.org"));
  if (!suppressMessages(require("dplyr"))) suppressMessages(install.packages("dplyr", repos = "http://cran.us.r-project.org"));
  if (!suppressMessages(require("bindrcpp"))) suppressMessages(install.packages("bindrcpp", repos = "http://cran.us.r-project.org"));
  if (!suppressMessages(require("tokenizers"))) suppressMessages(install.packages("tokenizers", repos = "http://cran.us.r-project.org"));
  if (!suppressMessages(require("topicmodels"))) suppressMessages(install.packages("topicmodels", repos = "http://cran.us.r-project.org"));
  if (!suppressMessages(require("tsne"))) suppressMessages(install.packages("tsne", repos = "http://cran.us.r-project.org"));
  if (!suppressMessages(require("e1071"))) suppressMessages(install.packages("e1071", repos = "http://cran.us.r-project.org"));
  if (!suppressMessages(require("fastrtext"))) suppressMessages(install.packages("fastrtext", repos = "http://cran.us.r-project.org"));
  if (!suppressMessages(require("lsa"))) suppressMessages(install.packages("lsa", repos = "http://cran.us.r-project.org"));
  if (!suppressMessages(require("qdap"))) suppressMessages(install.packages("qdap", repos = "http://cran.us.r-project.org"));
  if (!suppressMessages(require("Rtsne"))) suppressMessages(install.packages("Rtsne", repos = "http://cran.us.r-project.org"));
  if (!suppressMessages(require("mp"))) suppressMessages(install.packages("mp", repos = "http://cran.us.r-project.org"));
  if (!suppressMessages(require("bibliometrix"))) suppressMessages(install.packages("bibliometrix", repos = "http://cran.us.r-project.org"));
  
  library(devtools)
  install_github("trinker/qdapDictionaries")
  install_github("trinker/qdapRegex")
  install_github("trinker/qdapTools")
  install_github("trinker/qdap")

  print("success")

