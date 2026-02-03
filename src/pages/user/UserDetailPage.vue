<template>
  <div id="userDetailPage">
    <a-card>
      <div class="user-detail-header">
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

        <div class="user-info-content">
          <div class="user-name-section">
            <div v-if="!isEditingName" @click="startEditName">
              <a-tooltip :title="loginUser.userName">
                <div class="username" :class="{ 'editable-text': isLoginUser }">
                  {{ loginUser.userName || '无名' }}
                </div>
              </a-tooltip>
            </div>
            <a-input
              v-else
              v-model:value="editingUserName"
              @blur="saveName"
              @pressEnter="saveName"
              auto-focus
              size="small"
              :maxlength="20"
            />
          </div>

          <div class="user-id-section" v-if="loginUser.id">
            <span class="id-text">ID: {{ loginUser.id }}</span>
            <a-tooltip title="复制 ID">
              <CopyOutlined class="copy-icon" @click="copyId" />
            </a-tooltip>
          </div>

          <div class="user-profile-section">
            <div v-if="!isEditingProfile" @click="startEditProfile">
              <a-tooltip :title="loginUser.userProfile">
                <div class="user-profile" :class="{ 'editable-text': isLoginUser }">
                  {{ loginUser.userProfile || '暂无简介' }}
                </div>
              </a-tooltip>
            </div>
            <a-textarea
              v-else
              v-model:value="editingUserProfile"
              @blur="saveProfile"
              @pressEnter="saveProfile"
              auto-focus
              :rows="2"
              :maxlength="100"
            />
          </div>
        </div>
      </div>
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
import {
  EditOutlined,
  LikeFilled,
  LikeOutlined,
  StarFilled,
  StarOutlined,
  UserOutlined,
  CopyOutlined // 引入复制图标
} from '@ant-design/icons-vue'
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

const handleAvatarChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const response = await uploadFileUsingPost({ biz: 'user_avatar' }, file)
    const res = response.data as any

    if (res.code === 0 && res.data) {
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

// 【新增】复制 ID 逻辑
const copyId = async () => {
  if (!loginUser.value.id) return
  try {
    await navigator.clipboard.writeText(String(loginUser.value.id))
    message.success('已复制用户 ID')
  } catch (e) {
    message.error('复制失败，请手动复制')
  }
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
      const res = response.data as any

      if (res.code === 0 && res.data) {
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

const parseTags = (tags: any) => {
  if (!tags) return []
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
  loadData()
})
</script>

<style scoped>
/* 核心布局修复：Web 端单行护航 */
.user-detail-header {
  display: flex;
  align-items: center; /* 垂直居中 */
  gap: 24px;
  flex-wrap: nowrap; /* 绝对禁止换行 */
}

.user-avatar-wrapper {
  position: relative;
  cursor: pointer;
  flex-shrink: 0; /* 头像绝对禁止被挤压 */
}

/* 信息内容区：自适应宽度的关键 */
.user-info-content {
  flex: 1; /* 占据剩余空间 */
  min-width: 0; /* 激活 Flex 子元素的文本截断能力 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden; /* 防止内容溢出容器 */
}

.user-name-section,
.user-profile-section {
  width: 100%; /* 占满父容器 */
}

/* 【新增】ID 区域样式 */
.user-id-section {
  margin-top: 4px;
  margin-bottom: 4px;
  color: #8c8c8c;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px; /* 文字和图标的间距 */
}

.copy-icon {
  cursor: pointer;
  transition: color 0.3s;
}

.copy-icon:hover {
  color: #1890ff; /* 悬停变色，提示可点击 */
}

/* 文本截断核心样式 */
.username {
  font-size: 20px;
  font-weight: bold;
  max-width: 10em;  /* 约等于5-6个汉字 + 省略号，你可以根据需要改成 150px */
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.user-profile {
  color: #666;
  margin-top: 4px;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.user-name-section .ant-input,
.user-profile-section .ant-textarea {
  max-width: 300px;
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
