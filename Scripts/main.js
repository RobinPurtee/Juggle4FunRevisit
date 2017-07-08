var accordion;
var buttonIdName = '-button';

onFoldHandler = function(buttonEvt){
    let pleat = accordion.findArticle(this.id);
    if(pleat.isExpanded){
        pleat.contract();
    }
    else{
        pleat.expand();
    }
}

function Pleat(element){
    this.expand = function(){
        this.fold.style.display = "none";
        this.article.style.maxHeight =  this.article.scrollHeight + "px";
        this.isExpanded = true;
    }

    this.contract = function(){
        this.fold.style.display = "block";
        this.article.style.maxHeight = null;
        this.isExpanded = false;
    }

    this.article = element;
    let title = element.getElementsByTagName("h1");
    if(0 < title.length){
        this.fold = document.createElement("Button");
        this.fold.id = this.article.id + buttonIdName;
        this.fold.className = "pleatButton";    
        this.fold.innerText = title[0].innerText;
        element.parentElement.insertBefore(this.fold, element);
    }
    this.fold.addEventListener('click', onFoldHandler);
    this.article.addEventListener('click', onFoldHandler);

    this.contract();

}

function Pleats(articles){
    this.pleats = new Array();
    if(0 < articles.length){
        for(let i = 0; i < articles.length ; ++i){
            let curPleat = new Pleat(articles[i]);
             this.pleats.push(curPleat);
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


window.onload = function(){
    let articles = document.getElementsByTagName("article");
    accordion = new Pleats(articles);
}

