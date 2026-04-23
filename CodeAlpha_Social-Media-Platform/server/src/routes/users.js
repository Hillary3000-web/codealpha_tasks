const express = require('express');
const prisma = require('../db');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ─── STATIC ROUTES FIRST (must come before /:username) ───

// GET /api/users — search users
router.get('/', async (req, res) => {
  try {
    const q = req.query.q || '';
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q } },
          { fullName: { contains: q } }
        ]
      },
      select: {
        id: true, username: true, fullName: true, avatar: true, bio: true,
        _count: { select: { posts: true, followers: true } }
      },
      take: 20
    });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to search users.' });
  }
});

// PUT /api/users/profile/update — update own profile
router.put('/profile/update', authenticate, async (req, res) => {
  try {
    const { fullName, bio, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar })
      },
      select: {
        id: true, username: true, email: true, fullName: true,
        avatar: true, bio: true
      }
    });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// ─── DYNAMIC ROUTES (must come after static routes) ───

// GET /api/users/:username — public profile
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username.toLowerCase() },
      select: {
        id: true, username: true, fullName: true, avatar: true,
        bio: true, createdAt: true,
        _count: { select: { posts: true, followers: true, following: true } },
        followers: req.userId
          ? { where: { followerId: req.userId }, select: { id: true } }
          : false
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({
      ...user,
      isFollowing: req.userId ? user.followers?.length > 0 : false,
      postsCount: user._count.posts,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      followers: undefined,
      _count: undefined
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

// GET /api/users/:username/posts — user's posts
router.get('/:username/posts', optionalAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username.toLowerCase() }
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const posts = await prisma.post.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatar: true }
        },
        _count: { select: { comments: true, likes: true } },
        likes: req.userId ? { where: { userId: req.userId }, select: { id: true } } : false
      }
    });

    const formatted = posts.map(post => ({
      ...post,
      isLiked: req.userId ? post.likes?.length > 0 : false,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      likes: undefined,
      _count: undefined
    }));

    res.json({ posts: formatted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user posts.' });
  }
});

// POST /api/users/:username/follow — toggle follow
router.post('/:username/follow', authenticate, async (req, res) => {
  try {
    const target = await prisma.user.findUnique({
      where: { username: req.params.username.toLowerCase() }
    });
    if (!target) return res.status(404).json({ error: 'User not found.' });
    if (target.id === req.userId) return res.status(400).json({ error: 'Cannot follow yourself.' });

    const existingFollow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: req.userId, followingId: target.id } }
    });

    if (existingFollow) {
      await prisma.follow.delete({ where: { id: existingFollow.id } });
      const count = await prisma.follow.count({ where: { followingId: target.id } });
      return res.json({ following: false, followersCount: count });
    } else {
      await prisma.follow.create({ data: { followerId: req.userId, followingId: target.id } });
      const count = await prisma.follow.count({ where: { followingId: target.id } });
      // Create notification
      prisma.notification.create({
        data: { type: 'FOLLOW', recipientId: target.id, actorId: req.userId }
      }).catch(() => {}); // fire-and-forget
      return res.json({ following: true, followersCount: count });
    }
  } catch (err) {
    console.error('Follow error:', err);
    res.status(500).json({ error: 'Failed to toggle follow.' });
  }
});

module.exports = router;
