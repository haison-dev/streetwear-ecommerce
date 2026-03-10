import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
        console.log("Connect successfully");
        
    } catch (error) {
        console.log("Connect failed", error);
        process.exit(1);
    }
}
