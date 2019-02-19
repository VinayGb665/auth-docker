/**
 * [...]
 * Docker some shit man
 * @author Hector
 * @version 1.0 29/1/19 
 * @since node-11
 */


// Packages and dependancies -- >
require('dotenv').config()

var express =require('express')
var app =express()
var models = require('./models/models')
const uuidv4 = require('uuid/v4')
const bodyparser = require('body-parser')
const crypto = require('crypto');
const saltRounds = process.env.SALT_ROUNDS || 10;
const http_port = process.env.PORT || process.env.HTTP_PORT ;
let userModel = models.userSchema
var services = require('./services/services');
var auth_services = require('./services/auth_services');
var request = require('request')
const fs = require('fs')
const path = require('path');
const exec = require('child_process').exec;
var csv = require("fast-csv");
// Configs -- >

app.set('view engine', 'ejs');
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
app.use('/static', express.static(path.join(__dirname, 'public')))

// Routes  -- >
app.get('/',(req,res) =>{
    //res.sendFile(__dirname+"/views/idk.html")
    res.render('pages/index');
})


app.get('/editor',(req,res) =>{
    //res.sendFile(__dirname+"/views/idk.html")
    res.render('pages/piler');
})

app.get('/choseq',(req,res) =>{
    res.render('pages/qpage');
})

app.get('/v1/users/:username?', (req,res) => {
    /*
        Get details of particular user or all users if none specified

    */
    var username = req.params.username;
    if(username){
        userModel.find({username:username}, (err,results) => {
                if(!err) res.send(results)
                else res.send(err) 
        })
    }
    else{
        userModel.find({}, (err,results) => {
            if(!err) res.send(results)
            else res.send(err) 
        })
    }
    
})

app.get('/v1/reset/:username', (req,res) => {
    req.body.send_to = req.params.username;
    
    req.body.subject = "Reset password request"
    auth_services.reset_pass(req,res);
    //res.send(process.env);

})

app.get('/v1/reset/:username/:hash',(req,res) => {
    
    //res.send(req.params);
   // services.verifyhash(req,res);
})

app.get('/v1/selectq/:subname/',(req,res) =>{
    
    let subname = req.params.subname
    let results =[]
    csv
    .fromPath("resources/"+subname)
    .on("data", function(data){
         results.push(data)
    })
    .on("end", function(){
         res.send(results);
    })

});

app.get('/v1/gettopics',(req,res) =>{
    services.gettopics(req,res);
})

app.get('/v1/quiz/:hash',(req,res) =>{
    res.render('pages/quiz');
})

app.post('/v1/quiz/:hash',(req,res) =>{
    services.renderquiz(req,res);
})

app.post('/v1/createquiz',(req,res) => {
    services.createquizlink(req,res);
})

app.post('/v1/users/:username', (req,res) => {
    /* 
        Create/register new users
        REQ  ->
             - username and password fields are mandatory
             - Schema-less so can add more fields

        RESP ->
             - {'status':'Error'} with err message in case of any errors
             - {'user':'name','status':'Success' ,'secretSalt':'xxx'} in case of successful signup 
                - Generates a random 16 bit salt to generate and compare hashes later
    */

    var uname = req.body.username

    if(uname && req.body.password ){
        // Validating whether the request has the required fields or not
        
        userModel.find({username:uname}, (err,results) => { 
            //look if the user already exists
            if(err){

                res.send({'status':'Error .Please Try again','err':err}); 

            }
            else{
                if(results.length>0){
                    res.send({'status':'Error.User Exists'})

                }
                else{                                          
                    /* 
                                                        ** TODO **
                        Option to supply a custom salt of user preference and use a random if none supplied

                    */
                        req.body.salt = crypto.randomBytes(16).toString('hex');  // Generate a 16 bit random salt used in the middleware for hashing
                        req.body.flago = false; // Flag used later for verification
                        var newUser = new userModel(req.body);

                        
                        newUser.save((err) => {                            
                            if(!err) res.send({'user':uname,'status':'Successfully registered','secretSalt':req.body.salt}) 
                            else res.send({'status':'Error.Please Try again','err':err});
                         });
              
                }
            }

        })


       
    }
    else{

        res.send({'status' : 'Check your parameters'}) //Invalid request since some required fields were missing
    }


});

app.post('/v1/login' , (req,res) => {
    /* 
        Login
        REQ  ->
             - username and password fields are mandatory

        RESP ->
             - {'status':'Error'} with err message in case of any errors
             - {'user':'name','token':'UUID' } in case of successful login
                - Token changes after every login and can be used to handle Oauths or some other session things
    */
    var uname = req.body.username
    var pass = req.body.password;

    if(uname && pass ){
        userModel.findOne({"username":uname},{_id:0,salt:1,password:1} , (err,results) => { // Look for the user using name
            
            if(err || !results) { 
                res.send(res.send({'status':'Login Failed - No such user'})) 
            }
            else {
                results =JSON.parse(JSON.stringify(results))
                let newHash = crypto.pbkdf2Sync(pass, results.salt,1000, 64, `sha512`).toString(`hex`);   // Compute the hash using prexisting salt and the password supplied                                                                                                                              
                if(newHash==results.password){ 
                    /*
                        Crude way of doing this by comparing the hashes itself as strings 
                                        ** TODO **
                                Find a better way to compare hashes
                    */
                    res.send({
                        'user': uname,
                        'token': uuidv4() // token for login
                    })
                }
                else{
                    res.send({'status':'Login failed - hashes dont match'})
                }
            }
        })

    }
    else{

        res.send({'status' : 'Check your parameters'}) //Invalid request since some required fields were missing
    }



})

app.post('/v1/piler',(req,res) =>{
    BASE_URL = "https://api.judge0.com/submissions?wait=true"

    // CLIENT_SECRET ='48a4bf23783a007876faaa3b309000aafbda64ee'; 
    // source ="console.log('Hello World!!');"

    let source_code =req.body.source_code;
    let language = req.body.lang;
    
    var data ={
        "source_code": source_code,
        "language_id": language.id,
        "number_of_runs": "1",
        "stdin": "",  //Any input ---- NEED_REWORK_ON_HOW_TO_USE_THIS_FOR_THE_NEED ---- // ---- PLAN_ON_HOW_TO_FEED/FETCH_THIS ----
        "cpu_time_limit": "2",
        "cpu_extra_time": "0.5",
        "wall_time_limit": "5",
        "memory_limit": "128000",
        "stack_limit": "64000",
        "max_processes_and_or_threads": "30",
        "enable_per_process_and_thread_time_limit": false,
        "enable_per_process_and_thread_memory_limit": true,
        "max_file_size": "1024"
    }


    request({url:BASE_URL,method:'POST',body:data, json: true},(err,resp) => {
       
        //success =>{ "status":{"id":3,"description":"Accepted"}}   
        console.log(resp.body)

        if(err) res.send(err)

        else {
            let send_data =resp.body.status;
            send_data['stdout']=resp.body.stdout;
            send_data['stderr']=resp.body.stderr;
            send_data['time']=resp.body.time;
            send_data['memory']=resp.body.memory;
            send_data=JSON.stringify(send_data)
            res.send(send_data);
        }
    });

})

app.post('/v2/piler',(req,res) => {
    services.v2compiler(req,res);
})

app.get('/v1/cache_code/:language',(req,res) => {
    services.getcachecode(req,res);

})
app.listen(http_port, (err) => {
    console.log(http_port)
    console.assert(!err,'Error');

})




