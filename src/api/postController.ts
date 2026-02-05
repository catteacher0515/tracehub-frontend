/* eslint-disable */
// ⚠️ 注意：如果你的项目报错 "Module not found: @/request"，请尝试改为 '@/utils/request'
import request from '@/request'

/** 创建帖子 */
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

/** 删除帖子 (手动补全) */
export async function deletePost(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/post/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 根据 id 获取帖子 */
export async function getPostVOByIdUsingGet(
  params: { id?: number | string },
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePostVO_>('/api/post/get/vo', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** * 分页获取列表（公共搜索）
 * 用于访客模式查询他人帖子
 */
/** listPostVOByPage POST /api/post/list/page/vo */
export async function listPostVoByPageUsingPost(
  body: API.PostQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePagePostVO_>('/api/post/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** * 兼容性导出：防止以前的代码用大写 VO 报错
 * (将大写 VO 的调用指向上面同一个函数)
 */
export const listPostVOByPageUsingPost = listPostVoByPageUsingPost;


/** 分页获取当前用户创建的资源列表 (主人查贴) */
export async function listMyPostVOByPage(
  body: API.PostQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePagePostVO_>('/api/post/my/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
