// -- Globals used for DOM sldiing
var slideIndex = 1;
var progResponse ={};
// ------------------------------------------------

// -- Utility functions to render the quiz(html) after fetching data from the endpoint
function build_question_html(question){
    /**
     * question structure - [qid,question,question_type,additional-options]
     */

    let html_str=''
   
    if(question[2]==1){
        html_str+=`
      
        <div class="mySlides">  
          <div class="card" >
            <div class="card-header">
                `+question[1]+`
            </div>
            <div class="card-body">
        `;
        question[3].split(";").forEach((option)=>{
            html_str+=`
            
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <div class="input-group-text">
                  <input class="radioBtn" type="radio" name="`+question[0]+`" aria-label="Checkbox for following text input" value="`+option+`" >
                </div>
              </div>
            <input type="text" class="form-control" readonly aria-label="Text input with checkbox" value="`+option+`">
            </div>
            
          `
        })
        html_str+='</div></div></div></br>'
    }
    else{

      html_str=`
      <div class="mySlides" type="2">  
        <div class="card border-dark mb-3" >
          <div class="card-body">`+question[1]+`
          </div>
          <input id="`+question[0]+`" type="text" value="" style="display:none"/>
        </div>
      </div>
      </br>`;
    }
    
    return html_str;
    
}
// ------------------------------------------------



// -- Sliding DOM functions
function plusSlides(n) {
  showSlides(slideIndex += n);
  $("#textarea").val("")
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  
  var dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}    
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";  
  }
  
  if(slides[slideIndex-1].getAttribute('type')==2){
    $("#editor").css('display','block');
  }
  else{
    $("#editor").css('display','none');
  }
  slides[slideIndex-1].style.display = "block";  
  //dots[slideIndex-1].className += " active";
}

// ------------------------------------------------


// -- Event handler for ending the quiz
function endquiz(){
  let qcards = $(".mySlides");
  let Allrespjson=[]
  for(i=0;i<qcards.length;i++){
    let respjson={}
    let temp_root = qcards[i].firstElementChild;
    respjson.question=temp_root.firstElementChild.innerHTML.trim();
    let options = temp_root.getElementsByClassName('radioBtn');
    console.log(options.length)
    let flag = false;
    for(j=0;j<options.length;j++){
      respjson.qid = options[j].name;
      if(options[j].checked){
        respjson.answer = options[j].value;
        
        //console.log("COooo")
        flag=true;
       
      }
    }
    if(!flag){
      console.log("Prog question")
    }
    //console.log(respjson)
    Allrespjson.push(respjson)
  }
  console.log(Allrespjson)
  console.log('aaa',source_codes)
  //window.open('/','_parent',''); 
  
}

// -- event handler to get user details before staring quiz and validate the form
function startquiz(e){
  e.preventDefault()
  
  let flag=false;
 
  var theform = document.getElementById('start_form');
  let formarr = theform.getElementsByTagName('input');
  
  for(i=0;i<formarr.length;i++){
    
    if(formarr[i].value==""){
      $("#formmsg").html(`<div class="alert alert-warning" role="alert">
                    Please fill out all the fields!
          </div>`)

      flag=true;

      break;
    }
  }
  if(!flag){
   
    $.post('/v1/quizzee',{username:formarr[0].value,email:formarr[1].value,contact:formarr[2].value},(data) => {
      if(data){
        $("#ModalExample").modal('toggle'); 
        $("#username").html(formarr[1].value) // Setting username within the UI
        $('#timer').countdown('resume')
      }
    })
  }
  
}

$(document).ready(function(){
  
  var hash = window.location.pathname.split('/')[3];
  
  $("#editor").css('display','none');
  $("#ModalExample").modal('toggle');
  $('#myModal').modal('handleUpdate')
  
  
  let but = document.getElementById('takedet');
  
  $("#takedet").on('click',(e) => {
    startquiz(e);
  })
  
  $("#editor").on('submit', (e) =>{
    console.log("sssssssssss")
    console.log($("#textarea").val())
  })
  $.post('/v1/quiz/'+hash,(data) => {
  
    console.log(data);
    
    let hours = data.hours;
    let mins = data.mins;
    data = data.qarr;
    var html_str = '';
    var span_str = '';
    var date = new Date();
    
    for(i=0;i<data.length;i++){
      html_str +=build_question_html(data[i])
      span_str +=`<span class="dot" onclick="currentSlide(`+i+`)"></span>`;
    }
    
    date.setHours(date.getHours()+Number(hours))
    date.setMinutes(date.getMinutes()+Number(mins))
    //date.setSeconds(date.getSeconds()+15)
    
    
    $('#timer').countdown(date, function(event) {
      $(this).html(event.strftime('%H:%M:%S'));
    })
    $('#timer').countdown('pause')
    .on('finish.countdown', function() {
      $("#exampleModal").modal('toggle'); 
    })
   
    $("#qbox").html(html_str);
      showSlides(slideIndex);
    })
    

})