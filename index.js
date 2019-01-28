var express =require('express')
var app =express()
var models = require('./models/models')
const bodyparser = require('body-parser')
const bcrypt = require('bcrypt');
const saltRounds = process.env.SALT_ROUNDS || 10;
app.use(bodyparser.urlencoded({extended:true}))
let userModel = models.userSchema
app.listen(3000, (err) => {
    console.assert(!err,'Error')
})
app.get('/h', (req,res) => {
    var x =process.env
    var dat = new userModel({"name":"a","pass":"sss"});
    dat.save((err) => {
        if(!err) {
            userModel.find({},(err,results) => {
                if(!err) {
                    res.send(results);
                }
                else{
                    res.send("GFG")
                }
        
        
            });           
        }
        else res.send("GOne")
    });
    /**/
    //   res.send(x)
})


app.post('/register', (req,res) => {
    if(req.body.username && req.body.password ){
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            // Store hash in your password DB.
            req.body.password=hash;
            var newUser = new userModel(req.body);
            newUser.save((err) => {
                if(!err) res.send(newUser.password)
                else res.send(err)
            });
          });
    }


});

app.post('/login' , (req,res) => {
    if(req.body.username && req.body.password ){
        userModel.findOne({"name":req.body.username} , (err,results) => {
            if(err) res.send("Nope")
            else {
                bcrypt.compare(req.body.password,results.password, (err,res) =>{
                    if(!err && res){
                        res.send("OK")
                    }
                    else{
                        res.send("Nope")
                    }
                })
            }
        })

    }


})











