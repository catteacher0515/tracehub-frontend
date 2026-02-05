<template>
  <div id="postDetailPage">
    <a-row :gutter="[24, 24]">
      <a-col :span="24">
        <a-card class="post-detail-card" :bordered="false">
          <!-- 顶部返回 -->
          <a-page-header
            style="padding: 0; margin-bottom: 24px"
            title="返回广场"
            @back="() => router.push('/post/square')"
          />

          <!-- 加载中 -->
          <a-skeleton active v-if="loading" :paragraph="{ rows: 10 }" />

          <!-- 404 -->
          <a-result v-else-if="!post" status="404" title="帖子已消失" sub-title="抱歉，您访问的帖子不存在或已被删除。">
            <template #extra>
              <a-button type="primary" @click="router.push('/post/square')">回到广场</a-button>
            </template>
          </a-result>

          <!-- 帖子内容 -->
          <div v-else>
            <!-- 标题 -->
            <h1 class="post-title">{{ post.title }}</h1>

            <!-- 作者信息 -->
            <div class="author-info">
              <a-avatar :size="48" :src="post.user?.userAvatar" />
              <div class="author-meta">
                <div class="author-name">{{ post.user?.userName || '无名' }}</div>
                <div class="publish-time">{{ formatDate(post.createTime) }}</div>
              </div>
            </div>

            <!-- 正文 (Markdown) -->
            <div class="markdown-body" v-html="contentHtml"></div>

            <!-- 图片 (如有) -->
            <div v-if="post.postImg" class="post-image-container">
              <a-image :src="post.postImg" width="100%" />
            </div>

            <!-- 标签组 -->
            <div class="post-tags">
              <a-space :size="[0, 8]" wrap>
                <a-tag
                  v-for="tag in post.tagList"
                  :key="tag"
                  :color="getTagColor(tag)"
                  class="post-tag"
                  @click="searchByTag(tag)"
                >
                  {{ tag }}
                </a-tag>
              </a-space>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 底部互动栏 -->
    <div class="bottom-action-bar" v-if="post">
      <div class="action-item" @click="doThumb">
        <LikeTwoTone v-if="post.hasThumb" two-tone-color="#eb2f96" />
        <LikeOutlined v-else />
        <span class="action-count">{{ post.thumbNum < 0 ? 0 : post.thumbNum }}</span>
      </div>
      <div class="action-item" @click="doFavour">
        <StarTwoTone v-if="post.hasFavour" two-tone-color="#eb2f96" />
        <StarOutlined v-else />
        <span class="action-count">{{ post.favourNum < 0 ? 0 : post.favourNum }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { LikeOutlined, LikeTwoTone, StarOutlined, StarTwoTone } from '@ant-design/icons-vue'
import MarkdownIt from 'markdown-it'
import { getPostVOByIdUsingGet } from '@/api/postController'
import { doPostThumbUsingPost } from '@/api/postThumbController'
import { doPostFavourUsingPost } from '@/api/postFavourController'
import { formatDate, getTagColor } from '@/utils'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const post = ref<API.PostVO>()
const md = new MarkdownIt()

// 计算 Markdown 渲染后的 HTML
const contentHtml = computed(() => {
  if (!post.value?.content) return ''
  return md.render(post.value.content)
})

const loadData = async () => {
  const id = route.params.id as string
  if (!id) {
    message.error('参数错误')
    return
  }
  loading.value = true
  try {
    const res = await getPostVOByIdUsingGet({ id })
    if (res.data.code === 0) {
      post.value = res.data.data
    } else {
      message.error('加载帖子失败：' + res.data.message)
    }
  } catch (e: any) {
    message.error('加载失败：' + e.message)
  } finally {
    loading.value = false
  }
}

const searchByTag = (tag: string) => {
  router.push({
    path: '/post/square',
    query: {
      tags: tag,
    },
  })
}

const doThumb = async () => {
  if (!post.value?.id) return
  try {
    const res = await doPostThumbUsingPost({ postId: post.value.id as any })
    if (res.data.code === 0) {
      const result = res.data.data
      const newHasThumb = result === 1
      post.value.hasThumb = newHasThumb
      post.value.thumbNum = newHasThumb
        ? (post.value.thumbNum || 0) + 1
        : (post.value.thumbNum || 0) - 1
    } else {
      message.error('点赞失败：' + res.data.message)
    }
  } catch (e: any) {
    message.error('操作失败：' + e.message)
  }
}

const doFavour = async () => {
  if (!post.value?.id) return
  try {
    const res = await doPostFavourUsingPost({ postId: post.value.id as any })
    if (res.data.code === 0) {
      const result = res.data.data
      const newHasFavour = result === 1
      post.value.hasFavour = newHasFavour
      post.value.favourNum = newHasFavour
        ? (post.value.favourNum || 0) + 1
        : (post.value.favourNum || 0) - 1
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
#postDetailPage {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 80px; /* 留出底部互动栏空间 */
}

.post-title {
  font-size: 28px;
  font-weight: bold;
  color: #1f1f1f;
  margin-bottom: 24px;
}

.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
}

.author-meta {
  margin-left: 12px;
}

.author-name {
  font-size: 16px;
  font-weight: 500;
  color: #1f1f1f;
}

.publish-time {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  margin-top: 2px;
}

.markdown-body {
  font-size: 16px;
  line-height: 1.8;
  color: #1f1f1f;
  margin-bottom: 32px;
}

.post-image-container {
  margin-bottom: 32px;
  border-radius: 8px;
  overflow: hidden;
}

.post-tags {
  margin-bottom: 32px;
}

.post-tag {
  cursor: pointer;
  padding: 4px 12px;
  font-size: 14px;
}

/* 底部互动栏 */
.bottom-action-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 12px 32px;
  border-radius: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.action-item {
  display: flex;
  align-items: center;
  margin: 0 24px;
  cursor: pointer;
  font-size: 20px;
  color: #595959;
  transition: all 0.3s;
}

.action-item:hover {
  color: #1890ff;
  transform: scale(1.1);
}

.action-count {
  font-size: 16px;
  margin-left: 8px;
  font-weight: 500;
}

/* 适配移动端 */
@media screen and (max-width: 768px) {
  #postDetailPage {
    padding: 16px;
    padding-bottom: 80px;
  }

  .bottom-action-bar {
    width: 90%;
    justify-content: space-around;
  }
}
</style>
