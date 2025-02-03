import { Enums, Database, Tables } from './database.types'

export type Post = Tables<'posts'>
export type NewPost = Database['public']['Tables']['posts']['Insert']
export type PostStage = Enums<'stage'>
