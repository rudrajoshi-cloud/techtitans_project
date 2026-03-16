import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent("Hello");
        console.log(result.response.text());
    } catch(e) {
        fs.writeFileSync('gemini-error.json', JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
    }
}
test();
