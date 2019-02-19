function build_question_html(question){
    let html_str=''
   
    if(question[2]==1){
        html_str+=`
      
        <div class="mySlides">  
        <div class="card" >
        <div class="card-header">
                `+question[1]+`
        </div><div class="card-body">
        `;
        question[3].split(";").forEach((option)=>{
            html_str+=`
            
            <div class="input-group mb-3">
            <div class="input-group-prepend">
              <div class="input-group-text">
                <input type="radio" name="`+question[0]+`" aria-label="Checkbox for following text input">
              </div>
            </div>
            <input type="text" class="form-control" aria-label="Text input with checkbox" value="`+option+`">
            </div>
            
          `
        })
        html_str+='</div></div></div></br>'
    }
    else{

      html_str=`
      <div class="mySlides" type="2">  
      
      <div class="card">
<div class="card-body">`+question[1]+`

</div>
</div></div></br>`;
    }
    
    return html_str;
    
}


var slideIndex = 1;


function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  
  console.log(slides.length)
  var dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}    
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";  
  }
  // for (i = 0; i < dots.length; i++) {
  //     dots[i].className = dots[i].className.replace(" active", "");
  // }
  console.log(slides[slideIndex-1].getAttribute('type'))
  if(slides[slideIndex-1].getAttribute('type')==2){
    $("#editor").css('display','block');
  }
  else{
    $("#editor").css('display','none');
  }
  slides[slideIndex-1].style.display = "block";  
  //dots[slideIndex-1].className += " active";
}

$(document).ready(function(){
  var hash = window.location.pathname.split('/')[3];
  $("#editor").css('display','none');
  //console.log()
  $.post('/v1/quiz/'+hash,(data) => {
    console.log(data);
    var html_str = '';
    var span_str = '';
    for(i=0;i<data.length;i++){
      html_str +=build_question_html(data[i])
      span_str +=`<span class="dot" onclick="currentSlide(`+i+`)"></span>`;
    }
    $("#qbox").html(html_str);
    showSlides(slideIndex);
  })

})