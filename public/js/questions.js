$(document).ready(function(){
    var timeSelected = false;
    
    $.get('/v1/gettopics',(data)=>{
        if(data){
            console.log(data)
            let topics = data
            let html_str = '<label >Select Topic:</label><select  class="form-control" id="drops">';
            
            topics.forEach( (topic) => {
                html_str+=`<option value=`+topic+`>`+topic.slice(0,-4)+`</option>`
            })
            html_str+='</select></br>'
            $("#topics").html(html_str);
            getquestions();

        }

    })
    function build_question_html(question){
        let str=''
       
        if(question[2]==1){
            str+=`
            <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input"  id="`+question[1]+`" type="checkbox" value="`+question[0]+`" id="defaultCheck1">
             <label class="custom-control-label"  style="position:relative;left:102%;top:-15%" for="`+question[1]+`"></label>
            </div>
            <div class="card" >
            <div class="card-header">
                    `+question[1]+`
            </div><div class="card-body">
            `;
            question[3].split(";").forEach((option)=>{
                str+=`
                
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
            str+='</div></div></br>'
        }
        else if(question[2]==2){
          
            str=`
            <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input"  id="`+question[1]+`" type="checkbox" value="`+question[0]+`" id="defaultCheck1">
            <label class="custom-control-label"  style="position:relative;left:102%;top:-15%" for="`+question[1]+`"></label>
           </div>
            <div class="card">
  <div class="card-body">`+question[1]+`
    
  </div>
</div></br>`;
        }
        else if(question[2]==3){
          
            str+=`
            <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input"  id="`+question[1]+`" type="checkbox" value="`+question[0]+`" id="defaultCheck1">
             <label class="custom-control-label"  style="position:relative;left:102%;top:-15%" for="`+question[1]+`"></label>
            </div>
            <div class="card" >
            <div class="card-header">
                    `+question[1]+`
            </div><div class="card-body">
            `;
            question[3].split(";").forEach((option)=>{
                str+=`
                
                <div class="input-group mb-3">
                <div class="input-group-prepend">
                  <div class="input-group-text">
                    <input type="checkbox" name="`+question[0]+`" aria-label="Checkbox for following text input">
                  </div>
                </div>
                <input type="text" class="form-control" aria-label="Text input with checkbox" value="`+option+`">
                </div>
                
              `
        })
    }
        return str;
        
    }
    
    function getquestions(){
        let topic = $('#drops option:selected').val()
        console.log("adfsfs")
        $.get("/v1/selectq/"+topic,(data) =>{
            if(data){
                console.log(data)
                const csv_data = data;
                let html_str=``
                data.forEach((element) => {
                    html_str+=build_question_html(element)
                });
                $("#qbox").html(html_str);
            }
        })
    }
    function build_quiz(){
        let arri=$(".custom-control-input:checked")
        let questions=[]
        let hours = $("#hours").val() || 0;
        let mins = $("#mins").val()
        for(let i=0;i<arri.length;i++){
            questions.push(arri[i].value)
        }
      
        questions.push({"topic":$('#drops option:selected').val()})
        console.log(questions,hours,mins)
        $.post("/v1/createquiz",{'questions':questions,'hours':hours,'mins':mins},(data) => {
            console.log(data)
            
            
            $("#modalpopper").click()
            $("#link_shower").html(data['link']);
            $("#link_shower").text(data['link']);
            
        })
    }
    
    function select_time(){
        $("#qbox").css('display','none');
        $("#topics").css('display','none');
        $("#timeselector").css('display','block');
        timeSelected=true;
    }

    $("#topics").on('change',(e) =>{
        getquestions();
    })

    $("#maketest").on('click',(e) => {
        if(timeSelected) build_quiz()
        else{
            select_time();
        }

    })
})