import express from 'express';
import multer from 'multer';
import { run } from "./llm/chat.js";

const app = express();
const port = 3000; // You can use any available port

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
  
  const upload = multer({ storage });

app.use(express.json());

// File Upload Endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ message: 'File uploaded successfully', filename: req.file.filename });
});

app.post('/answer', async (req, res) => {
  let questionFromRequest = req.body.question;

  if (questionFromRequest === undefined || questionFromRequest === "") {
    return res.status(400).json({ error: 'No question was ask.' });
  }

  let answerFromAi = await run(questionFromRequest);
  res.json( { message: answerFromAi });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})