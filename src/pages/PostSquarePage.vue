<template>
  <div id="postSquarePage">
    <!-- 搜索栏 -->
    <div style="margin-bottom: 24px">
      <a-input-search
        v-model:value="searchParams.searchText"
        placeholder="搜索帖子..."
        enter-button
        size="large"
        @search="onSearch"
      />
    </div>

    <!-- 帖子列表 -->
    <a-list
      item-layout="vertical"
      size="large"
      :pagination="pagination"
      :data-source="postList"
      :loading="loading"
    >
      <template #renderItem="{ item }">
        <div class="post-card-container">
          <a-card hoverable class="post-card">
            <div class="post-card-body">
              <div class="post-content-left">
                <div class="post-title">{{ item.title }}</div>
                <div class="post-tags">
                  <a-space :size="[0, 8]" wrap>
                    <a-tag
                      v-for="tag in item.tagList"
                      :key="tag"
                      :color="getTagColor(tag)"
                      class="post-tag"
                      @click.stop="searchByTag(tag)"
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
                    <span @click.stop="doThumb(item)" class="action-icon">
                      <LikeTwoTone v-if="item.hasThumb" two-tone-color="#eb2f96" />
                      <LikeOutlined v-else />
                      {{ item.thumbNum }}
                    </span>
                    <span @click.stop="doFavour(item)" class="action-icon">
                      <StarTwoTone v-if="item.hasFavour" two-tone-color="#eb2f96" />
                      <StarOutlined v-else />
                      {{ item.favourNum }}
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  LikeOutlined,
  LikeTwoTone,
  StarOutlined,
  StarTwoTone,
  UserOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { listPostVOByPageUsingPost } from '@/api/postController'
import { doPostThumb } from '@/api/postThumbController'
import { doPostFavour } from '@/api/postFavourController'
import { formatDate, getTagColor } from '@/utils'

const postList = ref<API.PostVO[]>([])
const loading = ref(false)
const total = ref(0)

const searchParams = reactive<API.PostQueryRequest>({
  current: 1,
  pageSize: 10,
  searchText: '',
  sortField: 'createTime',
  sortOrder: 'descend',
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  onChange: (page: number, pageSize: number) => {
    searchParams.current = page
    searchParams.pageSize = pageSize
    loadData()
  },
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await listPostVOByPageUsingPost(searchParams)
    if (res.data.code === 0) {
      postList.value = res.data.data.records || []
      total.value = res.data.data.total || 0
      pagination.total = total.value
      pagination.current = searchParams.current || 1
    } else {
      message.error('加载帖子列表失败：' + res.data.message)
    }
  } catch (e: any) {
    message.error('加载失败：' + e.message)
  } finally {
    loading.value = false
  }
}

const onSearch = (value: string) => {
  searchParams.searchText = value
  searchParams.current = 1
  loadData()
}

const searchByTag = (tag: string) => {
  searchParams.searchText = tag
  searchParams.current = 1
  loadData()
}

const doThumb = async (item: API.PostVO) => {
  try {
    const res = await doPostThumb({ postId: item.id as any })
    if (res.data.code === 0) {
      const result = res.data.data
      // result: 1-点赞, -1-取消点赞
      const newHasThumb = result === 1
      item.hasThumb = newHasThumb
      item.thumbNum = newHasThumb ? (item.thumbNum || 0) + 1 : (item.thumbNum || 0) - 1
    } else {
      message.error('点赞失败：' + res.data.message)
    }
  } catch (e: any) {
    message.error('操作失败：' + e.message)
  }
}

const doFavour = async (item: API.PostVO) => {
  try {
    const res = await doPostFavour({ postId: item.id as any })
    if (res.data.code === 0) {
      const result = res.data.data
      // result: 1-收藏, -1-取消收藏
      const newHasFavour = result === 1
      item.hasFavour = newHasFavour
      item.favourNum = newHasFavour ? (item.favourNum || 0) + 1 : (item.favourNum || 0) - 1
    } else {
      message.error('收藏失败：' + res.data.message)
    }
  } catch (e: any) {
    message.error('操作失败：' + e.message)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
#postSquarePage {
  padding: 24px;
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
  min-width: 0; /* 防止内容撑开 */
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

.post-tag {
  cursor: pointer;
}

.post-desc {
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 12px;
  line-height: 1.5715;
  /* 多行省略 */
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

.action-icon:hover {
  color: #1890ff;
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
