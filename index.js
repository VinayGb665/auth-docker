/**
 * [...]
 * Docker some shit man
 * @author Hector
 * @version 1.0 29/1/19 
 * @since node-11
 */


// Packages and dependancies -- >
var express =require('express')
var app =express()
var models = require('./models/models')
const uuidv4 = require('uuid/v4')
const bodyparser = require('body-parser')
const crypto = require('crypto');
const saltRounds = process.env.SALT_ROUNDS || 10;
const http_port = process.env.HTTP_PORT || 3000
let userModel = models.userSchema

// Configs -- >

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

// Routes  -- >

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

app.listen(3000, (err) => {
    
    console.assert(!err,'Error');

})






