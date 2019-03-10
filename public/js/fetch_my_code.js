var token = window.location.pathname.split('/')[4];
$(document).ready(function(){
    
    token= '1d6a1bd6-93d1-40cd-b78b-a9af01942019'
    $.get('https://api.judge0.com/submissions/'+token+'?base64_encoded=false&fields=source_code',(data,err)=>{
        console.log(data,err)
        if(data){
            console.log(data.source_code)
           //setTimeout(() =>{
            //    console.log($("textarea#textarea").val())
                $("textarea#textarea").val(data.source_code)
            //},100)
            $("#drops").attr('disabled','true');
        }
        
    }).fail(()=>{
        console.log('aa')
        window.location="/404"
    })

})