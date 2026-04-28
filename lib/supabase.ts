import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadPhoto(base64: string, fileName: string) {
  // Remove the base64 prefix
  const base64Data = base64.split(',')[1];
  const buffer = Buffer.from(base64Data, 'base64');

  const { data, error } = await supabase.storage
    .from('vehicle-photos') // Make sure this bucket exists in Supabase
    .upload(`photos/${fileName}.jpg`, buffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from('vehicle-photos')
    .getPublicUrl(`photos/${fileName}.jpg`);

  return publicUrlData.publicUrl;
}
