// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** addPost POST /api/post/add */
export async function addPostUsingPost(
  body: API.PostAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong_>('/api/post/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
