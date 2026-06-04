import { Response } from 'express';
import Household from '../models/Household';
import User from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware';
import JoinRequest from '../models/JoinRequest';

export const createHousehold = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const { name } = req.body;

    if (!uid) {
      res.status(401).json({ message: 'Неавторизовано' });
      return;
    }

    if (!name) {
      res.status(400).json({ message: "Назва сім'ї є обов'язковою" });
      return;
    }

    const newHousehold = new Household({
      name,
      ownerId: uid,
      members: [uid]
    });
    const savedHousehold = await newHousehold.save();

    await User.findOneAndUpdate({ firebaseUid: uid }, { householdId: savedHousehold._id });

    console.log(`🏠 Створено нову сім'ю: ${name}`);

    res.status(201).json({
      message: "Сім'ю успішно створено",
      household: savedHousehold
    });
  } catch (error) {
    console.error("❌ Помилка створення сім'ї:", error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

export const requestToJoin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const fromUserId = req.user?.uid;
    const fromUserEmail = req.user?.email || 'Невідомо';
    const { ownerEmail } = req.body;

    if (!fromUserId) {
      res.status(401).json({ message: 'Неавторизовано' });
      return;
    }

    const owner = await User.findOne({ email: ownerEmail });
    if (!owner || !owner.householdId) {
      res.status(404).json({ message: "Сім'ю з таким email власника не знайдено" });
      return;
    }

    const existingRequest = await JoinRequest.findOne({ fromUserId, status: 'pending' });
    if (existingRequest) {
      res.status(400).json({ message: 'Ви вже відправили запит, очікуйте підтвердження' });
      return;
    }

    const request = new JoinRequest({
      fromUserId,
      fromUserEmail,
      toOwnerId: owner.firebaseUid,
      householdId: owner.householdId
    });
    await request.save();

    const io = req.app.get('io');
    io.to(owner.firebaseUid).emit('new_join_request', {
      message: `Новий запит від ${fromUserEmail}`,
      requestId: request._id,
      fromUserEmail
    });

    if (owner.expoPushToken) {
      const message = {
        to: owner.expoPushToken,
        sound: 'default',
        title: "Новий запит до сім'ї 🏠",
        body: `Користувач ${fromUserEmail} хоче приєднатися до вашої сім'ї.`,
        data: { requestId: request._id, type: 'join_request' }
      };

      try {
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(message)
        });
        console.log(`📲 Push-сповіщення відправлено власнику: ${owner.firebaseUid}`);
      } catch (pushError) {
        console.error('❌ Помилка відправки push-сповіщення:', pushError);
      }
    }

    res.status(200).json({ message: 'Запит на приєднання успішно надіслано' });
  } catch (error) {
    console.error('❌ Помилка створення запиту:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

export const respondToJoinRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.uid;
    const { requestId, action } = req.body;

    const request = await JoinRequest.findById(requestId);

    if (!request || request.toOwnerId !== ownerId || request.status !== 'pending') {
      res.status(400).json({ message: 'Запит не знайдено або він вже оброблений' });
      return;
    }

    if (action === 'approve') {
      request.status = 'approved';

      await Household.findByIdAndUpdate(request.householdId, {
        $addToSet: { members: request.fromUserId }
      });

      await User.findOneAndUpdate(
        { firebaseUid: request.fromUserId },
        { householdId: request.householdId }
      );
    } else {
      request.status = 'rejected';
    }

    await request.save();
    res
      .status(200)
      .json({ message: `Запит успішно ${action === 'approve' ? 'схвалено' : 'відхилено'}` });
  } catch (error) {
    console.error('❌ Помилка обробки запиту:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};
