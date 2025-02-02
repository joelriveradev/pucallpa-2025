import { Enums, Database } from './database.types'

export type NewPost = Database['public']['Tables']['posts']['Insert']
export type PostStage = Enums<'stage'>
