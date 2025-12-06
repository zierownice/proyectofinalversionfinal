import { supabase } from '../lib/supabase';

const BUCKET_NAME = 'product-images';

export const imageService = {
  getImageUrl(path: string): string {
    if (!path) return '';

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    return data.publicUrl;
  },

  getOptimizedImageUrl(path: string, width?: number, height?: number): string {
    const url = this.getImageUrl(path);

    if (!url.includes('supabase')) {
      return url;
    }

    const params = new URLSearchParams();
    if (width) params.append('width', width.toString());
    if (height) params.append('height', height.toString());
    params.append('quality', '80');

    return params.toString() ? `${url}?${params.toString()}` : url;
  },

  async uploadImage(file: File, folder: string = 'products'): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image:', error);
        return null;
      }

      return fileName;
    } catch (error) {
      console.error('Exception uploading image:', error);
      return null;
    }
  },

  async deleteImage(path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([path]);

      if (error) {
        console.error('Error deleting image:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception deleting image:', error);
      return false;
    }
  }
};
