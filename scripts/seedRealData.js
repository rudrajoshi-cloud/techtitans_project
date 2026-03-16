import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import csv from 'csv-parser';
import SafetyReport from '../src/models/SafetyReport.js'; // Use the Model directly for validation

dotenv.config();

const CSV_FILE_PATH = 'C:/Users/RUDRA_JOSHI/Downloads/india_safety_locations_500.csv';

const run = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected.");
        
        await SafetyReport.deleteMany({});
        
        const reports = [];
        
        const getCategory = (safetyScore, lightingScore) => {
            if (isNaN(safetyScore) || isNaN(lightingScore)) return 'Harassment reported';
            if (safetyScore >= 80 && lightingScore > 8.0) return 'Safe zone';
            if (safetyScore < 70 && lightingScore < 7.0) return 'Unsafe area';
            if (lightingScore < 7.5) return 'Poor lighting';
            if (safetyScore < 75) return 'Suspicious activity';
            return 'Harassment reported'; 
        };

        fs.createReadStream(CSV_FILE_PATH)
            .pipe(csv())
            .on('data', (row) => {
                const lat = parseFloat(row.latitude);
                const lng = parseFloat(row.longitude);
                if (isNaN(lat) || isNaN(lng)) return;

                const safetyScore = parseInt(row.safety_score);
                const lightingScore = parseFloat(row.lighting_score);

                const numReportsToGenerate = safetyScore >= 80 ? 1 : 
                                            safetyScore >= 75 ? 2 : 
                                            safetyScore >= 70 ? 3 : 5;

                for (let i = 0; i < numReportsToGenerate; i++) {
                    const jitterLat = lat + (Math.random() - 0.5) * 0.01;
                    const jitterLng = lng + (Math.random() - 0.5) * 0.01;
                    
                    reports.push({
                        userId: new mongoose.Types.ObjectId(), 
                        latitude: jitterLat,
                        longitude: jitterLng,
                        category: getCategory(safetyScore, lightingScore),
                        description: `Reported incident near ${row.place_name}, ${row.city}`,
                        timestamp: new Date()
                    });
                }
            })
            .on('end', async () => {
                try {
                    console.log(`Parsed CSV successfully. Seeding ${reports.length} customized reports...`);
                    // Use Mongoose insertMany so it gives us a readable validation error if one exists
                    await SafetyReport.insertMany(reports);
                    console.log("Real safety reports inserted from CSV data!");
                    process.exit(0);
                } catch(e) {
                   console.error("Mongoose Validation Error:", e.message);
                   process.exit(1);
                }
            });

    } catch(err) {
        console.error("Failed to seed real data:", err);
        process.exit(1);
    }
}

run();
