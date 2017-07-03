
function foldClickHandler(){
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

class Pleat{

    toggleFold(buttonEvt){ 
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


    constructor(element){
        this.article = element;
        let title = element.getElementsByTagName("h1");
        if(0 < title.length){
            this.fold = document.createElement("Button");
            this.fold.onclick =  foldClickHandler;

            this.fold.className = "pleatButton";    
            this.fold.innerHTML = title[0].innerHTML;
            element.parentElement.insertBefore(this.fold, element);
        }
    }

}



function logArticle(element){
    console.log(element.id);
    let title = element.getElementsByTagName("h1");
    if(0 < title.length){
        console.log("Article Title = " + title[0].innerHTML);
    }
}


var pleats = new Array();

function listArticles(){
    let articles = document.getElementsByTagName("article");
    if(0 < articles.length){
        for(let i = 0; i < articles.length ; ++i){
            logArticle(articles[i]);
            pleats.push(new Pleat(articles[i]));
        }
    }
}


window.onload = listArticles;
