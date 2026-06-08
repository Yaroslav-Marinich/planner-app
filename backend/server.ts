import express, { Application, Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { verifyToken, AuthRequest } from './src/middlewares/authMiddleware';
import userRoutes from './src/routes/userRoutes';
import householdRoutes from './src/routes/householdRoutes';
import recipeRoutes from './src/routes/recipeRoutes';
import productRoutes from './src/routes/productRoutes';
import menuRoutes from './src/routes/menuRoutes';
import shoppingListRoutes from './src/routes/shoppingListRoutes';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.set('io', io);
app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/households', householdRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/shopping-lists', shoppingListRoutes);

const MONGO_URI = process.env.MONGO_URI || '';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ Підключено до MongoDB (TypeScript)'))
  .catch((err: Error) => console.error('❌ Помилка підключення до БД:', err.message));

io.on('connection', (socket) => {
  console.log(`🔌 Підключено клієнта: ${socket.id}`);

  socket.on('register', (uid: string) => {
    socket.join(uid);
    console.log(`👤 Юзер ${uid} приєднався до своєї кімнати`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Відключено клієнта: ${socket.id}`);
  });
});

app.get('/', (req: Request, res: Response) => {
  res.send('Бекенд Planer App працює на TypeScript!');
});

app.get('/api/protected', verifyToken, (req: AuthRequest, res: Response) => {
  const uid = req.user?.uid;
  const email = req.user?.email;

  res.json({
    message: 'Успішний доступ до захищених даних!',
    user: { uid, email }
  });
});

const PORT = Number(process.env.PORT) || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущено на порту ${PORT} (відкритий для локальної мережі)`);
});
