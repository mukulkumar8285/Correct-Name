const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.DB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mongoose schema and model
const scheduleSchema = new mongoose.Schema({
  email: String,
  subject: String,
  message: String,
  schedule: String,
});
const Schedule = mongoose.model('Schedule', scheduleSchema);

const taskLogSchema = new mongoose.Schema({
  taskName: String,
  status: String,
  timestamp: Date,
});
const TaskLog = mongoose.model('TaskLog', taskLogSchema);

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper to validate cron expression
function isValidCron(expression) {
  return cron.validate(expression);
}

// Function to log task execution
async function logTaskExecution(taskName, status) {
  const log = new TaskLog({ taskName, status, timestamp: new Date() });
  await log.save();
  console.log('Task logged:', log);
}

// Schedule and send emails
async function sendScheduledEmails() {
  const schedules = await Schedule.find();
  schedules.forEach(schedule => {
    if (isValidCron(schedule.schedule)) {
      cron.schedule(schedule.schedule, async () => {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: schedule.email,
            subject: schedule.subject,
            text: schedule.message,
          });
          await logTaskExecution(`Email to ${schedule.email}`, 'Success');
        } catch (error) {
          await logTaskExecution(`Email to ${schedule.email}`, 'Failed');
          console.error('Error sending email:', error);
        }
      });
    } else {
      console.error(`Invalid cron expression: ${schedule.schedule}`);
    }
  });
}

// Call this to set up initial cron jobs
sendScheduledEmails();

// Routes
app.post('/schedule-email', async (req, res) => {
  const { email, subject, message, schedule } = req.body;

  if (!isValidCron(schedule)) {
    return res.status(400).json({ message: 'Invalid cron expression' });
  }

  try {
    const newSchedule = new Schedule({ email, subject, message, schedule });
    await newSchedule.save();
    res.json({ message: 'Email scheduled successfully' });
    await sendScheduledEmails(); // Include new schedules
  } catch (error) {
    res.status(500).json({ message: 'Error scheduling email' });
  }
});

app.get('/schedules', async (req, res) => {
  const schedules = await Schedule.find();
  res.json(schedules);
});

app.get('/schedules/:id', async (req, res) => {
  const schedule = await Schedule.findById(req.params.id);
  res.json(schedule);
});

app.put('/schedules/:id', async (req, res) => {
  const { email, subject, message, schedule } = req.body;

  if (!isValidCron(schedule)) {
    return res.status(400).json({ message: 'Invalid cron expression' });
  }

  try {
    await Schedule.findByIdAndUpdate(req.params.id, { email, subject, message, schedule });
    res.json({ message: 'Schedule updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating schedule' });
  }
});

app.get('/logs', async (req, res) => {
  const logs = await TaskLog.find();
  res.json(logs);
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
