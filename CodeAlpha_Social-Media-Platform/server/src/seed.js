require('dotenv').config();
const prisma = require('./db');
const bcrypt = require('bcrypt');

async function seed() {
  console.log('🌱 Seeding database...');

  // Clean
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('password123', 10);

  // Create users
  const alice = await prisma.user.create({
    data: {
      username: 'alice',
      email: 'alice@demo.com',
      password: hash,
      fullName: 'Alice Johnson',
      bio: 'Full-stack developer & coffee enthusiast ☕',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'
    }
  });

  const bob = await prisma.user.create({
    data: {
      username: 'bob',
      email: 'bob@demo.com',
      password: hash,
      fullName: 'Bob Williams',
      bio: 'Designer by day, gamer by night 🎮',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'
    }
  });

  const carol = await prisma.user.create({
    data: {
      username: 'carol',
      email: 'carol@demo.com',
      password: hash,
      fullName: 'Carol Davis',
      bio: 'Traveler | Photographer | Dreamer 🌍',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol'
    }
  });

  const dave = await prisma.user.create({
    data: {
      username: 'dave',
      email: 'dave@demo.com',
      password: hash,
      fullName: 'Dave Martinez',
      bio: 'Open source contributor & music lover 🎵',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dave'
    }
  });

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      content: 'Just launched my new portfolio website! Check it out and let me know what you think. Built with modern web technologies and a lot of late nights 🚀✨',
      authorId: alice.id
    }
  });

  const post2 = await prisma.post.create({
    data: {
      content: 'Beautiful sunset from the rooftop today. Sometimes you need to stop and appreciate the little things in life 🌅',
      authorId: bob.id
    }
  });

  const post3 = await prisma.post.create({
    data: {
      content: 'Exploring the streets of Tokyo! The blend of traditional and modern architecture here is absolutely breathtaking. Every corner tells a story 🏯🇯🇵',
      authorId: carol.id
    }
  });

  const post4 = await prisma.post.create({
    data: {
      content: 'Just contributed to an open source project that has over 50k stars ⭐ The feeling of giving back to the community is incredible. Keep coding, keep building!',
      authorId: dave.id
    }
  });

  const post5 = await prisma.post.create({
    data: {
      content: 'Hot take: Backend development is more creative than frontend. Fight me 😄💻',
      authorId: alice.id
    }
  });

  const post6 = await prisma.post.create({
    data: {
      content: 'Pro tip: Take breaks. Your best ideas come when you step away from the screen. Just had a breakthrough on a bug that has been haunting me for days — while making coffee ☕🐛',
      authorId: bob.id
    }
  });

  // Create comments
  await prisma.comment.createMany({
    data: [
      { content: 'This looks amazing! Love the design 🔥', postId: post1.id, authorId: bob.id },
      { content: 'Incredible work Alice! Very inspiring.', postId: post1.id, authorId: carol.id },
      { content: 'Wow, stunning shot! 📸', postId: post2.id, authorId: alice.id },
      { content: 'So jealous! Tokyo is on my bucket list 🗾', postId: post3.id, authorId: dave.id },
      { content: 'That is an amazing achievement! Congrats! 🎉', postId: post4.id, authorId: alice.id },
      { content: 'Haha, controversial but I see your point 😂', postId: post5.id, authorId: dave.id },
      { content: 'This is so true! Stepping away is underrated.', postId: post6.id, authorId: carol.id },
    ]
  });

  // Create likes
  await prisma.like.createMany({
    data: [
      { userId: bob.id, postId: post1.id },
      { userId: carol.id, postId: post1.id },
      { userId: dave.id, postId: post1.id },
      { userId: alice.id, postId: post2.id },
      { userId: carol.id, postId: post2.id },
      { userId: alice.id, postId: post3.id },
      { userId: bob.id, postId: post3.id },
      { userId: dave.id, postId: post3.id },
      { userId: alice.id, postId: post4.id },
      { userId: bob.id, postId: post4.id },
      { userId: dave.id, postId: post5.id },
      { userId: bob.id, postId: post5.id },
      { userId: alice.id, postId: post6.id },
      { userId: dave.id, postId: post6.id },
    ]
  });

  // Create follows
  await prisma.follow.createMany({
    data: [
      { followerId: bob.id, followingId: alice.id },
      { followerId: carol.id, followingId: alice.id },
      { followerId: dave.id, followingId: alice.id },
      { followerId: alice.id, followingId: bob.id },
      { followerId: carol.id, followingId: bob.id },
      { followerId: alice.id, followingId: carol.id },
      { followerId: dave.id, followingId: carol.id },
      { followerId: alice.id, followingId: dave.id },
    ]
  });

  console.log('✅ Seed complete!');
  console.log('   4 users, 6 posts, 7 comments, 14 likes, 8 follows');
  console.log('\n   Demo accounts (password: password123):');
  console.log('   - alice@demo.com');
  console.log('   - bob@demo.com');
  console.log('   - carol@demo.com');
  console.log('   - dave@demo.com');
}

seed()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
