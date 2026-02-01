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
          <a-list :data-source="myPostList" :loading="loading" item-layout="horizontal">
            <template #renderItem="{ item }">
              <a-list-item>
                <template #actions>
                  <a-popconfirm
                    title="确认删除该帖子吗？"
                    ok-text="确认"
                    cancel-text="取消"
                    @confirm="doDelete(item)"
                  >
                    <a-button type="text" danger>删除</a-button>
                  </a-popconfirm>
                </template>
                <a-list-item-meta :title="item.title">
                  <template #description>
                    <div style="margin-bottom: 8px">
                      {{ item.content?.length > 50 ? item.content.substring(0, 50) + '...' : item.content }}
                    </div>
                    <a-space>
                      <a-tag v-for="tag in parseTags(item.tags || item.tagList)" :key="tag">
                        {{ tag }}
                      </a-tag>
                    </a-space>
                  </template>
                </a-list-item-meta>
                <div v-if="item.postImg" style="margin-left: 16px">
                  <a-image :src="item.postImg" :width="100" style="border-radius: 4px" />
                </div>
              </a-list-item>
            </template>
          </a-list>
        </a-tab-pane>
        <a-tab-pane key="favour" tab="我的收藏">
          <a-list :data-source="favourPostList" :loading="loading" item-layout="horizontal">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :title="item.title" :description="item.content">
                  <template #description>
                    <div style="margin-bottom: 8px">{{ item.content }}</div>
                    <a-space>
                      <a-tag v-for="tag in parseTags(item.tags || item.tagList)" :key="tag">
                        {{ tag }}
                      </a-tag>
                    </a-space>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-tab-pane>
        <a-tab-pane key="thumb" tab="我的点赞">
          <a-list :data-source="thumbPostList" :loading="loading" item-layout="horizontal">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :title="item.title" :description="item.content">
                  <template #description>
                    <div style="margin-bottom: 8px">{{ item.content }}</div>
                    <a-space>
                      <a-tag v-for="tag in parseTags(item.tags || item.tagList)" :key="tag">
                        {{ tag }}
                      </a-tag>
                    </a-space>
                  </template>
                </a-list-item-meta>
              </a-list-item>
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
</style>
