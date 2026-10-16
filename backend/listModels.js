require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log("Fetching models...");
  // Unfortunately the SDK doesn't always expose listModels directly easily in older versions, but let's try fetch
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
  const data = await response.json();
  if(data.models) {
    console.log("Available models supporting generateContent:");
    data.models.filter(m => m.supportedGenerationMethods.includes("generateContent")).forEach(m => {
        console.log("- " + m.name.replace("models/", ""));
    });
  } else {
    console.log(data);
  }
}
run();
