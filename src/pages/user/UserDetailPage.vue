<template>
  <div id="userDetailPage">
    <a-card>
      <a-space align="center" :size="24">
        <div class="user-avatar-wrapper" @click="triggerAvatarUpload">
          <a-avatar :size="64" :src="loginUser.userAvatar" />
          <div v-if="isLoginUser" class="avatar-hover-mask">
            <EditOutlined />
          </div>
        </div>
        <input
          v-if="isLoginUser"
          type="file"
          ref="fileInput"
          style="display: none"
          accept="image/*"
          @change="handleAvatarChange"
        />
        <div>
          <div class="user-name-section">
            <div v-if="!isEditingName" @click="startEditName">
              <div class="username" :class="{ 'editable-text': isLoginUser }">
                {{ loginUser.userName || '无名' }}
              </div>
            </div>
            <a-input
              v-else
              v-model:value="editingUserName"
              @blur="saveName"
              @pressEnter="saveName"
              auto-focus
            />
          </div>
          <div class="user-profile-section">
            <div v-if="!isEditingProfile" @click="startEditProfile">
              <div class="user-profile" :class="{ 'editable-text': isLoginUser }">
                {{ loginUser.userProfile || '暂无简介' }}
              </div>
            </div>
            <a-textarea
              v-else
              v-model:value="editingUserProfile"
              @blur="saveProfile"
              @pressEnter="saveProfile"
              auto-focus
              :rows="2"
            />
          </div>
        </div>
      </a-space>
    </a-card>

    <a-card style="margin-top: 16px">
      <a-tabs v-model:activeKey="activeKey" @change="onTabChange">
        <a-tab-pane key="post" tab="我的帖子">
          <a-list :data-source="myPostList" :loading="loading" item-layout="vertical">
            <template #renderItem="{ item }">
              <div class="post-card-container">
                <a-card hoverable class="post-card" @click="router.push(`/post/detail/${item.id}`)">
                  <div class="post-card-body">
                    <div class="post-content-left">
                      <div class="post-title">{{ item.title }}</div>
                      <div class="post-tags">
                        <a-space :size="[0, 8]" wrap>
                          <a-tag
                            v-for="tag in parseTags(item.tags || item.tagList)"
                            :key="tag"
                            :color="getTagColor(tag)"
                          >
                            {{ tag }}
                          </a-tag>
                        </a-space>
                      </div>
                      <div class="post-desc">
                        {{
                          item.content?.length > 100 ? item.content.substring(0, 100) + '...' : item.content
                        }}
                      </div>
                      <div class="post-meta">
                        <a-space>
                          <span>{{ formatDate(item.createTime) }}</span>
                          <span class="action-icon">
                            <component
                              :is="item.hasThumb ? LikeFilled : LikeOutlined"
                              :style="{ color: item.hasThumb ? '#ff4d4f' : 'inherit' }"
                            />
                            {{ item.thumbNum < 0 ? 0 : item.thumbNum }}
                          </span>
                          <span class="action-icon">
                            <component
                              :is="item.hasFavour ? StarFilled : StarOutlined"
                              :style="{ color: item.hasFavour ? '#faad14' : 'inherit' }"
                            />
                            {{ item.favourNum < 0 ? 0 : item.favourNum }}
                          </span>
                          <a-popconfirm
                            title="确认删除该帖子吗？"
                            ok-text="确认"
                            cancel-text="取消"
                            @confirm.stop="doDelete(item)"
                          >
                            <a-button type="link" danger style="padding: 0" @click.stop>删除</a-button>
                          </a-popconfirm>
                        </a-space>
                      </div>
                    </div>
                    <div class="post-content-right" v-if="item.postImg">
                      <img :src="item.postImg" alt="cover" class="post-cover" />
                    </div>
                  </div>
                </a-card>
              </div>
            </template>
          </a-list>
        </a-tab-pane>
        <a-tab-pane key="favour" tab="我的收藏">
          <a-list :data-source="favourPostList" :loading="loading" item-layout="vertical">
            <template #renderItem="{ item }">
              <div class="post-card-container">
                <a-card hoverable class="post-card" @click="router.push(`/post/detail/${item.id}`)">
                  <div class="post-card-body">
                    <div class="post-content-left">
                      <div class="post-title">{{ item.title }}</div>
                      <div class="post-tags">
                        <a-space :size="[0, 8]" wrap>
                          <a-tag
                            v-for="tag in parseTags(item.tags || item.tagList)"
                            :key="tag"
                            :color="getTagColor(tag)"
                          >
                            {{ tag }}
                          </a-tag>
                        </a-space>
                      </div>
                      <div class="post-desc">
                        {{
                          item.content?.length > 100 ? item.content.substring(0, 100) + '...' : item.content
                        }}
                      </div>
                      <div class="post-meta">
                        <a-space>
                          <span><UserOutlined /> {{ item.user?.userName || '无名' }}</span>
                          <span>{{ formatDate(item.createTime) }}</span>
                          <span class="action-icon">
                            <component
                              :is="item.hasThumb ? LikeFilled : LikeOutlined"
                              :style="{ color: item.hasThumb ? '#ff4d4f' : 'inherit' }"
                            />
                            {{ item.thumbNum < 0 ? 0 : item.thumbNum }}
                          </span>
                          <span class="action-icon">
                            <component
                              :is="item.hasFavour ? StarFilled : StarOutlined"
                              :style="{ color: item.hasFavour ? '#faad14' : 'inherit' }"
                            />
                            {{ item.favourNum < 0 ? 0 : item.favourNum }}
                          </span>
                        </a-space>
                      </div>
                    </div>
                    <div class="post-content-right" v-if="item.postImg">
                      <img :src="item.postImg" alt="cover" class="post-cover" />
                    </div>
                  </div>
                </a-card>
              </div>
            </template>
          </a-list>
        </a-tab-pane>
        <a-tab-pane key="thumb" tab="我的点赞">
          <a-list :data-source="thumbPostList" :loading="loading" item-layout="vertical">
            <template #renderItem="{ item }">
              <div class="post-card-container">
                <a-card hoverable class="post-card" @click="router.push(`/post/detail/${item.id}`)">
                  <div class="post-card-body">
                    <div class="post-content-left">
                      <div class="post-title">{{ item.title }}</div>
                      <div class="post-tags">
                        <a-space :size="[0, 8]" wrap>
                          <a-tag
                            v-for="tag in parseTags(item.tags || item.tagList)"
                            :key="tag"
                            :color="getTagColor(tag)"
                          >
                            {{ tag }}
                          </a-tag>
                        </a-space>
                      </div>
                      <div class="post-desc">
                        {{
                          item.content?.length > 100 ? item.content.substring(0, 100) + '...' : item.content
                        }}
                      </div>
                      <div class="post-meta">
                        <a-space>
                          <span><UserOutlined /> {{ item.user?.userName || '无名' }}</span>
                          <span>{{ formatDate(item.createTime) }}</span>
                          <span class="action-icon">
                            <component
                              :is="item.hasThumb ? LikeFilled : LikeOutlined"
                              :style="{ color: item.hasThumb ? '#ff4d4f' : 'inherit' }"
                            />
                            {{ item.thumbNum < 0 ? 0 : item.thumbNum }}
                          </span>
                          <span class="action-icon">
                            <component
                              :is="item.hasFavour ? StarFilled : StarOutlined"
                              :style="{ color: item.hasFavour ? '#faad14' : 'inherit' }"
                            />
                            {{ item.favourNum < 0 ? 0 : item.favourNum }}
                          </span>
                        </a-space>
                      </div>
                    </div>
                    <div class="post-content-right" v-if="item.postImg">
                      <img :src="item.postImg" alt="cover" class="post-cover" />
                    </div>
                  </div>
                </a-card>
              </div>
            </template>
          </a-list>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { listMyFavourPostByPage } from '@/api/postFavourController'
import { listMyThumbPostByPage } from '@/api/postThumbController'
import { listMyPostVOByPage, deletePost } from '@/api/postController'
import { message } from 'ant-design-vue'
import { formatDate, getTagColor } from '@/utils'
import { EditOutlined, LikeFilled, LikeOutlined, StarFilled, StarOutlined, UserOutlined } from '@ant-design/icons-vue'
// import { updateUserUsingPost } from '@/api/userController'
import { updateMyUserUsingPost } from '@/api/userController'
import { uploadFileUsingPost } from '@/api/fileController'

const loginUserStore = useLoginUserStore()
const loginUser = computed(() => loginUserStore.loginUser)
const router = useRouter()
const route = useRoute()

// 判断是否是本人
const isLoginUser = computed(() => {
  if (!loginUser.value.id) return false
  if (route.params.id) {
    return String(loginUser.value.id) === String(route.params.id)
  }
  return true
})

const fileInput = ref<HTMLInputElement | null>(null)
const editingUserName = ref('')
const isEditingName = ref(false)
const editingUserProfile = ref('')
const isEditingProfile = ref(false)

const triggerAvatarUpload = () => {
  if (!isLoginUser.value) return
  fileInput.value?.click()
}

// ----------------------------------------------------------------
// 修复点 1：头像上传（针对图1、2、3的修复）
// ----------------------------------------------------------------
const handleAvatarChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const response = await uploadFileUsingPost({ biz: 'user_avatar' }, file)

    // 【强制断言】既然我们知道它是 BaseResponse，就直接告诉 TS
    // 这里先取出 data，防止 TS 在 response 上找 code 报错
    const res = response.data as any

    // console.log("Debug upload:", res) // 可选：保留调试

    if (res.code === 0 && res.data) {
      // 图3修复：TS 认为 res.data 可能是 boolean 或 string，强制转为 string
      await updateMyUserUsingPost({ id: loginUser.value.id, userAvatar: res.data as string })
      message.success('头像更新成功')
      await loginUserStore.fetchLoginUser()
    } else {
      message.error('头像上传失败：' + (res.message || '未知错误'))
    }
  } catch (error: any) {
    message.error('头像上传失败：' + error.message)
  }
}

const startEditName = () => {
  if (!isLoginUser.value) return
  editingUserName.value = loginUser.value.userName || ''
  isEditingName.value = true
}

const saveName = async () => {
  if (editingUserName.value !== loginUser.value.userName) {
    try {
      const response = await updateMyUserUsingPost({ id: loginUser.value.id, userName: editingUserName.value })
      // 通用修复：使用 as any 规避 AxiosResponse 类型定义不完整的问题
      const res = response.data as any
      if (res.code === 0) {
        message.success('昵称更新成功')
        await loginUserStore.fetchLoginUser()
      } else {
        message.error('昵称更新失败：' + res.message)
      }
    } catch (error: any) {
      message.error('昵称更新失败：' + error.message)
    }
  }
  isEditingName.value = false
}

const startEditProfile = () => {
  if (!isLoginUser.value) return
  editingUserProfile.value = loginUser.value.userProfile || ''
  isEditingProfile.value = true
}

const saveProfile = async () => {
  if (editingUserProfile.value !== loginUser.value.userProfile) {
    try {
      const response = await updateMyUserUsingPost({ id: loginUser.value.id, userProfile: editingUserProfile.value })
      const res = response.data as any
      if (res.code === 0) {
        message.success('简介更新成功')
        await loginUserStore.fetchLoginUser()
      } else {
        message.error('简介更新失败：' + res.message)
      }
    } catch (error: any) {
      message.error('简介更新失败：' + error.message)
    }
  }
  isEditingProfile.value = false
}

const activeKey = ref('post')
const myPostList = ref<API.PostVO[]>([])
const favourPostList = ref<API.PostVO[]>([])
const thumbPostList = ref<API.PostVO[]>([])
const loading = ref(false)

// ----------------------------------------------------------------
// 修复点 4：列表加载（针对图4的修复）
// ----------------------------------------------------------------
const loadData = async () => {
  loading.value = true
  try {
    if (activeKey.value === 'post') {
      const response = await listMyPostVOByPage({
        current: 1,
        pageSize: 10,
        sortField: 'createTime',
        sortOrder: 'descend',
      })

      // 图4修复：BaseResponsePagePostVO_ 类型定义可能缺失 records 字段
      // 使用 as any 暴力解决，因为我们确定运行时的结构是对的
      const res = response.data as any

      if (res.code === 0 && res.data) {
        // 安全访问：如果 res.data.records 存在则使用，否则空数组
        myPostList.value = res.data.records || []
      } else {
        message.error('加载我的帖子失败：' + (res.message || '未知错误'))
      }
    } else if (activeKey.value === 'favour') {
      const response = await listMyFavourPostByPage({
        current: 1,
        pageSize: 10,
        sortField: 'createTime',
        sortOrder: 'descend',
      })
      const res = response.data as any
      if (res.code === 0 && res.data) {
        favourPostList.value = res.data.records || []
      } else {
        message.error('加载收藏失败：' + (res.message || '未知错误'))
      }
    } else {
      const response = await listMyThumbPostByPage({
        current: 1,
        pageSize: 10,
        sortField: 'createTime',
        sortOrder: 'descend',
      })
      const res = response.data as any
      if (res.code === 0 && res.data) {
        thumbPostList.value = res.data.records || []
      } else {
        message.error('加载点赞失败：' + (res.message || '未知错误'))
      }
    }
  } catch (e: any) {
    message.error('加载失败：' + e.message)
  } finally {
    loading.value = false
  }
}

const doDelete = async (item: API.PostVO) => {
  if (!item.id) return
  const response = await deletePost({
    id: item.id,
  })
  const res = response.data as any
  if (res.code === 0) {
    message.success('删除成功')
    loadData()
  } else {
    message.error('删除失败：' + res.message)
  }
}

// ----------------------------------------------------------------
// 修复点：标签解析（针对图5、6的确认）
// ----------------------------------------------------------------
const parseTags = (tags: any) => {
  if (!tags) return []
  // 你的 Debugger 显示 tags 是 "[\"测试\"]" (String类型)
  // 所以这个逻辑是完全正确的，不需要动
  if (typeof tags === 'string') {
    try {
      return JSON.parse(tags)
    } catch (e) {
      console.error('标签解析错误', e)
      return []
    }
  }
  return tags
}

const onTabChange = () => {
  loadData()
}

onMounted(() => {
  if (!loginUser.value.id) {
    // message.warning('请先登录')
  }
  loadData()
})
</script>

<style scoped>
/* 样式部分保持不变 */
.username {
  font-size: 20px;
  font-weight: bold;
}
.user-profile {
  color: #666;
  margin-top: 4px;
}

.user-avatar-wrapper {
  position: relative;
  cursor: pointer;
}

.avatar-hover-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 20px;
  opacity: 0;
  transition: opacity 0.3s;
}

.user-avatar-wrapper:hover .avatar-hover-mask {
  opacity: 1;
}

.editable-text {
  cursor: pointer;
  border-bottom: 1px dashed transparent;
  transition: all 0.3s;
}

.editable-text:hover {
  color: #1890ff;
  border-bottom-color: #1890ff;
}

.user-name-section,
.user-profile-section {
  min-width: 200px;
}

.post-card-container {
  margin-bottom: 16px;
}

.post-card {
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s;
}

.post-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #1890ff;
}

.post-card-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.post-content-left {
  flex: 1;
  min-width: 0;
  margin-right: 16px;
}

.post-title {
  font-size: 16px;
  font-weight: bold;
  color: #1f1f1f;
  margin-bottom: 8px;
}

.post-tags {
  margin-bottom: 8px;
}

.post-desc {
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 12px;
  line-height: 1.5715;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-meta {
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

.action-icon {
  cursor: pointer;
  transition: color 0.3s;
  margin-right: 16px;
}

.post-content-right {
  flex-shrink: 0;
  width: 120px;
  height: 90px;
}

.post-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}
</style>
