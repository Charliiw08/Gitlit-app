const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create badges
  const badges = await Promise.all([
    prisma.badge.upsert({ where: { name: 'Night Owl' }, update: {}, create: { name: 'Night Owl', icon: '🦉', description: 'Checked in after midnight 10 times' } }),
    prisma.badge.upsert({ where: { name: 'Party Starter' }, update: {}, create: { name: 'Party Starter', icon: '🎉', description: 'First check-in at 5 different venues' } }),
    prisma.badge.upsert({ where: { name: 'VIP' }, update: {}, create: { name: 'VIP', icon: '⭐', description: 'Premium member' } }),
    prisma.badge.upsert({ where: { name: 'Music Lover' }, update: {}, create: { name: 'Music Lover', icon: '🎵', description: 'Visited 10 different music venues' } }),
    prisma.badge.upsert({ where: { name: 'Social Butterfly' }, update: {}, create: { name: 'Social Butterfly', icon: '🦋', description: '50+ friends on GitLit' } }),
  ]);
  console.log('✅ Badges created');

  // Create demo user
  const hashedPassword = await bcrypt.hash('Demo123!', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@gitlit.app' },
    update: {},
    create: {
      email: 'demo@gitlit.app',
      passwordHash: hashedPassword,
      name: 'Alex Thompson',
      handle: 'alexthompson',
      avatarUrl: null,
      stats: {
        create: {
          nightsOut: 47,
          friendsCount: 156,
          reviewsCount: 23,
          postsCount: 12
        }
      }
    }
  });

  // Give demo user some badges
  for (const badge of badges.slice(0, 3)) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: demoUser.id, badgeId: badge.id } },
      update: {},
      create: { userId: demoUser.id, badgeId: badge.id }
    });
  }
  console.log('✅ Demo user created: demo@gitlit.app / Demo123!');

  // Create venues
  const venues = [
    {
      name: 'Vibez Lounge',
      slug: 'vibez-lounge',
      streetAddress: '123 Main Street',
      city: 'Washington',
      state: 'DC',
      lat: 38.9072,
      lng: -77.0369,
      coverPrice: 20,
      ageRequirement: '21+',
      genres: ['Hip Hop', 'R&B', 'Afrobeats'],
      heroImageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800',
      isFeatured: true
    },
    {
      name: 'Neon Dreams',
      slug: 'neon-dreams',
      streetAddress: '456 Club Avenue',
      city: 'Arlington',
      state: 'VA',
      lat: 38.8799,
      lng: -77.1068,
      coverPrice: 0,
      ageRequirement: '21+',
      genres: ['EDM', 'House', 'Techno'],
      heroImageUrl: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800',
      isFeatured: false
    },
    {
      name: 'Salsa Central',
      slug: 'salsa-central',
      streetAddress: '789 Dance Boulevard',
      city: 'Alexandria',
      state: 'VA',
      lat: 38.8048,
      lng: -77.0469,
      coverPrice: 15,
      ageRequirement: '21+',
      genres: ['Latin', 'Salsa', 'Reggaeton'],
      heroImageUrl: 'https://images.unsplash.com/photo-1504704911898-68304a7d2807?w=800',
      isFeatured: false
    },
    {
      name: 'The Jazz Room',
      slug: 'jazz-room',
      streetAddress: '321 Melody Lane',
      city: 'Bethesda',
      state: 'MD',
      lat: 38.9847,
      lng: -77.0947,
      coverPrice: 25,
      ageRequirement: '21+',
      genres: ['Jazz', 'Blues', 'Soul'],
      heroImageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800',
      isFeatured: false
    },
    {
      name: 'Rooftop Social',
      slug: 'rooftop-social',
      streetAddress: '555 Sky High Drive',
      city: 'Washington',
      state: 'DC',
      lat: 38.9000,
      lng: -77.0300,
      coverPrice: 30,
      ageRequirement: '21+',
      genres: ['Top 40', 'Hip Hop', 'Pop'],
      heroImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
      isFeatured: true
    }
  ];

  for (const venueData of venues) {
    const venue = await prisma.venue.upsert({
      where: { slug: venueData.slug },
      update: {},
      create: venueData
    });

    // Create live data for each venue
    const crowdLevels = ['quiet', 'moderate', 'busy', 'packed'];
    const randomCrowd = crowdLevels[Math.floor(Math.random() * crowdLevels.length)];
    const crowdPct = { quiet: 25, moderate: 50, busy: 75, packed: 95 }[randomCrowd];

    await prisma.venueLiveData.upsert({
      where: { venueId: venue.id },
      update: {},
      create: {
        venueId: venue.id,
        isOpen: true,
        crowdLevel: randomCrowd,
        crowdPercentage: crowdPct,
        checkedInCount: Math.floor(Math.random() * 50) + 10,
        litnessScore: (Math.random() * 2 + 3).toFixed(1)
      }
    });
  }
  console.log('✅ Venues created with live data');

  // Get venues for events
  const allVenues = await prisma.venue.findMany();

  // Create events
  const now = new Date();
  const events = [
    {
      venueId: allVenues[0].id,
      name: 'Afrobeats Night: Lagos to DC',
      slug: 'afrobeats-night-lagos-dc',
      description: 'The biggest Afrobeats party in the DMV!',
      startsAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      priceGeneral: 25,
      isFree: false,
      attendingCount: 156
    },
    {
      venueId: allVenues[1].id,
      name: 'EDM Takeover ft. DJ Pulse',
      slug: 'edm-takeover-dj-pulse',
      description: 'Electronic dance music all night long',
      startsAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      priceGeneral: 0,
      isFree: true,
      attendingCount: 234
    },
    {
      venueId: allVenues[2].id,
      name: 'Latin Heat Fridays',
      slug: 'latin-heat-fridays',
      description: 'Salsa, bachata, and reggaeton all night',
      startsAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      priceGeneral: 20,
      isFree: false,
      attendingCount: 189
    },
    {
      venueId: allVenues[3].id,
      name: 'Jazz & Wine Evening',
      slug: 'jazz-wine-evening',
      description: 'Live jazz with premium wine selection',
      startsAt: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      priceGeneral: 35,
      isFree: false,
      attendingCount: 67
    },
    {
      venueId: allVenues[4].id,
      name: 'Sunset Sessions',
      slug: 'sunset-sessions',
      description: 'Rooftop vibes as the sun goes down',
      startsAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      priceGeneral: 40,
      isFree: false,
      attendingCount: 112
    }
  ];

  for (const eventData of events) {
    await prisma.event.upsert({
      where: { slug: eventData.slug },
      update: {},
      create: eventData
    });
  }
  console.log('✅ Events created');

  // Create some sample posts
  const samplePosts = [
    { content: 'Vibez Lounge is absolutely PACKED tonight! The DJ is killing it with the Afrobeats 🔥🔥🔥', venueId: allVenues[0].id },
    { content: 'Found my new favorite spot! The cocktails at Neon Dreams are incredible ✨', venueId: allVenues[1].id },
    { content: 'If you haven\'t been to Salsa Central\'s Latin Night, you\'re missing out! 💃🕺', venueId: allVenues[2].id },
  ];

  for (const postData of samplePosts) {
    await prisma.post.create({
      data: {
        userId: demoUser.id,
        venueId: postData.venueId,
        contentText: postData.content,
        isVerifiedCheckin: true,
        fireCount: Math.floor(Math.random() * 50) + 10
      }
    });
  }
  console.log('✅ Sample posts created');

  // Create sample venue comments
  const sampleComments = [
    { content: 'Just got here, line moving fast! Inside looks LIT 🔥', venueId: allVenues[0].id },
    { content: 'DJ just dropped the new Drake, whole place went crazy!!', venueId: allVenues[0].id },
    { content: 'Great vibes tonight, definitely coming back', venueId: allVenues[1].id },
  ];

  for (const commentData of sampleComments) {
    await prisma.venueComment.create({
      data: {
        userId: demoUser.id,
        venueId: commentData.venueId,
        content: commentData.content,
        isVerifiedCheckin: true,
        litnessRating: Math.floor(Math.random() * 2) + 4
      }
    });
  }
  console.log('✅ Sample comments created');

  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📧 Demo login: demo@gitlit.app');
  console.log('🔑 Password: Demo123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
