import { supabase } from '../../../lib/supabase';

const PROGRESS_PHOTOS_BUCKET = 'progress-photos';
const STORAGE_LIST_PAGE_SIZE = 100;
const STORAGE_REMOVE_BATCH_SIZE = 100;

export class AccountDeletedSignOutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccountDeletedSignOutError';
  }
}

async function listUserPhotoPaths(
  userId: string,
  folderPath: string,
): Promise<string[]> {
  const paths: string[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage
      .from(PROGRESS_PHOTOS_BUCKET)
      .list(folderPath, { limit: STORAGE_LIST_PAGE_SIZE, offset });

    if (error) {
      throw error;
    }

    for (const entry of data) {
      const entryPath = `${folderPath}/${entry.name}`;

      if (!entryPath.startsWith(`${userId}/`)) {
        continue;
      }

      if (entry.id === null) {
        paths.push(...(await listUserPhotoPaths(userId, entryPath)));
      } else {
        paths.push(entryPath);
      }
    }

    if (data.length < STORAGE_LIST_PAGE_SIZE) {
      break;
    }

    offset += STORAGE_LIST_PAGE_SIZE;
  }

  return paths;
}

export async function deleteUserAccount(): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }
  if (!user) {
    throw new Error('Sign in before deleting your account.');
  }

  const photoPaths = await listUserPhotoPaths(user.id, user.id);
  for (
    let index = 0;
    index < photoPaths.length;
    index += STORAGE_REMOVE_BATCH_SIZE
  ) {
    const { error } = await supabase.storage
      .from(PROGRESS_PHOTOS_BUCKET)
      .remove(photoPaths.slice(index, index + STORAGE_REMOVE_BATCH_SIZE));

    if (error) {
      throw error;
    }
  }

  const { error: deletionError } = await supabase.rpc('delete_user_account');
  if (deletionError) {
    throw deletionError;
  }

  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) {
    throw new AccountDeletedSignOutError(
      `Your account was deleted, but signing out failed: ${signOutError.message}`,
    );
  }
}
