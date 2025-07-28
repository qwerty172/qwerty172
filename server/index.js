const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure temp directory exists
const TEMP_DIR = path.join(__dirname, 'temp');
const ensureTempDir = async () => {
  try {
    await fs.access(TEMP_DIR);
  } catch {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  }
};

// Language configurations
const LANGUAGE_CONFIG = {
  python: {
    extension: '.py',
    jdoodleLanguage: 'python3',
    versionIndex: '4'
  },
  cpp: {
    extension: '.cpp',
    jdoodleLanguage: 'cpp17',
    versionIndex: '0'
  },
  java: {
    extension: '.java',
    jdoodleLanguage: 'java',
    versionIndex: '4'
  },
  csharp: {
    extension: '.cs',
    jdoodleLanguage: 'csharp',
    versionIndex: '4'
  }
};

// Gemini API integration
const generateCode = async (query, language) => {
  try {
    const prompt = `Generate complete, executable ${language} code for the following request. 
    The code should be production-ready, well-commented, and include all necessary imports/includes.
    Do not include any explanations or markdown formatting - only return the raw code.
    
    Request: ${query}
    
    Requirements:
    - Include proper error handling
    - Add meaningful comments
    - Ensure the code is complete and runnable
    - For Java, include a proper class structure
    - For C++, include necessary headers
    - For Python, include proper imports
    - For C#, include proper namespace and class structure`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000
      }
    );

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return response.data.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error('Invalid response from Gemini API');
    }
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    throw new Error(`Failed to generate code: ${error.message}`);
  }
};

// JDoodle API integration
const compileCode = async (code, language) => {
  try {
    const config = LANGUAGE_CONFIG[language];
    if (!config) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const response = await axios.post(
      'https://api.jdoodle.com/v1/execute',
      {
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
        script: code,
        language: config.jdoodleLanguage,
        versionIndex: config.versionIndex
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000
      }
    );

    return {
      output: response.data.output || '',
      error: response.data.error || '',
      statusCode: response.data.statusCode || 0,
      memory: response.data.memory || '',
      cpuTime: response.data.cpuTime || ''
    };
  } catch (error) {
    console.error('JDoodle API Error:', error.response?.data || error.message);
    throw new Error(`Compilation failed: ${error.message}`);
  }
};

// File management utilities
const saveCodeToFile = async (code, language, fileId) => {
  const config = LANGUAGE_CONFIG[language];
  const fileName = `${fileId}${config.extension}`;
  const filePath = path.join(TEMP_DIR, fileName);
  
  await fs.writeFile(filePath, code, 'utf8');
  return { fileName, filePath };
};

const cleanupOldFiles = async () => {
  try {
    const files = await fs.readdir(TEMP_DIR);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
        console.log(`Cleaned up old file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};

// API Routes
app.post('/api/generate-code', [
  body('query').isLength({ min: 1, max: 5000 }).trim().escape(),
  body('language').isIn(['python', 'cpp', 'java', 'csharp'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input parameters',
        details: errors.array()
      });
    }

    const { query, language } = req.body;
    const fileId = uuidv4();

    // Generate code using Gemini
    console.log(`Generating ${language} code for query: ${query.substring(0, 100)}...`);
    const generatedCode = await generateCode(query, language);

    // Save code to file
    const { fileName, filePath } = await saveCodeToFile(generatedCode, language, fileId);

    // Compile code
    console.log(`Compiling ${language} code...`);
    const compilationResult = await compileCode(generatedCode, language);

    res.json({
      success: true,
      data: {
        fileId,
        fileName,
        code: generatedCode,
        compilation: compilationResult,
        downloadUrl: `/api/download/${fileId}${LANGUAGE_CONFIG[language].extension}`
      }
    });

  } catch (error) {
    console.error('Code generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

app.get('/api/download/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(TEMP_DIR, fileName);

    // Security check - ensure file exists and is in temp directory
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Determine content type based on extension
    const ext = path.extname(fileName);
    const contentTypes = {
      '.py': 'text/x-python',
      '.cpp': 'text/x-c++src',
      '.java': 'text/x-java-source',
      '.cs': 'text/x-csharp'
    };

    const contentType = contentTypes[ext] || 'text/plain';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const fileContent = await fs.readFile(filePath);
    res.send(fileContent);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download file'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Initialize server
const startServer = async () => {
  await ensureTempDir();
  
  // Schedule cleanup every hour
  setInterval(cleanupOldFiles, 60 * 60 * 1000);
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer().catch(console.error);