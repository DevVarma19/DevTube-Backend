const mongoose = require('mongoose');

const mongoURI = process.env.mongoURI;
mongoose.set("strictQuery", false);

const connectToMongo = async () => {
    await mongoose.connect(mongoURI).then(() => {
        console.log("DB connected");
    }).catch((err) => {
        console.log(err);
    });
  };
  
connectToMongo();