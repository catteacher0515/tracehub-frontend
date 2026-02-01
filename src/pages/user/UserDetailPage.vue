<template>
  <div id="userDetailPage">
    <a-card>
      <a-space align="center" :size="24">
        <a-avatar :size="64" :src="loginUser.userAvatar" />
        <div>
          <div class="username">{{ loginUser.userName || '无名' }}</div>
          <div class="user-profile">{{ loginUser.userProfile || '暂无简介' }}</div>
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
                          <span>
                            {{ formatDate(item.createTime) }}
                          </span>
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
                            @confirm="doDelete(item)"
                          >
                            <a-button type="link" danger style="padding: 0">删除</a-button>
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
                          <span>
                            <UserOutlined />
                            {{ item.user?.userName || '无名' }}
                          </span>
                          <span>
                            {{ formatDate(item.createTime) }}
                          </span>
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
                          <span>
                            <UserOutlined />
                            {{ item.user?.userName || '无名' }}
                          </span>
                          <span>
                            {{ formatDate(item.createTime) }}
                          </span>
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
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { listMyFavourPostByPage } from '@/api/postFavourController'
import { listMyThumbPostByPage } from '@/api/postThumbController'
import { listMyPostVOByPage, deletePost } from '@/api/postController'
import { message } from 'ant-design-vue'
import { formatDate, getTagColor } from '@/utils'
import { LikeFilled, LikeOutlined, StarFilled, StarOutlined, UserOutlined } from '@ant-design/icons-vue'

const loginUserStore = useLoginUserStore()
const loginUser = computed(() => loginUserStore.loginUser)
const router = useRouter()

const activeKey = ref('post')
const myPostList = ref<API.PostVO[]>([])
const favourPostList = ref<API.PostVO[]>([])
const thumbPostList = ref<API.PostVO[]>([])
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    if (activeKey.value === 'post') {
      const res = await listMyPostVOByPage({
        current: 1,
        pageSize: 10,
        sortField: 'createTime',
        sortOrder: 'descend',
      })
      if (res.data.code === 0) {
        myPostList.value = res.data.data.records || []
      } else {
        message.error('加载我的帖子失败：' + res.data.message)
      }
    } else if (activeKey.value === 'favour') {
      const res = await listMyFavourPostByPage({
        current: 1,
        pageSize: 10,
        sortField: 'createTime',
        sortOrder: 'descend',
      })
      if (res.data.code === 0) {
        favourPostList.value = res.data.data.records || []
      } else {
        message.error('加载收藏失败：' + res.data.message)
      }
    } else {
      const res = await listMyThumbPostByPage({
        current: 1,
        pageSize: 10,
        sortField: 'createTime',
        sortOrder: 'descend',
      })
      if (res.data.code === 0) {
        thumbPostList.value = res.data.data.records || []
      } else {
        message.error('加载点赞失败：' + res.data.message)
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
  const res = await deletePost({
    id: item.id,
  })
  if (res.data.code === 0) {
    message.success('删除成功')
    loadData()
  } else {
    message.error('删除失败：' + res.data.message)
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

onMounted(() => {
  if (!loginUser.value.id) {
    message.warning('请先登录')
    router.push('/user/login')
    return
  }
  loadData()
})
</script>

<style scoped>
.username {
  font-size: 20px;
  font-weight: bold;
}
.user-profile {
  color: #666;
  margin-top: 4px;
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
}

.delete-icon {
  color: #ff4d4f;
}

.delete-icon:hover {
  color: #cf1322;
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
