var mongoose =require('mongoose');
var conn = mongoose.connect("mongodb://mongo:27017/try1",{ useNewUrlParser: true })
console.assert(conn,"Error connecting to the DB");
let userSchema = new mongoose.Schema({},{strict:false});
userSchema.pre('save', function(next) {                                                                                                                                        
    if(this.password) {                                                                                                                                                        
        var salt = bcrypt.genSaltSync(10)                                                                                                                                     
        this.password  = bcrypt.hashSync(this.password, salt)                                                                                                                
    }                                                                                                                                                                          
    next()                                                                                                                                                                     
}) 
module.exports.userSchema = mongoose.model("userModel",userSchema)
