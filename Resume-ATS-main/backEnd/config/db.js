import mongoose from 'mongoose';

const connectDB = async () => {
	if (!process.env.MONGO_URI) {
		console.warn('⚠️ MONGO_URI is not set. Database features will be disabled until set.');
		return;
	}
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI, {
			dbName: process.env.MONGO_DATABASE
		});

		console.log(`MongoDB connected: ${conn.connection.host}`);
	} catch (error) {
		console.error(`MongoDB connection error: ${error.message}`);
	}
};

export default connectDB;
