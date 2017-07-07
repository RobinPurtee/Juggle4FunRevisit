
function foldClickHandler(mouseEvt){
    /* Toggle between adding and removing the "active" class, to highlight the button that controls the panel */
    this.classList.toggle("active");

    /* Toggle between hiding and showing the active panel */
    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
        panel.style.display = "none";
    } else {
        panel.style.display = "block";
    }                       
}

var buttonIdName = "-button";


class Pleat{


    constructor(element){
        this.article = element;
        this.article.style.display = "none";
        this.article.onclick = this.contract;
        let title = element.getElementsByTagName("h1");
        if(0 < title.length){
            this.fold = document.createElement("Button");
            this.fold.id = this.article.id + buttonIdName;
            this.fold.onclick = this.expand;
            this.fold.onclick =  foldClickHandler;
            this.fold.style.display = "block";

            this.fold.className = "pleatButton";    
            this.fold.innerHTML = title[0].innerHTML;
            element.parentElement.insertBefore(this.fold, element);
        }
    }

    expand(buttonEvt){
        let pleat = pleats.findArticle(this.id);
        
        pleat.fold.toggle("active", true);
        pleat.article.style.display = "block";
    }

    contract(){
        let pleat = pleats.findArticle(this.id);

        pleat.fold.toggle("active", false);
        pleat.article.style.display = "none";
    }

}

class Pleats{
    pleats;

    constructor(articles)
    {
        var pleats = new Array();
        if(0 < articles.length){
            for(let i = 0; i < articles.length ; ++i){
                logArticle(articles[i]);
                let curPleat = new Pleat(articles[i]);
                curPleat.fold.onclick = curPleat.expand;
                
                curPleat.article.onclick = curPleat.contract; 
                pleats.push(curPleat);
            }
        }
    }


    findArticle(articleButtonId){
        let isfound = false;
        let i = 0;

        let articleId = articleButtonId.substring(0, articleButtonId.lastIndexOf("-"));
        for( ; !isfound && i < this ; ++i){
            isfound = this.pleats[i].article.id === articleId;
        }
        if(isfound){
            return this.pleats[i];
        }
        throw(new Error("Article Not Found"));
    }

}

function logArticle(element){
    console.log(element.id);
    let title = element.getElementsByTagName("h1");
    if(0 < title.length){
        console.log("Article Title = " + title[0].innerHTML);
    }
}



function listArticles(){
    let articles = document.getElementsByTagName("article");
    pleats = new Pleats(articles);
}


window.onload = listArticles;
