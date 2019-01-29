/*

*/

// Packages,envs and dependencies -- >

var mongoose =require('mongoose');
const crypto = require('crypto');

/*
                                 ** TODO **
        Make the DB more pluggable and configurable ## rn used as a service

*/ 
const mongo_port = process.env.MONGO_PORT || 27017; // Configurable mongodB port
const coll_name = process.env.COL_NAME || 'users'; // Configurable collection name 

// Connection -->

var conn = mongoose.connect('mongodb://mongo:'+mongo_port+'/'+coll_name,{ useNewUrlParser: true })
console.assert(conn,"Error connecting to the DB");

// Schemas -->

let userSchema = new mongoose.Schema({},{strict:false}); 

// Middleware for Schemas -->


userSchema.pre('save', function(next) {     // Middleware to hash passwords after every save to DB                                                                                                                                    

    if(this.password) {                                                                                                                                                        
                                                                                                                                       
        this.password  = crypto.pbkdf2Sync(this.password, this.salt,1000, 64, `sha512`).toString(`hex`);                                                                                                                
    }                                                                                                                                                                          
    next()                                                                                                                                                                     
}) 

//exports
module.exports.userSchema = mongoose.model("userModel",userSchema)
