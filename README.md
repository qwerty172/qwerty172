# Natural Language to Code Converter

A production-ready web application that converts natural language queries into executable code using Google's Gemini AI. The application generates complete, compilable code in multiple programming languages and provides compilation results with downloadable files.

## Features

- **AI-Powered Code Generation**: Uses Google Gemini AI (learnlm-2-0-flash model) to generate complete, executable code
- **Multi-Language Support**: Python, C++, Java, and C# code generation
- **Real-time Compilation**: Integrates with JDoodle API for online code compilation
- **File Downloads**: Generated code files are downloadable with proper extensions
- **Responsive Design**: Modern, mobile-friendly interface with smooth animations
- **Error Handling**: Comprehensive error handling and user feedback
- **Security**: Rate limiting, input validation, and secure API key management

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **CSS3** with modern features (Grid, Flexbox, Backdrop Filter)
- **Lucide React** for icons
- **Axios** for API communication

### Backend
- **Node.js** with Express.js
- **Security Middleware**: Helmet, CORS, Rate Limiting
- **File Management**: UUID-based file naming with automatic cleanup
- **API Integration**: Google Gemini AI and JDoodle compiler APIs
- **Validation**: Express-validator for input sanitization

## Prerequisites

Before running the application, you need:

1. **Node.js** (version 16 or higher)
2. **npm** or **yarn** package manager
3. **Google Gemini API Key** (provided in the code)
4. **JDoodle API Credentials** (free tier available)

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Install dependencies
npm install
```

### 2. Environment Configuration

The application uses the following environment variables in `.env`:

```env
VITE_API_URL=http://localhost:3001
GEMINI_API_KEY=AIzaSyDtEu2E4m1h6g-9Gfz4iS02BOg0yh5EElg
JDOODLE_CLIENT_ID=your_jdoodle_client_id
JDOODLE_CLIENT_SECRET=your_jdoodle_client_secret
PORT=3001
```

### 3. Get JDoodle API Credentials

1. Visit [JDoodle API](https://www.jdoodle.com/compiler-api)
2. Sign up for a free account
3. Get your Client ID and Client Secret
4. Update the `.env` file with your credentials

### 4. Run the Application

```bash
# Start both frontend and backend
npm run dev:full

# Or run separately:
# Backend only
npm run server:dev

# Frontend only (in another terminal)
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## Project Structure

```
├── src/                          # Frontend source code
│   ├── components/              # React components
│   │   ├── Header.tsx          # Application header
│   │   ├── QueryForm.tsx       # Input form for queries
│   │   ├── ResultDisplay.tsx   # Code results display
│   │   ├── LoadingSpinner.tsx  # Loading animation
│   │   └── ErrorMessage.tsx    # Error display component
│   ├── services/               # API services
│   │   └── api.ts             # Axios configuration and API calls
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts          # Application types
│   ├── App.tsx               # Main application component
│   ├── App.css              # Application styles
│   └── main.tsx             # Application entry point
├── server/                   # Backend source code
│   ├── index.js             # Express server with all routes
│   └── temp/               # Temporary files directory (auto-created)
├── .env                    # Environment variables
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## API Endpoints

### POST `/api/generate-code`
Generates code from natural language query.

**Request Body:**
```json
{
  "query": "Create a calculator with basic operations",
  "language": "python"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "uuid-string",
    "fileName": "uuid.py",
    "code": "generated code here",
    "compilation": {
      "output": "compilation output",
      "error": "any errors",
      "statusCode": 0,
      "memory": "memory usage",
      "cpuTime": "execution time"
    },
    "downloadUrl": "/api/download/uuid.py"
  }
}
```

### GET `/api/download/:fileName`
Downloads the generated code file.

### GET `/api/health`
Health check endpoint.

## Usage Guide

1. **Select Programming Language**: Choose from Python, C++, Java, or C#
2. **Enter Description**: Describe what you want to build in natural language (minimum 10 characters)
3. **Generate Code**: Click "Generate Code" to create your program
4. **View Results**: See the generated code, compilation status, and any output/errors
5. **Download**: Download the complete code file to your computer

### Example Queries

- "Create a calculator that performs basic arithmetic operations"
- "Build a simple todo list manager with add, remove, and display functions"
- "Make a program that sorts an array of numbers using quicksort algorithm"
- "Create a class for managing student records with CRUD operations"

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Query length limits and sanitization
- **File Security**: Temporary files with UUID names and automatic cleanup
- **API Key Protection**: Environment variable storage
- **CORS Configuration**: Restricted origins in production
- **Helmet.js**: Security headers and protection

## Performance Optimizations

- **File Cleanup**: Automatic removal of files older than 24 hours
- **Request Timeout**: 30-second timeout for external API calls
- **Compression**: Gzip compression for responses
- **Caching**: Browser caching for static assets
- **Code Splitting**: Lazy loading of components

## Error Handling

The application handles various error scenarios:

- **Network Errors**: Connection timeouts and failures
- **API Errors**: Invalid responses from external services
- **Validation Errors**: Invalid input parameters
- **Compilation Errors**: Code compilation failures
- **File Errors**: File system operations

## Deployment

### Production Build

```bash
# Build frontend
npm run build

# Start production server
npm run server
```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["npm", "run", "server"]
```

### Environment Variables for Production

```env
NODE_ENV=production
VITE_API_URL=https://your-domain.com
GEMINI_API_KEY=your_actual_api_key
JDOODLE_CLIENT_ID=your_jdoodle_client_id
JDOODLE_CLIENT_SECRET=your_jdoodle_client_secret
PORT=3001
```

## Monitoring & Logging

The application includes:

- **Request Logging**: Morgan middleware for HTTP request logs
- **Error Logging**: Console error logging with stack traces
- **Health Checks**: `/api/health` endpoint for monitoring
- **Performance Metrics**: Compilation time and memory usage tracking

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

1. Check the error messages in the browser console
2. Verify your API credentials are correct
3. Ensure all dependencies are installed
4. Check the server logs for detailed error information

## Troubleshooting

### Common Issues

1. **"Failed to generate code"**: Check your Gemini API key
2. **"Compilation failed"**: Verify JDoodle API credentials
3. **"Network error"**: Check if the backend server is running
4. **"File not found"**: Temporary files may have been cleaned up

### Debug Mode

Set `NODE_ENV=development` for detailed error messages and logging.