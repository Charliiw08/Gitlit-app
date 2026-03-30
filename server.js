// =============================================================================
// GITLIT SERVER - Complete Backend
// =============================================================================

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Auth middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: { message: 'No token provided' } });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(401).json({ error: { message: 'User not found' } });
    
    req.userId = user.id;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: { message: 'Invalid token' } });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
    }
  } catch {}
  next();
};

// =============================================================================
// AUTH ROUTES
// =============================================================================

app.post('/v1/auth/register', async (req, res) => {
  try {
    const { email, password, name, handle } = req.body;
    
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { handle }] }
    });
    
    if (existing) {
      return res.status(400).json({ error: { message: 'Email or handle already taken' } });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        handle: handle.toLowerCase(),
        stats: { create: {} }
      },
      include: { stats: true }
    });
    
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        handle: user.handle,
        stats: user.stats
      },
      tokens: { access_token: accessToken, refresh_token: accessToken }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: { message: 'Registration failed' } });
  }
});

app.post('/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: { stats: true, badges: { include: { badge: true } } }
    });
    
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }
    
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        handle: user.handle,
        avatar_url: user.avatarUrl,
        stats: {
          nights_out: user.stats?.nightsOut || 0,
          friends_count: user.stats?.friendsCount || 0,
          reviews_count: user.stats?.reviewsCount || 0
        },
        badges: user.badges.map(b => ({
          id: b.badge.id,
          name: b.badge.name,
          icon: b.badge.icon
        }))
      },
      tokens: { access_token: accessToken, refresh_token: accessToken }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: { message: 'Login failed' } });
  }
});

app.post('/v1/auth/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    const decoded = jwt.verify(refresh_token, JWT_SECRET);
    const newToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ tokens: { access_token: newToken, refresh_token: newToken } });
  } catch {
    res.status(401).json({ error: { message: 'Invalid refresh token' } });
  }
});

app.post('/v1/auth/logout', authenticate, (req, res) => {
  res.json({ success: true });
});

// =============================================================================
// USER ROUTES
// =============================================================================

app.get('/v1/users/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { stats: true, badges: { include: { badge: true } } }
    });
    
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      handle: user.handle,
      avatar_url: user.avatarUrl,
      stats: {
        nights_out: user.stats?.nightsOut || 0,
        friends_count: user.stats?.friendsCount || 0,
        reviews_count: user.stats?.reviewsCount || 0
      },
      badges: user.badges.map(b => ({
        id: b.badge.id,
        name: b.badge.name,
        icon: b.badge.icon
      }))
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to get user' } });
  }
});

// =============================================================================
// VENUE ROUTES
// =============================================================================

app.get('/v1/venues', optionalAuth, async (req, res) => {
  try {
    const { lat, lng, radius_miles = 10, genres } = req.query;
    
    const venues = await prisma.venue.findMany({
      where: { isActive: true },
      include: { liveData: true }
    });
    
    // Calculate distances and filter
    let results = venues.map(v => {
      let distance = null;
      if (lat && lng) {
        const R = 3959;
        const dLat = (v.lat - parseFloat(lat)) * Math.PI / 180;
        const dLng = (v.lng - parseFloat(lng)) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(parseFloat(lat) * Math.PI / 180) * Math.cos(v.lat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      }
      
      return {
        id: v.id,
        name: v.name,
        slug: v.slug,
        cover_price: v.coverPrice ? parseFloat(v.coverPrice) : 0,
        age_requirement: v.ageRequirement || '21+',
        distance_miles: distance ? parseFloat(distance.toFixed(1)) : null,
        genres: v.genres || [],
        is_featured: v.isFeatured,
        hero_image_url: v.heroImageUrl,
        address: { street: v.streetAddress },
        live_data: v.liveData ? {
          litness_score: parseFloat(v.liveData.litnessScore || 0),
          crowd_level: v.liveData.crowdLevel || 'quiet',
          crowd_percentage: v.liveData.crowdPercentage || 0,
          checked_in_count: v.liveData.checkedInCount || 0
        } : null
      };
    });
    
    // Filter by radius
    if (lat && lng) {
      results = results.filter(v => v.distance_miles <= parseFloat(radius_miles));
      results.sort((a, b) => a.distance_miles - b.distance_miles);
    }
    
    // Filter by genre
    if (genres) {
      const genreList = genres.split(',').map(g => g.toLowerCase());
      results = results.filter(v => 
        v.genres.some(g => genreList.some(fg => g.toLowerCase().includes(fg)))
      );
    }
    
    res.json({ venues: results });
  } catch (error) {
    console.error('Venues error:', error);
    res.status(500).json({ error: { message: 'Failed to get venues' } });
  }
});

app.get('/v1/venues/:id', optionalAuth, async (req, res) => {
  try {
    const venue = await prisma.venue.findUnique({
      where: { id: req.params.id },
      include: { liveData: true }
    });
    
    if (!venue) {
      return res.status(404).json({ error: { message: 'Venue not found' } });
    }
    
    res.json({
      id: venue.id,
      name: venue.name,
      slug: venue.slug,
      cover_price: venue.coverPrice ? parseFloat(venue.coverPrice) : 0,
      age_requirement: venue.ageRequirement || '21+',
      genres: venue.genres || [],
      hero_image_url: venue.heroImageUrl,
      address: { street: venue.streetAddress, city: venue.city, state: venue.state },
      live_data: venue.liveData ? {
        litness_score: parseFloat(venue.liveData.litnessScore || 0),
        crowd_level: venue.liveData.crowdLevel || 'quiet',
        crowd_percentage: venue.liveData.crowdPercentage || 0,
        checked_in_count: venue.liveData.checkedInCount || 0
      } : null
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to get venue' } });
  }
});

app.post('/v1/venues/:id/checkin', authenticate, async (req, res) => {
  try {
    const venueId = req.params.id;
    
    // End any existing checkins
    await prisma.checkin.updateMany({
      where: { userId: req.userId, isActive: true },
      data: { isActive: false, checkedOutAt: new Date() }
    });
    
    // Create new checkin
    const checkin = await prisma.checkin.create({
      data: { userId: req.userId, venueId }
    });
    
    // Update venue count
    await prisma.venueLiveData.upsert({
      where: { venueId },
      update: { checkedInCount: { increment: 1 } },
      create: { venueId, checkedInCount: 1, litnessScore: 3.0, crowdLevel: 'moderate', crowdPercentage: 50 }
    });
    
    res.json({ checkin_id: checkin.id, checked_in: true });
  } catch (error) {
    console.error('Checkin error:', error);
    res.status(500).json({ error: { message: 'Checkin failed' } });
  }
});

app.delete('/v1/venues/:id/checkin', authenticate, async (req, res) => {
  try {
    await prisma.checkin.updateMany({
      where: { userId: req.userId, venueId: req.params.id, isActive: true },
      data: { isActive: false, checkedOutAt: new Date() }
    });
    
    await prisma.venueLiveData.update({
      where: { venueId: req.params.id },
      data: { checkedInCount: { decrement: 1 } }
    }).catch(() => {});
    
    res.json({ checked_in: false });
  } catch (error) {
    res.status(500).json({ error: { message: 'Checkout failed' } });
  }
});

app.get('/v1/venues/:id/comments', async (req, res) => {
  try {
    const comments = await prisma.venueComment.findMany({
      where: { venueId: req.params.id, isHidden: false },
      include: { user: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    res.json({
      comments: comments.map(c => ({
        id: c.id,
        user: { id: c.user.id, name: c.user.name, handle: c.user.handle, avatar_url: c.user.avatarUrl },
        content: c.content,
        litness_rating: c.litnessRating,
        is_verified_checkin: c.isVerifiedCheckin,
        created_at: c.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to get comments' } });
  }
});

app.post('/v1/venues/:id/comments', authenticate, async (req, res) => {
  try {
    const { content, litness_rating } = req.body;
    
    // Check if user is checked in
    const checkin = await prisma.checkin.findFirst({
      where: { userId: req.userId, venueId: req.params.id, isActive: true }
    });
    
    const comment = await prisma.venueComment.create({
      data: {
        venueId: req.params.id,
        userId: req.userId,
        content,
        litnessRating: litness_rating,
        isVerifiedCheckin: !!checkin
      },
      include: { user: { select: { id: true, name: true, handle: true, avatarUrl: true } } }
    });
    
    res.status(201).json({
      id: comment.id,
      user: { id: comment.user.id, name: comment.user.name, handle: comment.user.handle },
      content: comment.content,
      is_verified_checkin: comment.isVerifiedCheckin,
      created_at: comment.createdAt
    });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ error: { message: 'Failed to post comment' } });
  }
});

// =============================================================================
// EVENTS ROUTES
// =============================================================================

app.get('/v1/events', optionalAuth, async (req, res) => {
  try {
    const { date_range = 'this_week' } = req.query;
    
    const now = new Date();
    let endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    if (date_range === 'today') {
      endDate = new Date(now); endDate.setHours(23, 59, 59, 999);
    } else if (date_range === 'tomorrow') {
      endDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    } else if (date_range === 'this_month') {
      endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
    
    const events = await prisma.event.findMany({
      where: {
        isActive: true,
        isCancelled: false,
        startsAt: { gte: now, lte: endDate }
      },
      include: { venue: { select: { id: true, name: true } } },
      orderBy: { startsAt: 'asc' },
      take: 50
    });
    
    res.json({
      events: events.map(e => ({
        id: e.id,
        name: e.name,
        venue: e.venue,
        starts_at: e.startsAt,
        is_free: e.isFree,
        price: { general: e.priceGeneral ? parseFloat(e.priceGeneral) : 0 },
        attending_count: e.attendingCount || 0
      }))
    });
  } catch (error) {
    console.error('Events error:', error);
    res.status(500).json({ error: { message: 'Failed to get events' } });
  }
});

// =============================================================================
// FEED ROUTES
// =============================================================================

app.get('/v1/feed', optionalAuth, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { isHidden: false },
      include: {
        user: { select: { id: true, name: true, handle: true, avatarUrl: true } },
        checkin: { include: { venue: { select: { id: true, name: true } } } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    res.json({
      posts: posts.map(p => ({
        id: p.id,
        user: { id: p.user.id, name: p.user.name, handle: p.user.handle, avatar_url: p.user.avatarUrl },
        content: p.contentText,
        venue: p.checkin?.venue ? { id: p.checkin.venue.id, name: p.checkin.venue.name } : null,
        reactions: { fire: p.fireCount || 0, user_reacted: false },
        comment_count: p.commentCount || 0,
        created_at: p.createdAt
      }))
    });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ error: { message: 'Failed to get feed' } });
  }
});

app.post('/v1/feed', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    
    const checkin = await prisma.checkin.findFirst({
      where: { userId: req.userId, isActive: true },
      include: { venue: true }
    });
    
    const post = await prisma.post.create({
      data: {
        userId: req.userId,
        venueId: checkin?.venueId,
        checkinId: checkin?.id,
        contentText: content,
        isVerifiedCheckin: !!checkin
      },
      include: { user: { select: { id: true, name: true, handle: true } } }
    });
    
    res.status(201).json({
      id: post.id,
      user: { id: post.user.id, name: post.user.name, handle: post.user.handle },
      content: post.contentText,
      venue: checkin?.venue ? { id: checkin.venue.id, name: checkin.venue.name } : null,
      reactions: { fire: 0, user_reacted: false },
      comment_count: 0,
      created_at: post.createdAt
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: { message: 'Failed to create post' } });
  }
});

app.post('/v1/feed/:id/react', authenticate, async (req, res) => {
  try {
    const postId = req.params.id;
    
    const existing = await prisma.postReaction.findUnique({
      where: { postId_userId: { postId, userId: req.userId } }
    });
    
    if (existing) {
      await prisma.postReaction.delete({ where: { id: existing.id } });
      await prisma.post.update({ where: { id: postId }, data: { fireCount: { decrement: 1 } } });
      const post = await prisma.post.findUnique({ where: { id: postId } });
      return res.json({ reacted: false, count: post.fireCount });
    }
    
    await prisma.postReaction.create({ data: { postId, userId: req.userId, reactionType: 'fire' } });
    await prisma.post.update({ where: { id: postId }, data: { fireCount: { increment: 1 } } });
    const post = await prisma.post.findUnique({ where: { id: postId } });
    res.json({ reacted: true, count: post.fireCount });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to react' } });
  }
});

// =============================================================================
// REMINDERS ROUTES
// =============================================================================

app.get('/v1/reminders', authenticate, async (req, res) => {
  try {
    const reminders = await prisma.reminder.findMany({
      where: { userId: req.userId },
      include: { event: { include: { venue: { select: { id: true, name: true } } } } },
      orderBy: { remindAt: 'asc' }
    });
    
    res.json({
      reminders: reminders.map(r => ({
        id: r.id,
        type: r.reminderType,
        remind_at: r.remindAt,
        note: r.note,
        event: r.event ? { id: r.event.id, name: r.event.name, starts_at: r.event.startsAt, venue: r.event.venue } : null
      }))
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to get reminders' } });
  }
});

app.delete('/v1/reminders/:id', authenticate, async (req, res) => {
  try {
    await prisma.reminder.deleteMany({ where: { id: req.params.id, userId: req.userId } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete reminder' } });
  }
});

// =============================================================================
// HEALTH CHECK
// =============================================================================

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// Catch-all: serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🔥 GitLit server running on port ${PORT}`);
});
