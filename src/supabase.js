import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://evtdifjlmutqmoowiggj.supabase.co';
const supabaseKey = 'sb_publishable_YSWTprOUdQ3sDwXllOQm1g_DecbSLcB';

export const supabase = createClient(supabaseUrl, supabaseKey);
