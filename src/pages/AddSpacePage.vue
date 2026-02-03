<template>
  <div id="addSpacePage">
    <h2 style="margin-bottom: 16px">
      {{ route.query?.id ? '修改' : '创建' }} {{ SPACE_TYPE_MAP[spaceType] }}
    </h2>
    <a-form name="spaceForm" layout="vertical" :model="spaceForm" @finish="handleSubmit">
      <a-form-item name="spaceName" label="空间名称">
        <a-input v-model:value="spaceForm.spaceName" placeholder="请输入空间" allow-clear />
      </a-form-item>
      <a-form-item name="spaceLevel" label="空间级别">
        <a-select
          v-model:value="spaceForm.spaceLevel"
          style="min-width: 180px"
          placeholder="请选择空间级别"
          :options="SPACE_LEVEL_OPTIONS"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" :loading="loading" style="width: 100%">
          提交
        </a-button>
      </a-form-item>
    </a-form>
    <a-card title="空间级别介绍" class="space-level-intro-card">
      <a-typography-paragraph>
        * 目前仅支持开通普通版，如需升级空间，请联系
        <a
          href="https://github.com/catteacher0515"
          target="_blank"
          class="author-link"
        >
          程序员花萍雨
        </a>
      </a-typography-paragraph>
      <a-typography-paragraph v-for="spaceLevel in spaceLevelList" :key="spaceLevel.value">
        {{ spaceLevel.text }}：大小 {{ formatSize(spaceLevel.maxSize) }}，数量
        {{ spaceLevel.maxCount }}
      </a-typography-paragraph>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  addSpaceUsingPost,
  getSpaceVoByIdUsingGet,
  listSpaceLevelUsingGet,
  updateSpaceUsingPost,
} from '@/api/spaceController.ts'
import { useRoute, useRouter } from 'vue-router'
import { SPACE_LEVEL_OPTIONS, SPACE_TYPE_ENUM, SPACE_TYPE_MAP } from '@/constants/space.ts'
import { formatSize } from '../utils'

const space = ref<API.SpaceVO>()
const spaceForm = reactive<API.SpaceAddRequest | API.SpaceEditRequest>({})
const loading = ref(false)

const route = useRoute()
// 空间类别，默认为私有空间
const spaceType = computed(() => {
  if (route.query?.type) {
    return Number(route.query.type)
  } else {
    return SPACE_TYPE_ENUM.PRIVATE
  }
})

const spaceLevelList = ref<API.SpaceLevel[]>([])

// 获取空间级别
const fetchSpaceLevelList = async () => {
  const res = await listSpaceLevelUsingGet()
  if (res.data.code === 0 && res.data.data) {
    spaceLevelList.value = res.data.data
  } else {
    message.error('获取空间级别失败，' + res.data.message)
  }
}

onMounted(() => {
  fetchSpaceLevelList()
})

const router = useRouter()

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  const spaceId = space.value?.id
  loading.value = true
  let res
  if (spaceId) {
    // 更新
    res = await updateSpaceUsingPost({
      id: spaceId,
      ...spaceForm,
    })
  } else {
    // 创建
    res = await addSpaceUsingPost({
      ...spaceForm,
      spaceType: spaceType.value,
    })
  }
  // 操作成功
  if (res.data.code === 0 && res.data.data) {
    message.success('操作成功')
    // 跳转到空间详情页
    router.push({
      path: `/space/${res.data.data}`,
    })
  } else {
    message.error('操作失败，' + res.data.message)
  }
  loading.value = false
}

// 获取老数据
const getOldSpace = async () => {
  // 获取到 id
  const id = route.query?.id
  if (id) {
    const res = await getSpaceVoByIdUsingGet({
      id,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      space.value = data
      // 填充表单
      spaceForm.spaceName = data.spaceName
      spaceForm.spaceLevel = data.spaceLevel
    }
  }
}

onMounted(() => {
  getOldSpace()
})
</script>

<style scoped>
#addSpacePage {
  max-width: 720px;
  margin: 0 auto;
}

/* 作者链接高亮 */
.author-link {
  font-weight: bold;
  color: #1890ff;
  text-decoration: underline;
  transition: all 0.3s;
}

.author-link:hover {
  color: #40a9ff;
}

/* 增强手绘感卡片风格，保持 UI 统一 */
.space-level-intro-card {
  margin-top: 16px;
  border: 2px solid #2c3e50;
  border-radius: 8px;
  box-shadow: 4px 4px 0px 0px #2c3e50;
}
</style>
