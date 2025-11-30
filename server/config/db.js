import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();


export const connectDB = async () => {
  try {
    // Listen for successful connection
    mongoose.connection.on('connected', () => {
      console.log('Database connected');
    });

    // Connect to MongoDB
    await mongoose.connect(`${process.env.MONGODB_URI}/Smartlearn`, {

    });

    console.log('MongoDB connection successful');

  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit process with failure
  }
};







// import mongoose from "mongoose";
// import dotenv from "dotenv";
// dotenv.config();
// export const connectDB = async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/Smartlearn`);
//     console.log("MongoDB Connected");
//   } catch (err) {
//     console.error("Error connecting to MongoDB:", err);
//     process.exit(1);
//   }
// };



