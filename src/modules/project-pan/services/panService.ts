import { supabase } from '../../../lib/supabase';
import type { VanityItem } from '../../../types';

export interface NewPanItemInput {
  name: string;
  brand: string;
  variant?: string;
  category: string;
  price?: number;
  rating?: number;
  acquisition_type: 'bought' | 'gifted';
  acquired_on: string;
  current_progress: number;
  status?: VanityItem['status'];
}

export async function getPanItems(): Promise<VanityItem[]> {
  const { data, error } = await supabase
    .from('vanity_items')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<VanityItem[]>();

  if (error) {
    throw error;
  }

  return data;
}

export async function createPanItem(
  input: NewPanItemInput,
): Promise<VanityItem> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }
  if (!user) {
    throw new Error('Sign in before adding a product.');
  }

  const { data, error } = await supabase
    .from('vanity_items')
    .insert({
      user_id: user.id,
      name: input.name,
      brand: input.brand,
      variant: input.variant,
      category: input.category,
      price: input.price,
      acquisition_type: input.acquisition_type,
      acquired_on: input.acquired_on,
      current_progress: input.current_progress,
      status: input.current_progress === 100 ? 'finished' : 'active',
    })
    .select('*')
    .single<VanityItem>();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error('The product could not be added.');
  }

  return data;
}

export async function updatePanItem(
  id: string,
  input: NewPanItemInput,
): Promise<VanityItem> {
  const { data, error } = await supabase
    .from('vanity_items')
    .update({
      name: input.name,
      brand: input.brand,
      variant: input.variant || null,
      category: input.category,
      price: input.acquisition_type === 'bought' ? input.price : null,
      rating: input.rating ?? 0,
      acquisition_type: input.acquisition_type,
      acquired_on: input.acquired_on,
      current_progress: input.current_progress,
      status:
        input.status ??
        (input.current_progress === 100 ? 'finished' : 'active'),
    })
    .eq('id', id)
    .select('*')
    .maybeSingle<VanityItem>();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error('This product could not be found or updated.');
  }

  return data;
}

export async function getPanItemById(id: string): Promise<VanityItem> {
  const { data, error } = await supabase
    .from('vanity_items')
    .select('*')
    .eq('id', id)
    .maybeSingle<VanityItem>();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error('This product could not be found.');
  }

  return data;
}

export async function deletePanItem(id: string): Promise<void> {
  const { data, error } = await supabase
    .from('vanity_items')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle<{ id: string }>();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error('This product could not be found or deleted.');
  }
}

export async function updatePanItemRating(
  id: string,
  rating: number,
): Promise<void> {
  const { error } = await supabase
    .from('vanity_items')
    .update({ rating })
    .eq('id', id);

  if (error) {
    throw error;
  }
}
