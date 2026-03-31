const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with DMV venues...');

  // Create badges
  const badges = await Promise.all([
    prisma.badge.upsert({ where: { name: 'Night Owl' }, update: {}, create: { name: 'Night Owl', icon: '🦉', description: 'Checked in after midnight 10 times' } }),
    prisma.badge.upsert({ where: { name: 'Party Starter' }, update: {}, create: { name: 'Party Starter', icon: '🎉', description: 'First check-in at 5 different venues' } }),
    prisma.badge.upsert({ where: { name: 'VIP' }, update: {}, create: { name: 'VIP', icon: '⭐', description: 'Premium member' } }),
    prisma.badge.upsert({ where: { name: 'Music Lover' }, update: {}, create: { name: 'Music Lover', icon: '🎵', description: 'Visited 10 different music venues' } }),
    prisma.badge.upsert({ where: { name: 'Social Butterfly' }, update: {}, create: { name: 'Social Butterfly', icon: '🦋', description: '50+ friends on GitLit' } }),
    prisma.badge.upsert({ where: { name: 'DMV Local' }, update: {}, create: { name: 'DMV Local', icon: '🏠', description: 'Visited venues in DC, MD, and VA' } }),
    prisma.badge.upsert({ where: { name: 'Weekend Warrior' }, update: {}, create: { name: 'Weekend Warrior', icon: '⚔️', description: '10 weekend check-ins' } }),
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
      stats: { create: { nightsOut: 47, friendsCount: 156, reviewsCount: 23, postsCount: 12 } }
    }
  });

  for (const badge of badges.slice(0, 3)) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: demoUser.id, badgeId: badge.id } },
      update: {},
      create: { userId: demoUser.id, badgeId: badge.id }
    });
  }
  console.log('✅ Demo user created: demo@gitlit.app / Demo123!');

  // ============================================
  // REAL DMV VENUES
  // ============================================
  const venues = [
    // ============ WASHINGTON DC - NIGHTCLUBS ============
    {
      name: 'Echostage',
      slug: 'echostage-dc',
      streetAddress: '2135 Queens Chapel Rd NE',
      city: 'Washington',
      state: 'DC',
      lat: 38.9269,
      lng: -76.9756,
      coverPrice: 30,
      ageRequirement: '18+',
      genres: ['EDM', 'House', 'Techno', 'Dubstep'],
      heroImageUrl: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800',
      isFeatured: true
    },
    {
      name: 'Flash',
      slug: 'flash-dc',
      streetAddress: '645 Florida Ave NW',
      city: 'Washington',
      state: 'DC',
      lat: 38.9165,
      lng: -77.0217,
      coverPrice: 20,
      ageRequirement: '21+',
      genres: ['Techno', 'House', 'Electronic'],
      heroImageUrl: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800',
      isFeatured: true
    },
    {
      name: 'Soundcheck',
      slug: 'soundcheck-dc',
      streetAddress: '1420 K St NW',
      city: 'Washington',
      state: 'DC',
      lat: 38.9027,
      lng: -77.0328,
      coverPrice: 20,
      ageRequirement: '21+',
      genres: ['Hip Hop', 'R&B', 'Top 40'],
      heroImageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800',
      isFeatured: true
    },
    {
      name: 'The Park at Fourteenth',
      slug: 'park-at-fourteenth-dc',
      streetAddress: '920 14th St NW',
      city: 'Washington',
      state: 'DC',
      lat: 38.9022,
      lng: -77.0325,
      coverPrice: 20,
      ageRequirement: '21+',
      genres: ['Hip Hop', 'Top 40', 'R&B'],
      heroImageUrl: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
      isFeatured: false
    },
    {
      name: 'Decades DC',
      slug: 'decades-dc',
      streetAddress: '1219 Connecticut Ave NW',
      city: 'Washington',
      state: 'DC',
      lat: 38.9072,
      lng: -77.0417,
      coverPrice: 15,
      ageRequirement: '21+',
      genres: ['80s', '90s', 'Throwback', 'Pop'],
      heroImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
      isFeatured: false
    },
    {
      name: 'Bliss Nightclub',
      slug: 'bliss-dc',
      streetAddress: '2122 24th Pl NE',
      city: 'Washington',
      state: 'DC',
      lat: 38.9245,
      lng: -76.9712,
      coverPrice: 25,
      ageRequirement: '21+',
      genres: ['Hip Hop', 'Reggae', 'Afrobeats', 'Latin'],
      heroImageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
      isFeatured: false
    },
    {
      name: 'U Street Music Hall',
      slug: 'u-street-music-hall',
      streetAddress: '1115 U St NW',
      city: 'Washington',
      state: 'DC',
      lat: 38.9171,
      lng: -77.0283,
      coverPrice: 15,
      ageRequirement: '18+',
      genres: ['Electronic', 'House', 'Indie', 'Live Music'],
      heroImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
      isFeatured: true
    },

    // ============ WASHINGTON DC - LOUNGES & BARS ============
    {
      name: 'Living Room DC',
      slug: 'living-room-dc',
      streetAddress: '1008 Vermont Ave NW',
      city: 'Washington',
      state: 'DC',
      lat: 38.9025,
      lng: -77.0301,
      coverPrice: 10,
      ageRequirement: '21+',
      genres: ['Hip Hop', 'R&B', 'Neo Soul'],
      heroImageUrl: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
      isFeatured: false
    },
    {
      name: 'Hawthorne DC',
      slug: 'hawthorne-dc',
      streetAddress: '1336 U St NW',
      city: 'Washington',
      state: 'DC',
      lat: 38.9171,
      lng: -77.0312,
      coverPrice: 0,
      ageRequirement: '21+',
      genres: ['Cocktails', 'Jazz', 'Lounge'],
      heroImageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800',
      isFeatured: false
    },
    {
      name: 'The Gibson',
      slug: 'the-gibson-dc',
      streetAddress: '2009 14th St NW',
      city: 'Washington',
      state: 'DC',
      lat: 38.9178,
      lng: -77.0318,
      coverPrice: 0,
      ageRequirement: '21+',
      genres: ['Speakeasy', 'Cocktails', 'Jazz'],
      heroImageUrl: 'https://images.unsplash.com/photo-1527261834078-9b37d35a4a32?w=800',
      isFeatured: false
    },
    {
      name: 'POV Rooftop Lounge',
      slug: 'pov-rooftop-dc',
      streetAddress: '515 15th St NW',
      city: 'Washington',
      state: 'DC',
      lat: 38.8979,
      lng: -77.0337,
      coverPrice: 20,
      ageRequirement: '21+',
      genres: ['Top 40', 'House', 'Lounge'],
      heroImageUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800',
      isFeatured: true
    },
    {
      name: 'Dirty Habit',
      slug: 'dirty-habit-dc',
      streetAddress: '555 8th St NW',
      city: 'Washington',
      state: 'DC',
      lat: 38.8963,
      lng: -77.0228,
      coverPrice: 0,
      ageRequirement: '21+',
      genres: ['Cocktails', 'Lounge', 'DJ Sets'],
      heroImageUrl: 'https://images.unsplash.com/photo-1575444758702-4a6b9222336e?w=800',
      isFeatured: false
    },
    {
      name: 'Madhatter',
      slug: 'madhatter-dc',
      streetAddress: '1319 Connecticut Ave NW',
      city: 'Washington',
      state: 'DC',
      lat: 38.9086,
      lng: -77.0425,
      coverPrice: 0,
      ageRequirement: '21+',
      genres: ['Top 40', 'Dance', 'Bar'],
      heroImageUrl: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800',
      isFeatured: false
    },
    {
      name: 'Nellie\'s Sports Bar',
      slug: 'nellies-dc',
      streetAddress: '900 U St NW',
      city: 'Washington',
      state: 'DC',
      lat: 38.9171,
      lng: -77.0254,
      coverPrice: 0,
      ageRequirement: '21+',
      genres: ['Top 40', 'Pop', 'LGBTQ+'],
      heroImageUrl: 'https://images.unsplash.com/photo-1575037614876-c38a4571c4c3?w=800',
      isFeatured: false
    },

    // ============ VIRGINIA - ARLINGTON ============
    {
      name: 'Clarendon Ballroom',
      slug: 'clarendon-ballroom',
      streetAddress: '3185 Wilson Blvd',
      city: 'Arlington',
      state: 'VA',
      lat: 38.8871,
      lng: -77.0944,
      coverPrice: 10,
      ageRequirement: '21+',
      genres: ['Top 40', 'Hip Hop', 'Country', 'Live Music'],
      heroImageUrl: 'https://images.unsplash.com/photo-1504704911898-68304a7d2807?w=800',
      isFeatured: true
    },
    {
      name: 'Whitlow\'s on Wilson',
      slug: 'whitlows-arlington',
      streetAddress: '2854 Wilson Blvd',
      city: 'Arlington',
      state: 'VA',
      lat: 38.8864,
      lng: -77.0919,
      coverPrice: 0,
      ageRequirement: '21+',
      genres: ['Live Music', 'Rock', 'Country'],
      heroImageUrl: 'https://images.unsplash.com/photo-1508997449629-303059a039c0?w=800',
      isFeatured: false
    },
    {
      name: 'Spider Kelly\'s',
      slug: 'spider-kellys',
      streetAddress: '3181 Wilson Blvd',
      city: 'Arlington',
      state: 'VA',
      lat: 38.8870,
      lng: -77.0942,
      coverPrice: 5,
      ageRequirement: '21+',
      genres: ['Top 40', 'Dance', 'Bar'],
      heroImageUrl: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
      isFeatured: false
    },
    {
      name: 'Don Tito',
      slug: 'don-tito-arlington',
      streetAddress: '3165 Wilson Blvd',
      city: 'Arlington',
      state: 'VA',
      lat: 38.8868,
      lng: -77.0938,
      coverPrice: 0,
      ageRequirement: '21+',
      genres: ['Latin', 'Reggaeton', 'Top 40'],
      heroImageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
      isFeatured: false
    },
    {
      name: 'Bracket Room',
      slug: 'bracket-room',
      streetAddress: '1212 N Highland St',
      city: 'Arlington',
      state: 'VA',
      lat: 38.8862,
      lng: -77.0930,
      coverPrice: 0,
      ageRequirement: '21+',
      genres: ['Sports Bar', 'Top 40', 'Bar'],
      heroImageUrl: 'https://images.unsplash.com/photo-1575037614876-c38a4571c4c3?w=800',
      isFeatured: false
    },
    {
      name: 'A-Town Bar & Grill',
      slug: 'a-town-arlington',
      streetAddress: '3100 Clarendon Blvd',
      city: 'Arlington',
      state: 'VA',
      lat: 38.8873,
      lng: -77.0952,
      coverPrice: 0,
      ageRequirement: '21+',
      genres: ['Sports Bar', 'Top 40'],
      heroImageUrl: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800',
      isFeatured: false
    },
    {
      name: 'Oz Restaurant & Lounge',
      slug: 'oz-arlington',
      streetAddress: '2950 Clarendon Blvd',
      city: 'Arlington',
      state: 'VA',
      lat: 38.8867,
      lng: -77.0932,
      coverPrice: 10,
      ageRequirement: '21+',
      genres: ['Hip Hop', 'Afrobeats', 'R&B'],
      heroImageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800',
      isFeatured: false
    },

    // ============ VIRGINIA - OTHER AREAS ============
    {
      name: 'Pitch Karaoke Bar',
      slug: 'pitch-karaoke-dc',
      streetAddress: '1319 V St NW',
      city: 'Washington',
      state: 'DC',
      lat: 38.9180,
      lng: -77.0295,
      coverPrice: 0,
      ageRequirement: '21+',
      genres: ['Karaoke', 'Pop', 'Party'],
      heroImageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
      isFeatured: false
    },
    {
      name: 'Midtown Partyplex',
      slug: 'midtown-partyplex',
      streetAddress: '911 F St NW',
      city: 'Washington',
      state: 'DC',
      lat: 38.8970,
      lng: -77.0234,
      coverPrice: 15,
      ageRequirement: '21+',
      genres: ['Hip Hop', 'R&B', 'Go-Go', 'Top 40'],
      heroImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
      isFeatured: false
    },

    // ============ MARYLAND ============
    {
      name: 'The Fillmore Silver Spring',
      slug: 'fillmore-silver-spring',
      streetAddress: '8656 Colesville Rd',
      city: 'Silver Spring',
      state: 'MD',
      lat: 38.9951,
      lng: -77.0261,
      coverPrice: 25,
      ageRequirement: '18+',
      genres: ['Live Music', 'Hip Hop', 'Rock', 'EDM'],
      heroImageUrl: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800',
      isFeatured: true
    },
    {
      name: 'Society Lounge',
      slug: 'society-lounge-silver-spring',
      streetAddress: '8229 Georgia Ave',
      city: 'Silver Spring',
      state: 'MD',
      lat: 38.9903,
      lng: -77.0276,
      coverPrice: 10,
      ageRequirement: '21+',
      genres: ['Hip Hop', 'R&B', 'Afrobeats', 'Caribbean'],
      heroImageUrl: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
      isFeatured: false
    },
    {
      name: 'Villain & Saint',
      slug: 'villain-saint-bethesda',
      streetAddress: '7141 Wisconsin Ave',
      city: 'Bethesda',
      state: 'MD',
      lat: 38.9815,
      lng: -77.0948,
      coverPrice: 10,
      ageRequirement: '21+',
      genres: ['Live Music', 'Rock', 'Indie'],
      heroImageUrl: 'https://images.unsplash.com/photo-1508997449629-303059a039c0?w=800',
      isFeatured: false
    },
    {
      name: 'The Eleanor',
      slug: 'the-eleanor',
      streetAddress: '933 Ellsworth Dr',
      city: 'Silver Spring',
      state: 'MD',
      lat: 38.9963,
      lng: -77.0258,
      coverPrice: 0,
      ageRequirement: '21+',
      genres: ['Arcade Bar', 'Cocktails', 'Retro'],
      heroImageUrl: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=800',
      isFeatured: false
    },
    {
      name: 'Takoma Station Tavern',
      slug: 'takoma-station',
      streetAddress: '6914 4th St NW',
      city: 'Washington',
      state: 'DC',
      lat: 38.9764,
      lng: -77.0123,
      coverPrice: 5,
      ageRequirement: '21+',
      genres: ['Jazz', 'Blues', 'Live Music'],
      heroImageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800',
      isFeatured: false
    },
    {
      name: 'Union Stage',
      slug: 'union-stage-dc',
      streetAddress: '740 Water St SW',
      city: 'Washington',
      state: 'DC',
      lat: 38.8783,
      lng: -77.0231,
      coverPrice: 20,
      ageRequirement: '18+',
      genres: ['Live Music', 'Indie', 'Rock', 'Electronic'],
      heroImageUrl: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800',
      isFeatured: false
    },
    {
      name: 'Cafe Saint-Ex',
      slug: 'cafe-saint-ex',
      streetAddress: '1847 14th St NW',
      city: 'Washington',
      state: 'DC',
      lat: 38.9156,
      lng: -77.0319,
      coverPrice: 5,
      ageRequirement: '21+',
      genres: ['Electronic', 'House', 'Indie'],
      heroImageUrl: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800',
      isFeatured: false
    },
    {
      name: 'Opera Ultra Lounge',
      slug: 'opera-ultra-lounge',
      streetAddress: '1400 I St NW',
      city: 'Washington',
      state: 'DC',
      lat: 38.9016,
      lng: -77.0325,
      coverPrice: 20,
      ageRequirement: '21+',
      genres: ['Hip Hop', 'Top 40', 'VIP'],
      heroImageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800',
      isFeatured: false
    },
    {
      name: 'Eden DC',
      slug: 'eden-dc',
      streetAddress: '1716 I St NW',
      city: 'Washington',
      state: 'DC',
      lat: 38.9018,
      lng: -77.0398,
      coverPrice: 20,
      ageRequirement: '21+',
      genres: ['Hip Hop', 'Top 40', 'R&B'],
      heroImageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
      isFeatured: false
    },
    {
      name: 'Rosebar Lounge',
      slug: 'rosebar-lounge',
      streetAddress: '1015 Half St SE',
      city: 'Washington',
      state: 'DC',
      lat: 38.8756,
      lng: -77.0050,
      coverPrice: 15,
      ageRequirement: '21+',
      genres: ['Hip Hop', 'Afrobeats', 'R&B', 'Caribbean'],
      heroImageUrl: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
      isFeatured: true
    },
  ];

  // Insert venues with live data
  for (const venueData of venues) {
    const venue = await prisma.venue.upsert({
      where: { slug: venueData.slug },
      update: venueData,
      create: venueData
    });

    const crowdLevels = ['quiet', 'moderate', 'busy', 'packed'];
    const randomCrowd = crowdLevels[Math.floor(Math.random() * crowdLevels.length)];
    const crowdPct = { quiet: 25, moderate: 50, busy: 75, packed: 95 }[randomCrowd];

    await prisma.venueLiveData.upsert({
      where: { venueId: venue.id },
      update: {
        isOpen: true,
        crowdLevel: randomCrowd,
        crowdPercentage: crowdPct,
        checkedInCount: Math.floor(Math.random() * 80) + 5,
        litnessScore: (Math.random() * 2 + 3).toFixed(1)
      },
      create: {
        venueId: venue.id,
        isOpen: true,
        crowdLevel: randomCrowd,
        crowdPercentage: crowdPct,
        checkedInCount: Math.floor(Math.random() * 80) + 5,
        litnessScore: (Math.random() * 2 + 3).toFixed(1)
      }
    });
  }
  console.log(`✅ ${venues.length} venues created with live data`);

  // Get venues for events
  const allVenues = await prisma.venue.findMany({ take: 15 });
  const now = new Date();

  // Create events at various venues
  const events = [
    { venueId: allVenues[0]?.id, name: 'Zedd: Odyssey Tour', slug: 'zedd-odyssey-echostage', description: 'World-renowned DJ Zedd brings his Odyssey Tour to Echostage!', startsAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), priceGeneral: 65, isFree: false, attendingCount: 2340 },
    { venueId: allVenues[1]?.id, name: 'Techno Tuesday', slug: 'techno-tuesday-flash', description: 'Weekly techno night featuring local and international DJs', startsAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), priceGeneral: 15, isFree: false, attendingCount: 189 },
    { venueId: allVenues[2]?.id, name: 'R&B Thursdays', slug: 'rb-thursdays-soundcheck', description: 'The best R&B and Hip Hop in the city', startsAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), priceGeneral: 20, isFree: false, attendingCount: 456 },
    { venueId: allVenues[6]?.id, name: 'Indie Dance Party', slug: 'indie-dance-u-street', description: 'Dance to the best indie and alternative hits', startsAt: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), priceGeneral: 12, isFree: false, attendingCount: 234 },
    { venueId: allVenues[10]?.id, name: 'Rooftop Sunset Sessions', slug: 'sunset-sessions-pov', description: 'Watch the sunset over the White House with drinks and beats', startsAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), priceGeneral: 0, isFree: true, attendingCount: 178 },
    { venueId: allVenues[14]?.id, name: 'Clarendon Country Night', slug: 'country-night-clarendon', description: 'Line dancing and country hits all night', startsAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), priceGeneral: 10, isFree: false, attendingCount: 312 },
    { venueId: allVenues[22]?.id, name: 'Afrobeats vs Caribbean', slug: 'afrobeats-caribbean-society', description: 'The ultimate showdown of Afrobeats and Caribbean music', startsAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), priceGeneral: 15, isFree: false, attendingCount: 267 },
    { venueId: allVenues[4]?.id, name: '90s vs 2000s Night', slug: '90s-2000s-decades', description: 'Throwback party with all your favorite hits', startsAt: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000), priceGeneral: 15, isFree: false, attendingCount: 423 },
    { venueId: allVenues[21]?.id, name: 'The Fillmore Presents: Live Hip Hop', slug: 'live-hiphop-fillmore', description: 'Live performances from DMV hip hop artists', startsAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), priceGeneral: 35, isFree: false, attendingCount: 567 },
    { venueId: allVenues[5]?.id, name: 'Reggae Saturdays', slug: 'reggae-saturdays-bliss', description: 'Good vibes and reggae all night long', startsAt: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), priceGeneral: 20, isFree: false, attendingCount: 198 },
  ];

  for (const eventData of events) {
    if (eventData.venueId) {
      await prisma.event.upsert({
        where: { slug: eventData.slug },
        update: eventData,
        create: eventData
      });
    }
  }
  console.log('✅ Events created');

  // Create sample posts
  const samplePosts = [
    { content: 'Echostage is absolutely INSANE tonight! The bass is shaking the whole building 🔊🔥', venueId: allVenues[0]?.id },
    { content: 'Flash never disappoints. Best techno in the city, hands down.', venueId: allVenues[1]?.id },
    { content: 'Soundcheck on a Friday is always the move! DJ killing it with the throwbacks 🎵', venueId: allVenues[2]?.id },
    { content: 'POV rooftop views are unmatched. Perfect night for sunset drinks! 🌅', venueId: allVenues[10]?.id },
    { content: 'Clarendon Ballroom going crazy tonight! Line is around the block 🙌', venueId: allVenues[14]?.id },
  ];

  for (const postData of samplePosts) {
    if (postData.venueId) {
      await prisma.post.create({
        data: {
          userId: demoUser.id,
          venueId: postData.venueId,
          contentText: postData.content,
          isVerifiedCheckin: true,
          fireCount: Math.floor(Math.random() * 100) + 10
        }
      });
    }
  }
  console.log('✅ Sample posts created');

  // Create sample comments
  const sampleComments = [
    { content: 'Line is moving fast, inside is PACKED! 🔥', venueId: allVenues[0]?.id },
    { content: 'Sound system is incredible tonight', venueId: allVenues[0]?.id },
    { content: 'Vibes are immaculate, definitely staying late', venueId: allVenues[1]?.id },
    { content: 'Great crowd energy tonight!', venueId: allVenues[2]?.id },
    { content: 'Cover was only $10, totally worth it', venueId: allVenues[14]?.id },
  ];

  for (const commentData of sampleComments) {
    if (commentData.venueId) {
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
  }
  console.log('✅ Sample comments created');

  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📧 Demo login: demo@gitlit.app');
  console.log('🔑 Password: Demo123!');
  console.log('');
  console.log(`🏙️ Added ${venues.length} real DMV venues!`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
