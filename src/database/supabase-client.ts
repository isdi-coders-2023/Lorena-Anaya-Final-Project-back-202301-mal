import { createClient } from '@supabase/supabase-js';

const bucketURL = process.env.BUCKET_URL as string;
const bucketKey = process.env.BUCKET_API_KEY as string;

export const supabase = createClient(bucketURL, bucketKey);

export const PROFILE_BUCKET_NAME = 'translations';
