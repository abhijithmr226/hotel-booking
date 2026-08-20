import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://evtdifjlmutqmoowiggj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YSWTprOUdQ3sDwXllOQm1g_DecbSLcB';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const reviewTemplates = [
  {
    author: "Rahul & Sneha Sharma",
    location: "Bangalore, India",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    daysAgo: 4,
    commentGen: (hotel) => `Exceptional experience from check-in to departure! The view of ${hotel.location} was breathtaking right from our room balcony. Impeccable cleanliness, soothing ambience, and the staff treated us like royalty. We loved the traditional Kerala breakfast spread with fresh appam and coconut stew. Direct WhatsApp booking made everything super easy. Will definitely be returning next season!`,
    replyGen: (hotel) => `Thank you so much Rahul & Sneha! It was an absolute pleasure hosting you at ${hotel.name}. We look forward to welcoming you back for another unforgettable Kerala holiday soon.`
  },
  {
    author: "Dr. Lakshmi & Anand Nair",
    location: "Kochi, Kerala",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    daysAgo: 12,
    commentGen: (hotel) => `Stayed here for 3 nights for our anniversary weekend. The property is tranquil and beautifully maintained. The Ayurvedic spa session was one of the most rejuvenating experiences we've had. Room service was lightning fast, and the dining with authentic local seafood was top notch. Highly recommended stay in ${hotel.district}!`,
    replyGen: (hotel) => `Happy anniversary once again Lakshmi & Anand! We are thrilled to hear you enjoyed the Ayurvedic therapies and culinary offerings. Hope to host you again soon.`
  },
  {
    author: "Michael & Sophie Turner",
    location: "London, United Kingdom",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    daysAgo: 18,
    commentGen: (hotel) => `A slice of paradise in God's Own Country! The architecture and natural surroundings of ${hotel.name} exceeded all our expectations. Clean comfortable beds, blazing fast Wi-Fi for working remotely, and the swimming pool was immaculate. The staff organized a wonderful guided tour for us. 10/10 hospitality!`,
    replyGen: (hotel) => `Warm greetings from Kerala, Michael & Sophie! Thank you for choosing ${hotel.name}. We are so glad our team could make your Indian holiday memorable.`
  },
  {
    author: "Arun George & Family",
    location: "Dubai, UAE",
    photo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    daysAgo: 25,
    commentGen: (hotel) => `Traveled with my elderly parents and two kids. The property was very accessible, spacious, and family-friendly. The food was customized for our kids without any fuss. The evening sunset ambiance here is pure bliss. Booking directly without any hidden fees was a breeze. Kudos to the entire team!`,
    replyGen: (hotel) => `Dear Arun, thank you for your kind words. Ensuring comfort for families across generations is our top priority. We hope to see you and your family again on your next trip to Kerala.`
  },
  {
    author: "Priya Menon",
    location: "Mumbai, India",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
    rating: 4,
    daysAgo: 32,
    commentGen: (hotel) => `Peaceful and scenic retreat! The location is great, close to key sights in ${hotel.district} yet tucked away from traffic. The room was spotlessly clean and spacious. The dinner menu had delicious Malabar specials. The morning nature walk was very refreshing.`,
    replyGen: (hotel) => `Thank you for sharing your feedback Priya! We are glad you enjoyed the scenic location and culinary delights. Safe travels until next time!`
  }
];

async function seedReviews() {
  console.log('Fetching active hotels from database...');
  const { data: hotels, error } = await supabase.from('hotels').select('id, name, location, district, status').eq('status', 'active');
  if (error || !hotels) {
    console.error('Failed to fetch hotels:', error);
    return;
  }

  console.log(`Found ${hotels.length} active hotels. Seeding realistic reviews...`);

  let totalInserted = 0;

  for (const hotel of hotels) {
    // Generate 3 to 5 reviews per hotel
    const numReviews = Math.floor(Math.random() * 2) + 3; // 3 or 4 reviews

    for (let i = 0; i < numReviews; i++) {
      const template = reviewTemplates[i % reviewTemplates.length];
      const reviewId = `rev-${hotel.id}-${i + 1}`;
      const createdDate = new Date(Date.now() - template.daysAgo * 86400000 - (i * 3600000 * 12)).toISOString();

      const reviewRecord = {
        review_id: reviewId,
        hotel_id: hotel.id,
        hotel_name: hotel.name,
        user_id: `user-guest-${i + 1}`,
        user_name: template.author,
        user_photo: template.photo,
        rating: template.rating,
        comment: template.commentGen(hotel),
        reply_text: template.replyGen(hotel),
        status: 'approved',
        created_at: createdDate
      };

      const { error: revErr } = await supabase.from('reviews').upsert(reviewRecord);
      if (!revErr) {
        totalInserted++;
      } else {
        console.error(`Error inserting review ${reviewId}:`, revErr.message);
      }
    }
  }

  console.log(`🎉 Successfully seeded ${totalInserted} realistic reviews across all ${hotels.length} hotels!`);
}

seedReviews();
