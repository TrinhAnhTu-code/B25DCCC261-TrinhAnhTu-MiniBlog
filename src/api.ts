import type { Comment, Post } from './types'

const BASE = 'https://jsonplaceholder.typicode.com'

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE}${path}`)
  if (!response.ok) throw new Error('Không thể tải dữ liệu. Vui lòng thử lại.')
  return response.json() as Promise<T>
}

export const getPosts = () => request<Post[]>('/posts')
export const getPost = (id: string) => request<Post>(`/posts/${id}`)
export const getComments = (id: string) => request<Comment[]>(`/posts/${id}/comments`)
