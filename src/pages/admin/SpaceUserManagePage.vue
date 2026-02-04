<template>
  <div id="spaceManagePage">
    <a-flex justify="space-between">
      <h2>空间成员管理</h2>
      <a-space>
        <a-button type="primary" href="/add_space" target="_blank">+ 创建空间</a-button>
        <a-button type="primary" ghost href="/space_analyze?queryPublic=1" target="_blank"
        >分析公共图库
        </a-button>
        <a-button type="primary" ghost href="/space_analyze?queryAll=1" target="_blank"
        >分析全部空间
        </a-button>
      </a-space>
    </a-flex>
    <div style="margin-bottom: 16px" />
    <a-form layout="inline" :model="formData" @finish="handleSubmit">
      <a-form-item label="用户 id" name="userId">
        <a-input v-model:value="formData.userId" placeholder="请输入用户 id" allow-clear />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">添加用户</a-button>
      </a-form-item>
    </a-form>
    <div style="margin-bottom: 16px" />

    <a-table :columns="columns" :data-source="dataList">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userInfo'">
          <a-space>
            <a-avatar :src="record.user?.userAvatar" />
            {{ record.user?.userName }}
            <a-tag v-if="String(record.userId) === String(loginUser.id)" color="green">我</a-tag>
          </a-space>
        </template>

        <template v-if="column.dataIndex === 'spaceRole'">
          <a-select
            v-model:value="record.spaceRole"
            :options="SPACE_ROLE_OPTIONS"
            @change="(value) => editSpaceRole(value, record)"
            :disabled="isSpaceOwner(record.userId) || (String(record.userId) !== String(loginUser.id) && !isAdmin)"
          />
        </template>

        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <template v-else-if="column.key === 'action'">
          <a-space wrap>
            <span v-if="isSpaceOwner(record.userId)" style="color: #999; font-weight: bold">
              创建者
            </span>

            <a-popconfirm
              v-else-if="String(record.userId) === String(loginUser.id)"
              title="确定要退出该团队空间吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="doQuit(record.id)"
            >
              <a-button type="link" danger>退出空间</a-button>
            </a-popconfirm>

            <a-button
              v-else-if="canManage"
              type="link"
              danger
              @click="doDelete(record.id)"
            >删除</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { SPACE_ROLE_OPTIONS } from '../../constants/space.ts'
// 这里的引用现在应该不会报错了，因为你在第一步里补上了 quitTeamSpaceUsingPost
import {
  addSpaceUserUsingPost,
  deleteSpaceUserUsingPost,
  editSpaceUserUsingPost,
  listSpaceUserUsingPost,
  quitTeamSpaceUsingPost,
} from '@/api/spaceUserController.ts'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import dayjs from 'dayjs'

interface Props {
  id: string
}

const props = defineProps<Props>()
const loginUserStore = useLoginUserStore()
const loginUser = loginUserStore.loginUser

const columns = [
  { title: '用户', dataIndex: 'userInfo' },
  { title: '角色', dataIndex: 'spaceRole' },
  { title: '创建时间', dataIndex: 'createTime' },
  { title: '操作', key: 'action' },
]

const dataList = ref<API.SpaceUserVO[]>([])
const space = ref<API.SpaceVO>()

// 计算属性
const canManage = computed(() => {
  if (!loginUser.id || !space.value) return false
  if (isSpaceOwner(loginUser.id)) return true
  const me = dataList.value.find(u => String(u.userId) === String(loginUser.id))
  return me?.spaceRole === 'admin'
})

const isAdmin = computed(() => {
  const me = dataList.value.find(u => String(u.userId) === String(loginUser.id))
  return me?.spaceRole === 'admin' || isSpaceOwner(loginUser.id)
})

const fetchData = async () => {
  const spaceId = props.id
  if (!spaceId) return
  const res = await listSpaceUserUsingPost({ spaceId })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data ?? []
  } else {
    message.error('获取成员列表失败，' + res.data.message)
  }
}

const fetchSpace = async () => {
  const spaceId = props.id
  if (!spaceId) return
  const res = await getSpaceVoByIdUsingGet({ id: spaceId })
  if (res.data.code === 0 && res.data.data) {
    space.value = res.data.data
  }
}

// 修复类型报错：给参数加上类型注解
const isSpaceOwner = (userId: number | string | undefined) => {
  if (!space.value?.userId || !userId) return false
  return String(space.value.userId) === String(userId)
}

onMounted(() => {
  fetchData()
  fetchSpace()
})

const formData = reactive<API.SpaceUserAddRequest>({})

const handleSubmit = async () => {
  const spaceId = props.id
  if (!spaceId) return
  const res = await addSpaceUserUsingPost({
    spaceId,
    ...formData,
  })
  if (res.data.code === 0) {
    message.success('添加成功')
    fetchData()
  } else {
    message.error('添加失败，' + res.data.message)
  }
}

// 修复类型报错：value 是 string, record 是对象
const editSpaceRole = async (value: string, record: API.SpaceUserVO) => {
  const res = await editSpaceUserUsingPost({
    id: record.id,
    spaceRole: value,
  })
  if (res.data.code === 0) {
    message.success('修改成功')
  } else {
    message.error('修改失败，' + res.data.message)
    fetchData()
  }
}

// 修复类型报错：id 可能为 undefined，虽然业务上不可能，但 TS 会警告
const doDelete = async (id?: number) => {
  if (!id) return
  const res = await deleteSpaceUserUsingPost({ id })
  if (res.data.code === 0) {
    message.success('移除成功')
    fetchData()
  } else {
    message.error('移除失败')
  }
}

// 修复类型报错
const doQuit = async (id?: number) => {
  if (!id) return
  const res = await quitTeamSpaceUsingPost({ id })
  if (res.data.code === 0) {
    message.success('退出成功')
    window.location.href = '/my_space'
  } else {
    message.error('退出失败，' + res.data.message)
  }
}
</script>
