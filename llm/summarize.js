import fs from 'fs/promises';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

// Load environment variables from .env file
dotenv.config();

// Validate API Key
if (!process.env.OPENAI_API_KEY) {
  console.error('Error: Missing OpenAI API key in .env file.');
  process.exit(1);
}

// Initialize OpenAI API with proper configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to summarize file content
export const summarizeFile = async (fileName) => {
  try {
    const filePath = `./documents/${fileName}`;
    // Read file content
    const data = await fs.readFile(filePath, 'utf8');

    // Call OpenAI API for summarization
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that summarizes text.' },
        { role: 'user', content: `Summarize the following text: ${data}` },
      ],
      temperature: 0.7,
    });

    // Output the summary
    console.log('Summary:', response.choices[0].message.content);

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error:', error.message);
  }
};
