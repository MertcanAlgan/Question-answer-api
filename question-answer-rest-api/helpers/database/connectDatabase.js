var mongoose = require('mongoose');

var connectDatabase = () =>{

    mongoose.connect(process.env.MONGO_URI)
    .then(()=> {
        console.log("Mongodb connection succesful");
    })
    .catch(err=> {
        console.error(err);
    })
};

module.exports = connectDatabase;