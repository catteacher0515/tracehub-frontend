<template>
  <div class="picture-list">
    <a-list
      :grid="{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <a-card hoverable @click="doClickPicture(picture)" class="hand-card">
            <template #cover>
              <img
                :alt="picture.name"
                :src="picture.thumbnailUrl ?? picture.url"
                style="height: 180px; object-fit: cover; border-bottom: 2px solid #2c3e50;"
              />
            </template>
            <a-card-meta :title="picture.name">
              <template #description>
                <a-flex wrap="wrap" gap="small">
                  <a-tag color="green" style="border: 2px solid #2c3e50; background: #eaff8f; color: black;">
                    {{ picture.category ?? '默认' }}
                  </a-tag>
                  <a-tag v-for="tag in picture.tags" :key="tag" style="border: 1px dashed #2c3e50; background: transparent;">
                    {{ tag }}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
// 请保留你原文件里的 imports 和 methods，这里只展示关键逻辑
interface Props { dataList?: any[]; loading?: boolean; showOp?: boolean; canEdit?: boolean; canDelete?: boolean; onReload?: () => void }
const props = withDefaults(defineProps<Props>(), { dataList: () => [], loading: false })
const router = useRouter()
const doClickPicture = (picture) => { router.push({ path: `/picture/${picture.id}` }) }
</script>

<style scoped>
/* 模拟随机旋转，让图片像散落在桌面上 */
:deep(.ant-list-item):nth-child(odd) .hand-card { transform: rotate(-1deg); }
:deep(.ant-list-item):nth-child(even) .hand-card { transform: rotate(1deg); }
:deep(.ant-list-item):nth-child(3n) .hand-card { transform: rotate(-2deg); }

/* 悬浮时：摆正、放大、层级提高 */
.hand-card:hover {
  transform: scale(1.05) rotate(0deg) !important;
  z-index: 10;
  border-color: #000 !important;
}
</style>
