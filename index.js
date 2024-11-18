import express from 'express';
import multer from 'multer';
import { queryAi } from './llm/Query.js';
import { generateVectors } from './/llm/GenerateVectors.js';
import { summarizeFile } from './llm/summarize.js';

const app = express();
const port = 4000;

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'documents/');
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

// Summarize the text from the file.
  app.post('/summarize', upload.single('file'), async (req, res)=> {
    if (!req.file) {
      return res.status(400).json({ error: 'No File uploaded' });
    }
    const fileName = req.file.filename;
    console.log('Uploaded file name:', fileName);
    console.log('----------------File Uploaded Successfully for Summarization-------------');
    const summerization = await summarizeFile(req.file.filename);

    res.json( { message: summerization });
  });

// Query AI end point
app.post('/query', async (req, res) => {
  let questionFromRequest = req.body.question;

  if (questionFromRequest === undefined || questionFromRequest === "") {
    return res.status(400).json({ error: 'No question was ask.' });
  }

  let answerFromAi = await queryAi(questionFromRequest);
  res.json( { message: answerFromAi });
});

// Train Ai end point.
app.get('/train', async (req, res) => {
  await generateVectors();

  res.json( { message: 'Model was train successfully.' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})
