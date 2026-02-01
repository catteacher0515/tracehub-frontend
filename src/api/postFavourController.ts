/* eslint-disable */
import request from '@/request'

/** doPostFavour POST /api/post_favour/ */
export async function doPostFavour(
  body: API.PostFavourAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseInt_>('/api/post_favour/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** listMyFavourPostByPage POST /api/post_favour/my/list/page */
export async function listMyFavourPostByPage(
  body: API.PostFavourQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePagePostVO_>('/api/post_favour/my/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
