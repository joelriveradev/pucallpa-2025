import type {
  Enums,
  Database,
  Tables as PublicTables,
} from '@/lib/supabase/types/database.types'

import type { Database as StorageDatabase } from '@/lib/supabase/types/database.types.storage'

export type Post = PublicTables<'posts'>
export type PostWithLikes = PublicTables<'posts'> & {
  likes: {
    id: string
  }[]
}
export type NewPost = Database['public']['Tables']['posts']['Insert']
export type PostStage = Enums<'stage'>

export type StorageRecord =
  StorageDatabase['storage']['Tables']['objects']['Row']

export interface PhotoCaption {
  url: string
  caption: string
}
