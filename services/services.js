const nodemailer = require('nodemailer');
var models = require('../models/models');
let userModel = models.userSchema;
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
    

}
module.exports=services;