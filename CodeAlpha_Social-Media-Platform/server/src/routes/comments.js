const express = require('express');
const prisma = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/comments — add comment to post
router.post('/', authenticate, async (req, res) => {
  try {
    const { postId, content } = req.body;
    if (!postId || !content || !content.trim()) {
      return res.status(400).json({ error: 'postId and content are required.' });
    }

    const post = await prisma.post.findUnique({ where: { id: parseInt(postId) } });
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId: parseInt(postId),
        authorId: req.userId
      },
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatar: true }
        }
      }
    });

    res.status(201).json(comment);

    // Create notification (don't notify yourself)
    if (post.authorId !== req.userId) {
      prisma.notification.create({
        data: { type: 'COMMENT', recipientId: post.authorId, actorId: req.userId, postId: parseInt(postId) }
      }).catch(() => {}); // fire-and-forget
    }
  } catch (err) {
    console.error('Comment error:', err);
    res.status(500).json({ error: 'Failed to add comment.' });
  }
});

// DELETE /api/comments/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!comment) return res.status(404).json({ error: 'Comment not found.' });
    if (comment.authorId !== req.userId) return res.status(403).json({ error: 'Not authorized.' });

    await prisma.comment.delete({ where: { id: comment.id } });
    res.json({ message: 'Comment deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
});

module.exports = router;
