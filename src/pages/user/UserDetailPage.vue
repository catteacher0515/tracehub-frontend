<template>
  <div id="userDetailPage">
    <a-card>
      <div class="user-detail-header">
        <div class="user-avatar-wrapper" @click="isLoginUser ? triggerAvatarUpload() : null">
          <a-avatar :size="64" :src="userDetail.userAvatar" />
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
            <div v-if="!isEditingName" @click="isLoginUser ? startEditName() : null">
              <a-tooltip :title="userDetail.userName">
                <div class="username" :class="{ 'editable-text': isLoginUser }">
                  {{ userDetail.userName || '无名' }}
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

          <div class="user-id-section" v-if="userDetail.id">
            <span class="id-text">ID: {{ userDetail.id }}</span>
            <a-tooltip title="复制 ID">
              <CopyOutlined class="copy-icon" @click="copyId" />
            </a-tooltip>
          </div>

          <div class="user-profile-section">
            <div v-if="!isEditingProfile" @click="isLoginUser ? startEditProfile() : null">
              <a-tooltip :title="userDetail.userProfile">
                <div class="user-profile" :class="{ 'editable-text': isLoginUser }">
                  {{ userDetail.userProfile || '暂无简介' }}
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
        <a-tab-pane key="post" :tab="isLoginUser ? '我的帖子' : 'TA 的帖子'">
          <a-list :data-source="postList" :loading="loading" item-layout="vertical">
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
                          <a-popconfirm
                            v-if="isLoginUser"
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

        <a-tab-pane key="favour" tab="我的收藏" v-if="isLoginUser">
          <a-list :data-source="favourPostList" :loading="loading" item-layout="vertical">
            <template #renderItem="{ item }">
              <div class="post-card-container">
                <a-card hoverable class="post-card" @click="router.push(`/post/detail/${item.id}`)">
                  <div class="post-card-body">
                    <div class="post-content-left">
                      <div class="post-title">{{ item.title }}</div>
                      <div class="post-desc">{{ item.content }}</div>
                    </div>
                  </div>
                </a-card>
              </div>
            </template>
          </a-list>
        </a-tab-pane>

        <a-tab-pane key="thumb" tab="我的点赞" v-if="isLoginUser">
          <a-list :data-source="thumbPostList" :loading="loading" item-layout="vertical">
            <template #renderItem="{ item }">
              <div class="post-card-container">
                <a-card hoverable class="post-card" @click="router.push(`/post/detail/${item.id}`)">
                  <div class="post-card-body">
                    <div class="post-content-left">
                      <div class="post-title">{{ item.title }}</div>
                      <div class="post-desc">{{ item.content }}</div>
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
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { listMyFavourPostByPage } from '@/api/postFavourController'
import { listMyThumbPostByPage } from '@/api/postThumbController'
import { listMyPostVOByPage, deletePost, listPostVoByPageUsingPost } from '@/api/postController'
import { getUserVoByIdUsingGet, updateMyUserUsingPost } from '@/api/userController'
import { uploadFileUsingPost } from '@/api/fileController'
import { message } from 'ant-design-vue'
import { formatDate, getTagColor } from '@/utils'
import {
  EditOutlined,
  LikeFilled,
  LikeOutlined,
  StarFilled,
  StarOutlined,
  UserOutlined,
  CopyOutlined
} from '@ant-design/icons-vue'

const loginUserStore = useLoginUserStore()
const loginUser = computed(() => loginUserStore.loginUser)
const router = useRouter()
const route = useRoute()

// 1. 定义 userDetail
const userDetail = ref<API.UserVO>({})

// 2. 判断是否是“主人态”
const isLoginUser = computed(() => {
  if (!loginUser.value.id) return false
  if (!route.params.id) return true
  return String(loginUser.value.id) === String(route.params.id)
})

// 3. 基础的用户信息加载（访客用）
const loadUserInfo = async () => {
  if (isLoginUser.value) {
    userDetail.value = loginUser.value
  } else {
    const targetId = route.params.id as string
    try {
      const res = await getUserVoByIdUsingGet({ id: targetId })
      if (res.data.code === 0 && res.data.data) {
        userDetail.value = res.data.data
      } else {
        message.error('获取用户信息失败')
      }
    } catch (e: any) {
      message.error('获取用户信息失败：' + e.message)
    }
  }
}

// -------- 编辑逻辑 (仅限主人) --------
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
      message.error('头像上传失败')
    }
  } catch (error: any) {
    message.error('头像上传失败：' + error.message)
  }
}

const startEditName = () => {
  if (!isLoginUser.value) return
  editingUserName.value = userDetail.value.userName || ''
  isEditingName.value = true
}

const saveName = async () => {
  if (editingUserName.value !== userDetail.value.userName) {
    try {
      const res = await updateMyUserUsingPost({ id: loginUser.value.id, userName: editingUserName.value })
      if (res.data.code === 0) {
        message.success('昵称更新成功')
        await loginUserStore.fetchLoginUser()
      } else {
        message.error('更新失败：' + res.data.message)
      }
    } catch (e: any) {
      message.error('更新失败：' + e.message)
    }
  }
  isEditingName.value = false
}

const startEditProfile = () => {
  if (!isLoginUser.value) return
  editingUserProfile.value = userDetail.value.userProfile || ''
  isEditingProfile.value = true
}

const saveProfile = async () => {
  if (editingUserProfile.value !== userDetail.value.userProfile) {
    try {
      const res = await updateMyUserUsingPost({ id: loginUser.value.id, userProfile: editingUserProfile.value })
      if (res.data.code === 0) {
        message.success('简介更新成功')
        await loginUserStore.fetchLoginUser()
      } else {
        message.error('更新失败：' + res.data.message)
      }
    } catch (e: any) {
      message.error('更新失败：' + e.message)
    }
  }
  isEditingProfile.value = false
}

const copyId = async () => {
  if (!userDetail.value.id) return
  try {
    await navigator.clipboard.writeText(String(userDetail.value.id))
    message.success('已复制用户 ID')
  } catch (e) {
    message.error('复制失败，请手动复制')
  }
}

// -------- 帖子列表逻辑 (双模态核心) --------
const activeKey = ref('post')
const postList = ref<API.PostVO[]>([])
const favourPostList = ref<API.PostVO[]>([])
const thumbPostList = ref<API.PostVO[]>([])
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    if (activeKey.value === 'post') {
      if (isLoginUser.value) {
        const res = await listMyPostVOByPage({
          current: 1,
          pageSize: 10,
          sortField: 'createTime',
          sortOrder: 'descend',
        })
        if (res.data.code === 0) {
          postList.value = res.data.data?.records || []
        }
      } else {
        const res = await listPostVoByPageUsingPost({
          current: 1,
          pageSize: 10,
          userId: userDetail.value.id || route.params.id,
          sortField: 'createTime',
          sortOrder: 'descend',
        })
        if (res.data.code === 0) {
          postList.value = res.data.data?.records || []
        }
      }
    }
    else if (activeKey.value === 'favour' && isLoginUser.value) {
      const res = await listMyFavourPostByPage({ current: 1, pageSize: 10 })
      if (res.data.code === 0) favourPostList.value = res.data.data?.records || []
    }
    else if (activeKey.value === 'thumb' && isLoginUser.value) {
      const res = await listMyThumbPostByPage({ current: 1, pageSize: 10 })
      if (res.data.code === 0) thumbPostList.value = res.data.data?.records || []
    }
  } catch (e: any) {
    message.error('加载失败：' + e.message)
  } finally {
    loading.value = false
  }
}

const doDelete = async (item: API.PostVO) => {
  if (!item.id) return
  const res = await deletePost({ id: item.id })
  if (res.data.code === 0) {
    message.success('删除成功')
    loadData()
  } else {
    message.error('删除失败')
  }
}

const parseTags = (tags: any) => {
  if (!tags) return []
  if (typeof tags === 'string') {
    try {
      return JSON.parse(tags)
    } catch (e) {
      return []
    }
  }
  return tags
}

const onTabChange = () => {
  loadData()
}

// ==============================================================================
// 🌟 核心修复区：双哨兵机制 (The Double Sentinel)
// 将这部分放在所有函数定义的下面，确保 loadData 和 loadUserInfo 已经被定义，
// 彻底解决“函数未定义”和“时序错位”的问题。
// ==============================================================================

/**
 * 统一数据加载入口
 * 无论是路由变了，还是Store变了，都走这里
 */
const initData = () => {
  // 1. 如果是“看自己”
  if (isLoginUser.value) {
    // 同步个人信息
    userDetail.value = loginUser.value;
    // 加载帖子
    loadData();
  }
  // 2. 如果是“看别人” (且路由里有ID)
  else if (route.params.id) {
    // 加载访客视角的个人信息
    loadUserInfo();
    // 加载帖子
    loadData();
  }
}

// 监听器 1：路由哨兵 (immediate: true 保证进页面就执行)
watch(
  () => route.params.id,
  () => {
    initData();
  },
  { immediate: true }
);

// 监听器 2：仓库哨兵 (deep: true 保证 Store 数据回来时触发)
watch(
  () => loginUser.value,
  () => {
    // 只有在“看自己”的情况下，仓库变动才需要刷新页面
    if (isLoginUser.value) {
      initData();
    }
  },
  { deep: true }
);

onMounted(() => {
  // 逻辑已由 initData 接管，此处留空
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
  color: #1890ff;
}

.username {
  font-size: 20px;
  font-weight: bold;
  max-width: 10em;
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
