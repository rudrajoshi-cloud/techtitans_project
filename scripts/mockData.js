import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // bypass mongoose validation to insert raw dummy data
        const collection = mongoose.connection.collection('safetyreports');
        await collection.deleteMany({});
        
        const dummyReports = [];
        const categories = ['Harassment reported', 'Poor lighting', 'Unsafe area', 'Suspicious activity', 'Safe zone'];
        
        // Create 100 random points between New Delhi and Jaipur bounding box
        // Delhi: 28.6, 77.2
        // Jaipur: 26.9, 75.8
        for(let i=0; i<150; i++) {
            dummyReports.push({
                userId: new mongoose.Types.ObjectId(), // Dummy ID
                latitude: 26.9 + Math.random() * (28.6 - 26.9),
                longitude: 75.8 + Math.random() * (77.2 - 75.8),
                category: categories[Math.floor(Math.random() * categories.length)],
                description: 'Mock report for testing heatmap',
                createdAt: new Date(),
                updatedAt: new Date(),
                timestamp: new Date()
            });
        }
        
        await collection.insertMany(dummyReports);
        console.log("Mock safety reports inserted.");
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
run();
