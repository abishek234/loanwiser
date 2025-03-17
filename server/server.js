const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');
const applicantRoutes = require('./routes/applicantRoutes');
const documentRoutes = require('./routes/documentRoutes');
const documenttypeRoutes = require('./routes/documenttypeRoutes');


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Error handler
app.use(errorHandler);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/applicant', applicantRoutes);
app.use('/api/document', documentRoutes);
app.use('/api/document-types', documenttypeRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Initialize DB and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });