import mongoose from "mongoose"

export default () => 
{
    const connect = () => 
    {
        mongoose.connect("mongodb://localhost:27017/chattyapp-backent")
            .then(() => {
                console.log("Successfully connected to database.");
            })
            .catch((error) => {
                console.log("Failed to connect to database", error);
                return process.exit(1);
            })
    };
    connect();

    mongoose.connection.on("disconnect", connect);
}