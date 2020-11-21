var mongoose=require('mongoose');
var passwordLocalMongoose=require('passport-local-mongoose');
var Schema=mongoose.Schema;

var User= new Schema({ 
    firstname:{
        type:String,
        default:''
    },
    lastname:{
        type:String,
        default:''
    },
    admin:   {
        type: Boolean,
        default: false
    }
});

User.plugin(passwordLocalMongoose);

module.exports=mongoose.model('User',User);