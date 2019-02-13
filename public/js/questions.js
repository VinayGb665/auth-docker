$(document).ready(function(){
    $.get("/v1/selectq",(data) =>{
        if(data){
            const csv_data = data;
            let html_str=``
            data.forEach(element => {
                html_str+=`<input class="checksy" type="checkbox" value="`+element[1]+`" id="defaultCheck1"> <button type="button" class="btn btn-info" >`+element[1]+`</button></br></br>`
            });
            $("#qbox").html(html_str);
        }
    } )



    $("#maketest").on('click',(e) => {
        let arri=$(".checksy:checked")
        let questions=[]
        
        for(let i=0;i<arri.length;i++){
            questions.push(arri[i].value)
        }
        console.log(questions)
    })
})