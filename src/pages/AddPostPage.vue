<template>
  <div id="addPostPage">
    <div style="margin-bottom: 16px; font-size: 24px; font-weight: bold; text-align: center">
      创作中心
    </div>
    <a-card style="max-width: 800px; margin: 0 auto">
      <a-form :model="formState" layout="vertical" @finish="onFinish">
        <a-form-item
          name="title"
          label="标题"
          :rules="[{ required: true, message: '请输入标题' }]"
        >
          <a-input
            v-model:value="formState.title"
            placeholder="请输入标题（50字以内）"
            :maxlength="50"
            show-count
          />
        </a-form-item>

        <a-form-item
          name="content"
          label="内容"
          :rules="[{ required: true, message: '请输入内容' }]"
        >
          <a-textarea
            v-model:value="formState.content"
            placeholder="请输入内容"
            :rows="6"
            show-count
            :maxlength="1000"
          />
        </a-form-item>

        <a-form-item name="postImg" label="封面图">
          <!-- 复用图片上传组件，这里假设 PictureUpload 可以返回 url 或者 picture 对象 -->
          <!-- 实际上 PictureUpload 需要 spaceId，这里暂时传 null 或者默认值，
               或者我们可以使用 UrlPictureUpload 如果只需要 URL -->
          <PictureUpload
            :picture="picture"
            :onSuccess="onUploadSuccess"
          />
          <!-- 如果只是上传得到 URL，可能需要适配一下，这里假设 onSuccess 返回 pictureVO，取出 url 赋值给 postImg -->
        </a-form-item>

        <a-form-item name="tags" label="标签">
          <a-select
            v-model:value="formState.tags"
            mode="tags"
            style="width: 100%"
            placeholder="请输入标签"
            :token-separators="[',']"
          ></a-select>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="loading" style="width: 100%">
            发布
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { addPostUsingPost } from '@/api/postController'
import PictureUpload from '@/components/PictureUpload.vue'

const router = useRouter()
const loading = ref(false)

const formState = reactive<API.PostAddRequest>({
  title: '',
  content: '',
  tags: [],
  postImg: '',
})

const picture = ref<API.PictureVO>()

const onUploadSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  formState.postImg = newPicture.url
}

const onFinish = async (values: any) => {
  loading.value = true
  try {
    const res = await addPostUsingPost({
      ...formState,
    })
    if (res.data.code === 0) {
      message.success('发布成功')
      router.push('/user/my')
    } else {
      message.error('发布失败：' + res.data.message)
    }
  } catch (e: any) {
    message.error('发布失败：' + e.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
#addPostPage {
  padding: 24px;
}
</style>
