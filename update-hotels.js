import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env file manually
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    env[key] = val;
  }
});

const SUPABASE_URL = env.SUPABASE_URL || 'https://evtdifjlmutqmoowiggj.supabase.co';
const SUPABASE_KEY = env.SUPABASE_KEY || 'sb_publishable_YSWTprOUdQ3sDwXllOQm1g_DecbSLcB';

console.log('Connecting to Supabase:', SUPABASE_URL);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const hotelUpdates = [
  {
    id: 'hotel-001',
    name: 'Kumarakom Lake Resort',
    map_url: 'https://maps.app.goo.gl/PzB6x1GzZq47m8rC8',
    whatsapp: '914812524900',
    price: 22000
  },
  {
    id: 'hotel-002',
    name: 'Taj Malabar Resort & Spa, Cochin',
    map_url: 'https://maps.app.goo.gl/uX3WUikcVofabs3QA',
    whatsapp: '914846643000',
    price: 14200
  },
  {
    id: 'hotel-003',
    name: 'Spice Village Thekkady',
    map_url: 'https://maps.app.goo.gl/g69fVshgR2pGgS6p9',
    whatsapp: '914869224514',
    price: 12500
  },
  {
    id: 'hotel-004',
    name: 'Lakes & Lagoons Houseboat Alleppey',
    map_url: 'https://maps.app.goo.gl/hGzNgr3GvY7uXz7z7',
    whatsapp: '914772230922',
    price: 11500
  },
  {
    id: 'hotel-005',
    name: 'Elixir Hills Suites Resort Munnar',
    map_url: 'https://maps.app.goo.gl/G6qWdYhHnJtzt3tZ9',
    whatsapp: '919495000523',
    price: 9800
  },
  {
    id: 'hotel-006',
    name: 'The Gateway Hotel Varkala',
    map_url: 'https://maps.app.goo.gl/BThh2T2nZ117G8yT8',
    whatsapp: '914702773000',
    price: 11000
  },
  {
    id: 'hotel-007',
    name: 'Vythiri Resort Wayanad',
    map_url: 'https://maps.app.goo.gl/zB33XzhhR2zP9z8y9',
    whatsapp: '914936256356',
    price: 16500
  },
  {
    id: 'hotel-008',
    name: 'The Leela Kovalam, A Raviz Hotel',
    map_url: 'https://maps.app.goo.gl/6pZ7tXzZ9z3z7y6b9',
    whatsapp: '914713051234',
    price: 18500
  }
];

async function main() {
  console.log('🔄 Updating original hotels with real rates, maps, and phone numbers...');
  
  for (const update of hotelUpdates) {
    console.log(`  Updating ${update.id} (${update.name})...`);
    const { error } = await supabase
      .from('hotels')
      .update({
        name: update.name,
        map_url: update.map_url,
        whatsapp: update.whatsapp,
        price: update.price
      })
      .eq('id', update.id);
      
    if (error) {
      console.error(`❌ Failed to update ${update.id}: ${error.message}`);
    } else {
      console.log(`  ✅ Successfully updated ${update.id}`);
    }
  }

  console.log('\n🎉 Finished updating hotel records!');
}

main().catch(console.error);
