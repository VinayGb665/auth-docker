

var piler_url ="/v1/piler"
const piler_langs_url = "https://api.judge0.com/languages";

function showErr(msg,type,version){
    if(version==1){
        if(type==1){
            $("#alert").html(`</br><div class="alert alert-warning" role="alert">
            <strong>STDERR:&nbsp;&nbsp;&nbsp;</strong>`+msg['stderr']+`</div><div class="alert alert-success" role="alert">Accepted
        </div>'`)
        }
        else{
            $("#alert").html(`</br><div class="alert alert-danger" role="alert">`+msg['description']+`
        </div><div class="alert alert-warning" role="alert">
        <strong>STDERR:&nbsp;&nbsp;&nbsp;</strong>`+msg['stderr']+`</div>`)
        }
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
        } 
        else options =[]
    })


    //Add event listeners to submit async
     $("#editor").on('submit',(e)=>{

         e.preventDefault();
         
         let data ={
             "source_code":$("#textarea").val(),
             "lang":{"id":$('#drops option:selected').val()}
         }
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
             
            console.log(resp)
            let respo =(JSON.parse(resp))
            if(respo.hasOwnProperty('description')){
                if(respo['description']=="Accepted"){
                    showErr("a",1,1); // No compilation or runtime errors and 
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
})
