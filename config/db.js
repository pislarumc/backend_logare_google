const mongoose= require('mongoose')
const connectDB=async() => { 
    try{
        const conn=await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser:true,
            useUnifiedTopology: true,
            useFindAndModify:false, //all doilea parametru ne scapa de cateva  warnings in consola 
        })
        console.log(`MongoDB Connected : ${conn.connection.host}`)

    }catch(err)
    {
        console.error(err)
        process.exit(1) //exit with failure 

    }
}
module.exports=connectDB //pentru a accesa in app.ja
