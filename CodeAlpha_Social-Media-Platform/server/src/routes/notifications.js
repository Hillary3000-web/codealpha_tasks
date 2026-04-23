const express = require('express');
const prisma = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications — get current user's notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { recipientId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        actor: {
          select: { id: true, username: true, fullName: true, avatar: true }
        },
        post: {
          select: { id: true, content: true }
        }
      }
    });

    const unreadCount = await prisma.notification.count({
      where: { recipientId: req.userId, read: false }
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error('Notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// PUT /api/notifications/read — mark all as read
router.put('/read', authenticate, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { recipientId: req.userId, read: false },
      data: { read: true }
    });
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notifications as read.' });
  }
});

module.exports = router;
