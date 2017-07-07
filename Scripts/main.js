var accordion;
var buttonIdName = '-button';

function Pleat(element){
    this.onFoldHandler = function(buttonEvt){
        this.classList.toggle("active");
        let article = this.nextElementSibling;
        if(article.style.display === "block"){
            article.style.display = "none";
            this.isExpanded = false;
        }
        else{
            article.style.display = "block";
            this.isExpanded = true;
        }
    }

    this.expand = function(){
        this.fold.style.display = "none";
        this.article.style.display = "block";
        isExpanded = true;
    }

    this.contract = function(){
        this.fold.style.display = "block";
        this.article.style.display = "none";
        isExpanded = false;
    }

    this.article = element;
    let title = element.getElementsByTagName("h1");
    if(0 < title.length){
        this.fold = document.createElement("Button");
        this.fold.id = this.article.id + buttonIdName;
        this.fold.className = "pleatButton";    
        this.fold.innerText = title[0].innerHTML;
        element.parentElement.insertBefore(this.fold, element);
    }
    this.fold.addEventListener('click', this.onFoldHandler);

    this.contract();

}

function Pleats(articles){
    this.pleats = new Array();
    if(0 < articles.length){
        for(let i = 0; i < articles.length ; ++i){
            let curPleat = new Pleat(articles[i]);
            curPleat.fold.addEventListener('click', this.onClickHandler);            
            curPleat.article.addEventListener('click', this.onClickHandler); 
            this.pleats.push(curPleat);
        }
    }


    this.onClickHandler = function(buttonEvt){
        let pleat = this.findArticle(this.id);
        if(pleat.isExpanded){
            pleat.contract();
        }
        else{
            pleat.expand();
        }
    }



    this.findArticle = function(articleButtonId){
        let isfound = false;
        let i = 0;
        let articleId = articleButtonId;
        let lastDash = articleId.lastIndexOf("-");
        if(buttonIdName === articleId.substring(lastDash)){
            articleId = articleButtonId.substring(0, lastDash);
        }

        while(!isfound && i < this.pleats.length){
            isfound = this.pleats[i].article.id === articleId;
            if(!isfound){
                ++i;
            }
        }
        if(isfound){
            return this.pleats[i];
        }
        throw(new Error("Article Not Found"));
    }

}


function listArticles(){
    let articles = document.getElementsByTagName("article");
    accordion = new Pleats(articles);
}


window.onload = listArticles;
