require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-project-mgmt-app';

// Middleware for Auth
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    });
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// --- PROJECT ROUTES ---
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { ownerId: req.user.id },
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    const project = await prisma.project.create({
      data: {
        title,
        description,
        ownerId: req.user.id,
        columns: {
          create: [
            { title: 'To Do', order: 0 },
            { title: 'In Progress', order: 1 },
            { title: 'Done', order: 2 }
          ]
        }
      }
    });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.get('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { order: 'asc' },
              include: { comments: true }
            }
          }
        }
      }
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// --- BOARD & TASK ROUTES ---
app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { title, description, columnId, projectId } = req.body;
    
    // Get highest order
    const tasks = await prisma.task.findMany({ where: { columnId } });
    const order = tasks.length;

    const task = await prisma.task.create({
      data: { title, description, order, columnId, projectId }
    });
    
    io.to(projectId).emit('board-updated');
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/move', authenticateToken, async (req, res) => {
  try {
    const { taskId, newColumnId, newOrder, projectId, columnTasks } = req.body;
    
    // We update the dragged task
    await prisma.task.update({
      where: { id: taskId },
      data: { columnId: newColumnId, order: newOrder }
    });

    // Optionally update orders of all tasks in the target column if provided
    if (columnTasks && columnTasks.length > 0) {
      await Promise.all(columnTasks.map((t, index) => 
         prisma.task.update({ where: { id: t.id }, data: { order: index } })
      ));
    }

    io.to(projectId).emit('board-updated');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to move task' });
  }
});

// --- COMMENT ROUTES ---
app.post('/api/tasks/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { content, projectId } = req.body;
    const comment = await prisma.comment.create({
      data: {
        content,
        taskId: req.params.id,
        authorId: req.user.id,
      },
      include: { author: { select: { name: true, id: true } } }
    });
    
    io.to(projectId).emit('board-updated');
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// --- SOCKETS ---
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-project', (projectId) => {
    socket.join(projectId);
    console.log(`Socket ${socket.id} joined project ${projectId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
