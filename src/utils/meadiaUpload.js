import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPERBASE_URL;
const supabaseKey = import.meta.env.VITE_SUPERBASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadFile = (file) => { // export const ලෙස වෙනස් කළා
  return new Promise(async (resolve, reject) => {
    const timeStamp = Date.now();
    const fileName = `${timeStamp}-${file.name}`;

    const { data, error } = await supabase.storage
      .from("images") // Dashboard එකේ මේ නමින්ම Bucket එකක් තිබිය යුතුයි
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