// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** doPostThumb POST /api/post_thumb/ */
export async function doPostThumb(
  body: API.PostThumbAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseInt_>('/api/post_thumb/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** listMyThumbPostByPage POST /api/post_thumb/my/list/page */
export async function listMyThumbPostByPage(
  body: API.PostThumbQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePagePostVO_>('/api/post_thumb/my/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
