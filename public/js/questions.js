$(document).ready(function(){
   
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
        }
        return str+'</div></div></br>';
        
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
        
        for(let i=0;i<arri.length;i++){
            questions.push(arri[i].value)
        }
      
        questions.push({"topic":$('#drops option:selected').val()})
        console.log(questions)
        $.post("/v1/createquiz",{'questions':questions},(data) => {
            console.log(data)
            
            
            $("#modalpopper").click()
            $("#link_shower").html(data['link']);
            $("#link_shower").text(data['link']);
            
        })
    }

    $("#topics").on('change',(e) =>{
        getquestions();
    })

    $("#maketest").on('click',(e) => {
        build_quiz()
    })
})