var express =require('express')
var app =express()
var models = require('./models/models')
const uuidv4 = require('uuid/v4')
const bodyparser = require('body-parser')
const bcrypt = require('bcrypt');
const saltRounds = process.env.SALT_ROUNDS || 10;
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
let userModel = models.userSchema



app.listen(3000, (err) => {
    
    console.assert(!err,'Error');

})



app.get('/v1/users/:username?', (req,res) => {
    console.log(req)
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
    console.log(req)
    var uname = req.body.username
    if(uname && req.body.password ){
    
        userModel.find({username:uname}, (err,results) => {
            if(err){
                res.send({'status':'Error.Please Try again','err':err});
            }
            else{
                if(results.length>0){
                    res.send({'status':'Error.User Exists'})
                }
                else{
                    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                        // Store hash in your DB.
                        req.body.password=hash;
                        var newUser = new userModel(req.body);
                        newUser.save((err) => {
                            if(!err) res.send({'user':uname,'status':'Successfully registered'})
                            else res.send({'status':'Error.Please Try again','err':err});
                         });
                      });
                }
            }

        })


       
    }
    else{

        res.send({'status' : 'Check your parameters'})
    }


});

app.post('/v1/login' , (req,res) => {
    console.log(req.body)
    var uname = req.body.username
    var pass = req.body.password;

    if(uname && pass ){
        userModel.findOne({"username":uname} , (err,results) => {
            if(err || !results) { 
                res.send(res.send({'status':'Login Failed - No such user'}))
            }
            else {

                bcrypt.compare(pass,results.password, (err,resu) =>{
                    if(!err && resu){
                        res.send({
                            'user': uname,
                            'token': uuidv4()
                        })
                    }
                    else{
                        res.send({'status':'Login Failed - Hash doesnt match'})
                    }
                })
            }
        })

    }
    else{
        
    }



})







