import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { authenticate } from '../middleware/auth.js';
dotenv.config();
const app = express();
const prisma = new PrismaClient();
app.use(express.json());
const allowedOrigins = ['https://your-frontend-url.vercel.app', 'http://localhost:5173'];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.get('/api/notes', authenticate, async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  try {
    const notes = await prisma.note.findMany({
      where: { userId }, // <-- THIS LINE IS CRUCIAL
      orderBy: { createdAt: 'desc' },
    });
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});
app.post('/api/notes', authenticate, async (req, res) => {
  const { title, content, tag } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'title and content required' });
  }
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  try {
    const note = await prisma.note.create({
      data: { title, content, tag, userId }, // <-- include userId
    });
    res.json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});
app.put('/api/notes/:id', async (req, res) => {
  const { title, content, tag } = req.body;
  const id = parseInt(req.params.id);
  if (!title || !content) {
    return res.status(400).send('title and content fields required');
  }
  if (!id || isNaN(id)) {
    return res.status(400).send('ID must be a valid number');
  }
  try {
    const updatedNote = await prisma.note.update({
      where: { id },
      data: { title, content, tag },
    });
    res.json(updatedNote);
  } catch (error) {
    console.error(error);
    res.status(500).send('Oops, something went wrong');
  }
});
app.delete('/api/notes/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (!id || isNaN(id)) {
    return res.status(400).send('ID field required');
  }
  try {
    await prisma.note.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Oops, something went wrong');
  }
});
app.listen(5001, () => {
  console.log('server running on localhost:5001');
});
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    // Don't send back the password
    res.json({ id: user.id, email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  // Generate JWT
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // token valid for 7 days
  );
  res.json({
    token,
    user: { id: user.id, email: user.email },
  });
});
//# sourceMappingURL=index.js.map
