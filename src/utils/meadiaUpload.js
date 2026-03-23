import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPERBASE_URL;
const supabaseKey = import.meta.env.VITE_SUPERBASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadFile = (file) => { // Changed to export const
  return new Promise(async (resolve, reject) => {
    const timeStamp = Date.now();
    const fileName = `${timeStamp}-${file.name}`;

    const { data, error } = await supabase.storage
      .from("images") // There must be a Bucket with this name in the Dashboard
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      reject(error);
    } else {
      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);
      resolve(urlData.publicUrl);
    }
  });
};