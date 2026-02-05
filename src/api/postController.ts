/* eslint-disable */
// ⚠️ 注意：如果你的项目报错 "Module not found: @/request"，请尝试改为 '@/utils/request'
import request from '@/request'

<<<<<<< HEAD
/** 创建帖子 */
export async function addPostUsingPost(
  body: API.PostAddRequest,
  options?: { [key: string]: any }
) {
=======
/** addPost POST /api/post/add */
export async function addPostUsingPost(body: API.PostAddRequest, options?: { [key: string]: any }) {
>>>>>>> 0290a42c7bd207851ca23c289357d30034921d8b
  return request<API.BaseResponseLong_>('/api/post/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

<<<<<<< HEAD
/** 删除帖子 (手动补全) */
export async function deletePost(
  body: API.DeleteRequest,
=======
/** deletePost POST /api/post/delete */
export async function deletePostUsingPost(
  body: API.PostQueryRequest,
>>>>>>> 0290a42c7bd207851ca23c289357d30034921d8b
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

<<<<<<< HEAD
/** 根据 id 获取帖子 */
export async function getPostVOByIdUsingGet(
  params: { id?: number | string },
=======
/** getPostVOById GET /api/post/get/vo */
export async function getPostVoByIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPostVOByIdUsingGETParams,
>>>>>>> 0290a42c7bd207851ca23c289357d30034921d8b
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

<<<<<<< HEAD
/** * 分页获取列表（公共搜索）
 * 用于访客模式查询他人帖子
 */
// 🌟 关键修复：统一使用 listPostVoByPageUsingPost (小写Vo)，并指向正确的 /api 地址
=======
/** listPostVOByPage POST /api/post/list/page/vo */
>>>>>>> 0290a42c7bd207851ca23c289357d30034921d8b
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

<<<<<<< HEAD
/** * 兼容性导出：防止以前的代码用大写 VO 报错
 * (将大写 VO 的调用指向上面同一个函数)
 */
export const listPostVOByPageUsingPost = listPostVoByPageUsingPost;


/** 分页获取当前用户创建的资源列表 (主人查贴) */
export async function listMyPostVOByPage(
=======
/** listMyPostVOByPage POST /api/post/my/list/page/vo */
export async function listMyPostVoByPageUsingPost(
>>>>>>> 0290a42c7bd207851ca23c289357d30034921d8b
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
