const nodemailer = require('nodemailer');
const crypto = require('crypto');
var csv = require("fast-csv");
var models = require('../models/models');
var fs = require('fs')
const cache_code =require('../cache_code')
const exec = require('child_process').exec;
var services = require('./services');
let userModel = models.userSchema;
let quizModel = models.quizSchema;

var auth_services ={
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
}