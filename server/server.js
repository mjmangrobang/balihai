const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json());

// CORS Configuration
// This allows the frontend to communicate with this backend
app.use(cors({
  origin: [
    'http://localhost:3000', // Local React Frontend
    process.env.CLIENT_URL   // Production Netlify URL (We will set this on Render later)
  ],
  credentials: true
}));

app.use(helmet());
app.use(morgan('common'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/residents', require('./routes/residentRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));

app.get('/', (req, res) => {
  res.send('BALIHAI System API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});