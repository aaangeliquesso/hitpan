import { supabase } from '../../../lib/supabase';
import type { ProgressLog } from '../../../types';

const PROGRESS_PHOTOS_BUCKET = 'progress-photos';

export interface CreateProgressLogInput {
  vanityItemId: string;
  progressPercentage: number;
  notes?: string;
  imageUri: string;
}

export async function uploadProgressPhoto(
  imageUri: string,
  userId: string,
  vanityItemId: string,
): Promise<{ path: string; publicUrl: string }> {
  const response = await fetch(imageUri);
  if (!response.ok) {
    throw new Error('Unable to read the captured photo.');
  }
  const imageData = await response.arrayBuffer();
  if (imageData.byteLength === 0) {
    throw new Error('The captured photo is empty.');
  }

  const filename = `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2)}.jpg`;
  const path = `${userId}/${vanityItemId}/${filename}`;
  const { error } = await supabase.storage
    .from(PROGRESS_PHOTOS_BUCKET)
    .upload(path, imageData, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from(PROGRESS_PHOTOS_BUCKET)
    .getPublicUrl(path);

  if (!data.publicUrl) {
    const { error: removeError } = await supabase.storage
      .from(PROGRESS_PHOTOS_BUCKET)
      .remove([path]);
    if (removeError) {
      throw new Error(
        `The uploaded photo URL was unavailable, and cleanup failed: ${removeError.message}`,
      );
    }
    throw new Error('Unable to create a public URL for the uploaded photo.');
  }

  return { path, publicUrl: data.publicUrl };
}

export async function createProgressLog(
  input: CreateProgressLogInput,
): Promise<ProgressLog> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }
  if (!user) {
    throw new Error('Sign in before logging progress.');
  }

  const uploadedPhoto = await uploadProgressPhoto(
    input.imageUri,
    user.id,
    input.vanityItemId,
  );

  const { data, error } = await supabase
    .from('progress_logs')
    .insert({
      vanity_item_id: input.vanityItemId,
      user_id: user.id,
      photo_url: uploadedPhoto.publicUrl,
      progress_percentage: input.progressPercentage,
      notes: input.notes?.trim() || null,
      logged_at: new Date().toISOString(),
    })
    .select('*')
    .single<ProgressLog>();

  if (error || !data) {
    const { error: cleanupError } = await supabase.storage
      .from(PROGRESS_PHOTOS_BUCKET)
      .remove([uploadedPhoto.path]);

    if (cleanupError) {
      throw new Error(
        `The progress entry could not be saved: ${error?.message ?? 'No entry was returned.'} The uploaded photo could not be removed: ${cleanupError.message}`,
      );
    }
    if (error) {
      throw error;
    }
    throw new Error('The progress entry could not be saved.');
  }

  return data;
}

export async function getProgressLogs(
  vanityItemId?: string,
): Promise<ProgressLog[]> {
  let query = supabase
    .from('progress_logs')
    .select('*')
    .order('logged_at', { ascending: false });

  if (vanityItemId) {
    query = query.eq('vanity_item_id', vanityItemId);
  }

  const { data, error } = await query.returns<ProgressLog[]>();

  if (error) {
    throw error;
  }

  return data;
}
