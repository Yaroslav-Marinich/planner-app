import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware';

export const syncUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const firebaseUser = req.user;

    if (!firebaseUser) {
      res.status(401).json({ message: 'Користувача не ідентифіковано' });
      return;
    }

    const { uid, email } = firebaseUser;

    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      user = new User({
        firebaseUid: uid,
        email: email || ''
      });
      await user.save();
      console.log(`👤 Створено нового користувача: ${email}`);
    } else {
      console.log(`👤 Користувач увійшов: ${email}`);
    }

    res.status(200).json({
      message: 'Користувача успішно синхронізовано',
      user
    });
  } catch (error) {
    console.error('❌ Помилка синхронізації користувача:', error);
    res.status(500).json({ message: 'Внутрішня помилка сервера' });
  }
};

export const savePushToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const { token } = req.body;

    if (!uid) {
      res.status(401).json({ message: 'Неавторизовано' });
      return;
    }

    if (!token) {
      res.status(400).json({ message: 'Токен пристрою відсутній у запиті' });
      return;
    }

    await User.findOneAndUpdate({ firebaseUid: uid }, { expoPushToken: token });

    console.log(`📲 Збережено Push-токен для користувача: ${uid}`);
    res.status(200).json({ message: 'Push-токен успішно збережено' });
  } catch (error) {
    console.error('❌ Помилка збереження push-токена:', error);
    res.status(500).json({ message: 'Внутрішня помилка сервера' });
  }
};
