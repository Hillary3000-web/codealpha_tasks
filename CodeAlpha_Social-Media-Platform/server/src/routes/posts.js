const express = require('express');
const prisma = require('../db');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/posts — feed (all posts, newest first)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatar: true }
        },
        _count: { select: { comments: true, likes: true } },
        likes: req.userId ? { where: { userId: req.userId }, select: { id: true } } : false
      }
    });

    const total = await prisma.post.count();

    const formatted = posts.map(post => ({
      ...post,
      isLiked: req.userId ? post.likes?.length > 0 : false,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      likes: undefined,
      _count: undefined
    }));

    res.json({ posts: formatted, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ error: 'Failed to fetch posts.' });
  }
});

// GET /api/posts/:id — single post with comments
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatar: true }
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: { id: true, username: true, fullName: true, avatar: true }
            }
          }
        },
        _count: { select: { likes: true } },
        likes: req.userId ? { where: { userId: req.userId }, select: { id: true } } : false
      }
    });

    if (!post) return res.status(404).json({ error: 'Post not found.' });

    res.json({
      ...post,
      isLiked: req.userId ? post.likes?.length > 0 : false,
      likesCount: post._count.likes,
      likes: undefined,
      _count: undefined
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post.' });
  }
});

// POST /api/posts — create post
router.post('/', authenticate, async (req, res) => {
  try {
    const { content, imageUrl } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Post content is required.' });
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        imageUrl: imageUrl || '',
        authorId: req.userId
      },
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatar: true }
        },
        _count: { select: { comments: true, likes: true } }
      }
    });

    res.status(201).json({
      ...post,
      isLiked: false,
      likesCount: 0,
      commentsCount: 0,
      _count: undefined
    });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Failed to create post.' });
  }
});

// DELETE /api/posts/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    if (post.authorId !== req.userId) return res.status(403).json({ error: 'Not authorized.' });

    await prisma.post.delete({ where: { id: post.id } });
    res.json({ message: 'Post deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete post.' });
  }
});

// POST /api/posts/:id/like — toggle like
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId: req.userId, postId } }
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      const count = await prisma.like.count({ where: { postId } });
      return res.json({ liked: false, likesCount: count });
    } else {
      await prisma.like.create({ data: { userId: req.userId, postId } });
      const count = await prisma.like.count({ where: { postId } });
      // Create notification (don't notify yourself)
      if (post.authorId !== req.userId) {
        await prisma.notification.create({
          data: { type: 'LIKE', recipientId: post.authorId, actorId: req.userId, postId }
        }).catch(() => {}); // silent fail
      }
      return res.json({ liked: true, likesCount: count });
    }
  } catch (err) {
    console.error('Like error:', err);
    res.status(500).json({ error: 'Failed to toggle like.' });
  }
});

module.exports = router;
