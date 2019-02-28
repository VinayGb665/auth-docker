

var piler_url ="/v1/piler"
const piler_langs_url = "https://api.judge0.com/languages";
var respo;
var source_codes=[];
function showErr(msg,type,version){
    if(version==1){
        let html_str='';
        if(type==1){
            html_str=`</br><div class="alert alert-warning" role="alert">
            <strong>STDERR:&nbsp;&nbsp;&nbsp;</strong>`+msg['stderr']+`</div><div class="alert alert-success" role="alert">Accepted
        </div>`
        console.log(msg)
        }
        else{
            
            html_str=`</br><div class="alert alert-danger" role="alert">`+msg['description']+`
        </div><div class="alert alert-warning" role="alert">
        <strong>STDERR:&nbsp;&nbsp;&nbsp;</strong>`+msg['stderr']+`</div>`
        }
        html_str+=`<div class="alert alert-success" role="alert"><strong>STDOUT : &nbsp;&nbsp;&nbsp;</strong>`+msg['stdout']
        html_str+=`<div ><details><summary>More details</summary><p>TIME : &nbsp;`+msg['time']+`</p><p>MEMORY : &nbsp;`+msg['memory']+`</p></details></div></div>`

        $("#alert").html(html_str)

        
    }
    else{
        let err_msg =msg['stderr']
        let fi = err_msg.lastIndexOf('^')
        let li = err_msg.indexOf('(C:')
        if(fi!=-1 && li!=-1) err_msg= err_msg.slice(fi,li);

        $("#alert").html( `</br><div class="alert alert-warning" role="alert">
        <strong>STDERR:&nbsp;&nbsp;&nbsp;</strong>`+err_msg+`</div>
        <div class="alert alert-success" role="alert"><strong>STDOUT : &nbsp;&nbsp;&nbsp;</strong>`+msg['stdout']+`</div>`
        )

    }
    fill_cache_code();  
}

function fill_cache_code(){
    let lang = $('#drops option:selected')
    $("#textarea").val("");
    $("#textarea").prop('disabled', true);
    let fi = lang[0].innerHTML.indexOf('(')
    lang = encodeURIComponent(lang[0].innerHTML.slice(0,fi-1));
    
    if(lang.substr(-1)=="#"){
        console.log("asda")
        lang="C%23"
    }
    
    $.get("/v1/cache_code/"+lang,(data) => {
        console.log('got back');
        $("#textarea").prop('disabled', false);
        $("#textarea").val(data);
        
    })
    
}

function splitValue(value, index) {
    return value.substring(0, index) + "\t  " + value.substring(index);
}


$(document).ready(function(){

    //Onload fetch all the languages to fill in the select dropdowmm
    $.get(piler_langs_url,(data) =>{ 
        if(data){
            let html_str = '<select  class="form-control" id="drops">';
                
            data.forEach(element => {
                html_str+=`<option value=`+element['id']+`>`+element['name']+`</option>`
            });
            html_str+='</select>'
            $("#selector").html(html_str);

            fill_cache_code()
            
        } 
        else options =[]
    }).then(() => {
        $("#drops").on('change',(e) => {
            fill_cache_code()
        })

    })


    //Add event listeners to submit async
     $("#editor").on('submit',(e)=>{

         e.preventDefault();
         
         let data ={
             "source_code":$("#textarea").val(),
             "lang":{"id":$('#drops option:selected').val()}
         }
         /**
          * Storing the response for the code which will be run here since the editor is just a hide/show widget we need to clear it
          */
         let code_resp={}
        
         code_resp.question = slides[slideIndex-1].textContent.trim()
         code_resp.qid = slides[slideIndex-1].getElementsByTagName('input')[0].id;
         code_resp.source_code = $("#textarea").val();
         
         let version=$('#version option:selected').val()
         console.log("version",version)
         if(version==2){
             piler_url="/v2/piler" 
         }
         else{
            piler_url="/v1/piler"
         }
         //Send source code and wait for response

         $.post(piler_url,data,(resp) =>{
             
            
            respo =(JSON.parse(resp))
          
            if(respo.hasOwnProperty('description')){

                code_resp.token=respo.token;
                source_codes.push(code_resp)

                if(respo['description']=="Accepted"){
                    showErr(respo,1,1); // No compilation or runtime errors and 
                }
                else{
                    showErr(respo,2,1)
                }
            }
            else if(respo.hasOwnProperty('stderr')){
                showErr(respo,version=2)
            }

            else{
                showErr("INTERNAL ERROR",3,1)
            }
        
         })
     })

     $("#textarea").on('keydown', (e) => {
         if(e.keyCode == 9){
             e.preventDefault();
  
             document.execCommand('insertText', false, ' '.repeat(4)); //--Adds tabspace not sure how-- checkout this here -> https://stackoverflow.com/a/52918135/6666596
         }
     })


    
})
