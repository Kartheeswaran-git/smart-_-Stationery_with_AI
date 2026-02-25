import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`Generating image for: "${prompt}"`);

    const queryModel = async (retryCount = 0) => {
        try {
            const response = await fetch(
                "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
                {
                    headers: {
                        Authorization: `Bearer ${process.env.HF_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                    method: "POST",
                    body: JSON.stringify({
                        inputs: `Ecommerce product photography, white background, ${prompt}, realistic, high quality`
                    }),
                }
            );

            // 🔁 If model is loading
            if (response.status === 503) {
                const errorData = await response.json();

                if (retryCount < 5) {
                    const waitTime = Math.ceil(errorData.estimated_time || 5);
                    console.log(`Model loading, retrying in ${waitTime}s...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
                    return queryModel(retryCount + 1);
                }
            }

            // ❌ Other errors
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HF API Error (${response.status}):`, errorText);
                return res.status(response.status).send(errorText);
            }

            // ✅ Success
            const buffer = await response.arrayBuffer();
            const base64Image = Buffer.from(buffer).toString('base64');
            const dataUrl = `data:image/png;base64,${base64Image}`;

            res.json({ image: dataUrl });

        } catch (err) {
            console.error("Fetch Error:", err);
            res.status(500).json({ error: err.message });
        }
    };

    await queryModel();
});

app.listen(PORT, () => {
    console.log(`✅ AI Server running on http://localhost:${PORT}`);
});

// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5002;

// app.use(cors());
// app.use(express.json());

// // Initialize Gemini
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // =======================================
// // GENERATE / IMPROVE PROMPT ROUTE
// // =======================================
// app.post("/generate", async (req, res) => {
//     try {
//         // Accept both prompt and userInput
//         const userText = req.body.prompt || req.body.userInput;

//         if (!userText) {
//             return res.status(400).json({ error: "Prompt is required" });
//         }

//         const model = genAI.getGenerativeModel({
//             model: "gemini-1.5-flash-latest",
//         });

//         const structuredPrompt = `
// You are an AI assistant that converts simple product requests
// into professional ecommerce product image prompts.

// STRICT RULES:
// - Exactly ONE single object
// - White studio background
// - No extra objects
// - Clear readable printed name
// - No artistic layout
// - No multiple items
// - Commercial catalog style

// User request: ${userText}
// `;

//         const result = await model.generateContent(structuredPrompt);
//         const response = await result.response;
//         const text = response.text();

//         res.json({ improvedPrompt: text });

//     } catch (error) {
//         console.error("Gemini Error:", error);
//         res.status(500).json({ error: error.message });
//     }
// });

// // =======================================
// // HEALTH CHECK
// // =======================================
// app.get("/", (req, res) => {
//     res.send("✅ Gemini Server Running");
// });

// app.listen(PORT, () => {
//     console.log(`✅ Gemini Server running at http://localhost:${PORT}`);
// });