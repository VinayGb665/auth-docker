const nodemailer = require('nodemailer');
const crypto = require('crypto');
var csv = require("fast-csv");
var models = require('../models/models');
const cache_code =require('../cache_code')
var fs = require('fs')
const exec = require('child_process').exec;
let userModel = models.userSchema;
let quizModel = models.quizSchema;

var transporter = nodemailer.createTransport({
    host: process.env.smtp_host,
    port: process.env.smtp_port,
    secure: true, // use SSL
    proxy: process.env.proxy,
    auth: {
           user: process.env.mail_user,
           pass: process.env.mail_password
       }
   });

var services = {

    sendmail : (req,res,cb) =>{

        let mailOptions = {
            from: process.env.mail_user, // sender address
            to: req.body.send_to, // list of receivers
            subject: req.body.subject, // Subject line
            html: req.body.content// html content
          };
        transporter.sendMail(mailOptions, cb);
    },

    reset_pass : (req,res) =>{
        /**
         * Check if username exists
         * Check if user has email_adress recorded in the DB 
            *  If no then locked out
         * If everything checks out send out and email with some specific hash 
        
         */
        userModel.findOne({'username':req.body.send_to},(err,results) => {
            console.log(results)
            if(!err && results){
                results =JSON.parse(JSON.stringify(results));
                if(results.email){
                    var resetHash = results.password.slice(0,15)+results.salt.slice(0,6);
                    console.log(resetHash);
                    req.body.send_to = results.email;
                    req.body.subject = "Password reset request"
                    req.body.content = `<html><body><p>We recieved a password reset request for this account .Please <a href="http://localhost:3000/reset/`+resetHash+`">Click Here </a> to reset </p></body></html>`;

                    services.sendmail(req,res, (err, info ) =>{
                        console.log(err);
                        if(err) res.send({'status':'There was an error sending out the email','err':err})
                        else{
                            res.send({'status':'Success.Reset link has been sent to the users email'});
                        }
                    });
                   
                }
                else{
                    res.send({'status':'Cannot send password reset link. No email found for the user .'});
                }

            }
            else{
                res.send({'status':'Error. No such username found'})
            }

        })
    },

    verifyhash: (req,res)=> {
        if(req.params.username && req.params.hash){
            userModel.findOne({username:req.params.username},(err,data) => {
                if(!err && data){
                    var actualHash = results.password.slice(0,15)+results.password.slice(0,6);
                    if(actualHash == req.params.hash){
                        /**
                         * Unprogrammed PATH 
                         */

                
                        pass;

                    }
                    else{
                        /**
                         * Unprogrammed PATH 
                         */
                    }
                }
            })
        }
        else{
            res.send()
        }
    },
    gettopics: (req,res) =>{
        fs.readdir('resources/',(err,data) =>{
            console.log(err,data)
            if(err) res.send(err)
            else res.send(data)
        })

    },
    getcachecode : (req,res) => {
        let language = req.params.language;
        console.log(decodeURIComponent(language))
        if(cache_code.hasOwnProperty(language)){

            res.send(cache_code[language]);
        }
        else{
            console.log("nope")
            res.send("");
        }
    },
    createquizlink : (req,res) => {
        let qarr = req.body.questions;
        let hash = crypto.randomBytes(5).toString('hex');
        var newq = new quizModel({link:hash,questions:qarr})
        newq.save((err) =>{
            console.log(err);
            if(!err) res.send({"link":process.env.HTTP_HOST+":"+process.env.HTTP_PORT+"/v1/quiz/"+hash})
            else res.send("nope FO")
        })
    },
    renderquiz : (req,res) =>{
        let hash = req.params.hash;
        quizModel.findOne({link:hash},{_id:0,questions:1},(err,results) =>{

            console.log(err,results)

            if(!err && results){
                results=JSON.parse(JSON.stringify(results))
                let qarr=[]
                
                let topic = results.questions.pop()['topic']
                let qids=  results.questions.map(Number)
                
                csv
                .fromPath("resources/"+topic)
                .on("data", function(data){
                    for(i=0;i<qids.length;i++){
                        //console.log(qids[i])
                        if(qids[i]==data[0]){
                            //console.log('uh huh',i)
                            qarr.push(data)
                        }

                    }
                })
                .on("end", function(){
                     console.log(qarr)
                     res.send(qarr)
                })
                
            }
            else{
                if(!results){
                    res.send("OK SMD NO QUIZ FOR U")
                }
                else{
                    res.send(err)
                }
            }
        })
    },
    v2compiler : (req,res) => {
        /**
         * v1 of the system uses third party api (https://api.judge0.com) with a GNU license and  is vulnerable to licensing issues
         * v2 compiles code locally
         * Issues to be addressed
            - Safety of running the code directly (idea is to run this in a sandbox or a virtualenv so that effects remain contained )
            - Writing into file with same name rn (idea is to change to a 5 length random alpha-numeric )
            - Need to send more cleaner responses
            - Versioning for the different compilers
            - No idea on how this works under load so SCALING needed
            - **** LOCAL SYSTEM RN iS A WINDOWS MACHINE - CODE NEEDS TO BE ADAPTIVE ****
        * MORE LANGUAGES LOL

        */

        let source_code =req.body.source_code;
        let language = req.body.lang;
        console.log(req.body)
        if(language['id']=='34'){ // handling python codes

            fs.writeFile("prog.py",source_code,(err) => {
                exec("python prog.py",(err,stdout,stderr) => {
                    console.log(stdout,stderr)
                    if(err) res.send(JSON.stringify({"err":err,"stderr":stderr}))
                    else res.send(JSON.stringify({"stdout":stdout,"stderr":stderr}))
                    fs.unlink("prog.py",(err) => {
                        if(!err) console.log("deleted")
                        else console.log("error while executing")
                    });
                })
            })

        }
        else  if(language['id']=='29'){ // handling js/nodejs codes
            fs.writeFile("prog.js",source_code,(err) => {
                exec("node prog.js",(err,stdout,stderr) => {
                    console.log(stdout,stderr)
                    if(err) res.send(JSON.stringify({"err":err,"stderr":stderr}))
                    else res.send(JSON.stringify({"stdout":stdout,"stderr":stderr}));
                    fs.unlink("prog.js",(err) => {
                        if(!err) console.log("deleted")
                        else console.log("error while executing")
                    });
                })
            })


        }
        else if(language['id']=='4'){
            fs.writeFile("prog.c",source_code,(err) => {
                exec("gcc prog.c -o prog_out.exe",(err,stdout,stderr) => {
                    console.log(stdout,stderr)
                    if(err) res.send(JSON.stringify({"err":err,"stderr":stderr}))
                    else {
                        exec("prog_out.exe",(r_err,r_stdout,r_stderr)=>{
                            if(r_err) res.send(JSON.stringify({"err":r_err,"stderr":r_stderr}))
                            else res.send(JSON.stringify({"stdout":r_stdout,"stderr":r_stderr}))
                        })
                    }
                    fs.unlink("prog.c",(err) => {
                        if(!err) console.log("deleted")
                        else console.log("error while executing")
                    });
                    fs.unlink("prog_out.exe",(err) => {
                        if(!err) console.log("deleted")
                        else console.log("error while executing")
                    });
                    
                })
            })

        }
        else{
            res.send(JSON.stringify({"msg":"INTERNAL ERROR NO COMPILER FOUND"}))
        }

        //else if(language['id']){}

    }

    

}
module.exports=services;