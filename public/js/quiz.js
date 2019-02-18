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