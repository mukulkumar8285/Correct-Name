import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useParams } from 'react-router-dom';
import './App.css'; // Import CSS for styling

// ScheduleEmail Component
function ScheduleEmail() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [schedule, setSchedule] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://correctname1.onrender.com/schedule-email', {
        email,
        subject,
        message,
        schedule
      });
      setResponseMessage(response.data.message);
    } catch (error) {
      console.error('Error scheduling email:', error);
      setResponseMessage('Failed to schedule email');
    }
  };

  return (
    <div className="schedule-email-container">
      <h2 className="fade-in">Schedule a New Email</h2>
      <form onSubmit={handleSubmit} className="form-animate">
        <div>
          <label>Email: </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Subject: </label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </div>
        <div>
          <label>Message: </label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} required />
        </div>
        <div>
          <label>Schedule (cron format): </label>
          <input type="text" value={schedule} onChange={(e) => setSchedule(e.target.value)} required />
        </div>
        <button type="submit" className="button-animate">Schedule Email</button>
      </form>
      {responseMessage && <p className="response-message">{responseMessage}</p>}
    </div>
  );
}

// ScheduledEmails Component
function ScheduledEmails() {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get('https://correctname1.onrender.com/schedules');
        setSchedules(response.data);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    };

    fetchSchedules();
  }, []);

  return (
    <div className="scheduled-emails-container">
      <h2 className="fade-in">Scheduled Emails</h2>
      <ul className="scheduled-emails-list">
        {schedules.map(schedule => (
          <li key={schedule._id} className="fade-in">
            <div>Email: <strong>{schedule.email}</strong></div>
            <div>Subject: <strong>{schedule.subject}</strong></div>
            <div>Schedule: <strong>{schedule.schedule}</strong></div>
            <Link to={`/edit-schedule/${schedule._id}`} className="link-animate">Edit</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// EditSchedule Component
function EditSchedule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [schedule, setSchedule] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.get(`https://correctname1.onrender.com/schedules/${id}`);
        const data = response.data;
        setEmail(data.email);
        setSubject(data.subject);
        setMessage(data.message);
        setSchedule(data.schedule);
      } catch (error) {
        console.error('Error fetching schedule:', error);
      }
    };

    fetchSchedule();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`https://correctname1.onrender.com/schedules/${id}`, {
        email,
        subject,
        message,
        schedule
      });
      setResponseMessage(response.data.message);
      navigate('/scheduled-emails'); // Redirect to scheduled emails list
    } catch (error) {
      console.error('Error updating schedule:', error);
      setResponseMessage('Failed to update schedule');
    }
  };

  return (
    <div className="edit-schedule-container">
      <h2 className="fade-in">Edit Schedule</h2>
      <form onSubmit={handleSubmit} className="form-animate">
        <div>
          <label>Email: </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Subject: </label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </div>
        <div>
          <label>Message: </label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} required />
        </div>
        <div>
          <label>Schedule (cron format): </label>
          <input type="text" value={schedule} onChange={(e) => setSchedule(e.target.value)} required />
        </div>
        <button type="submit" className="button-animate">Update Schedule</button>
      </form>
      {responseMessage && <p className="response-message">{responseMessage}</p>}
    </div>
  );
}

// TaskLogs Component
function TaskLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('https://correctname1.onrender.com/logs');
        setLogs(response.data);
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="task-logs-container">
      <h2 className="fade-in">Task Logs</h2>
      <ul className="task-logs-list">
        {logs.map(log => (
          <li key={log._id} className="fade-in">
            Task: {log.taskName}, Status: {log.status}, Timestamp: {new Date(log.timestamp).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <ul>
            <li><Link to="/">Schedule Email</Link></li>
            <li><Link to="/scheduled-emails">Scheduled Emails</Link></li>
            <li><Link to="/task-logs">Task Logs</Link></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<ScheduleEmail />} />
          <Route path="/scheduled-emails" element={<ScheduledEmails />} />
          <Route path="/edit-schedule/:id" element={<EditSchedule />} />
          <Route path="/task-logs" element={<TaskLogs />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
