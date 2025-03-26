import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Mock user database
const users = {
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
    username: 'Admin User'
  },
  manager: {
    email: 'manager@example.com',
    password: 'manager123',
    username: 'Manager User'
  },
  user: {
    email: 'user@example.com',
    password: 'user123',
    username: 'Regular User'
  }
};

// Login endpoints for different roles
app.post('/api/:role/login', (req, res) => {
  const { role } = req.params;
  const { email, password } = req.body;

  const user = users[role];
  
  if (user && user.email === email && user.password === password) {
    res.json({ 
      success: true,
      username: user.username
    });
  } else {
    res.status(401).json({ 
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
});