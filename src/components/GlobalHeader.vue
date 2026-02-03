<template>
  <div id="globalHeader">
    <a-row :wrap="false">
      <a-col flex="240px">
        <router-link to="/">
          <div class="title-bar">
            <img class="logo" :src="logo" alt="logo" />
            <div class="title">迹录 TraceHub</div>
          </div>
        </router-link>
      </a-col>
      <a-col flex="auto">
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @click="doMenuClick"
          class="hand-menu"
        />
      </a-col>
      <a-col flex="200px">
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            <a-dropdown>
              <a-space :size="8">
                <a-avatar :src="loginUserStore.loginUser.userAvatar" class="hand-avatar" />
                <span class="username">{{ loginUserStore.loginUser.userName ?? '无名' }}</span>
              </a-space>
              <template #overlay>
                <a-menu>
                  <a-menu-item>
                    <router-link to="/user/my"><UserOutlined /> 个人中心</router-link>
                  </a-menu-item>
                  <a-menu-item>
                    <router-link to="/my_space"><UserOutlined /> 我的空间</router-link>
                  </a-menu-item>
                  <a-menu-item @click="doLogout">
                    <LogoutOutlined /> 退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div v-else>
            <a-button type="primary" href="/user/login">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { computed, h, ref } from 'vue'
import { HomeOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons-vue'
import { type MenuProps, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { userLogoutUsingPost } from '@/api/userController.ts'
import logo from '@/assets/tracehub-logo.png'

const loginUserStore = useLoginUserStore()

const originItems = [
  { key: '/', icon: () => h(HomeOutlined), label: '主页', title: '主页' },
  { key: '/add_picture', label: '创建', title: '创建图片' },
  { key: '/admin/userManage', label: '用户', title: '用户管理' },
  { key: '/admin/pictureManage', label: '图片', title: '图片管理' },
  { key: '/admin/spaceManage', label: '空间', title: '空间管理' },
]

const filterMenus = (menus = [] as MenuProps['items']) => {
  return menus?.filter((menu) => {
    if (menu?.key?.startsWith('/admin')) {
      const loginUser = loginUserStore.loginUser
      if (!loginUser || loginUser.userRole !== 'admin') return false
    }
    return true
  })
}

const items = computed(() => filterMenus(originItems))
const router = useRouter()
const current = ref<string[]>([])

router.afterEach((to) => {
  current.value = [to.path]
})

const doMenuClick = ({ key }) => {
  router.push({ path: key })
}

const doLogout = async () => {
  const res = await userLogoutUsingPost()
  if (res.data.code === 0) {
    loginUserStore.setLoginUser({ userName: '未登录' })
    message.success('退出')
    await router.push('/user/login')
  } else {
    message.error('退出失败')
  }
}
</script>

<style scoped>
.title-bar {
  display: flex;
  align-items: center;
}

.logo {
  height: 56px;
  margin-right: 12px;
}

.title {
  color: #000;
  font-size: 24px;
  font-weight: bold;
  font-family: 'Patrick Hand', cursive;
}

.hand-avatar {
  border: 2px solid #2c3e50;
  background: #fff;
  flex-shrink: 0;
}

/* 🌟 修改 3：关键的 7 字宽度限制逻辑 */
.username {
  font-weight: bold;
  font-family: 'Patrick Hand', cursive;

  /* 7个中文字符宽度 + 略微冗余量，设置在 7.5em 到 8em 比较稳妥 */
  max-width: 8em;
  display: inline-block;
  vertical-align: middle;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 菜单样式覆盖 */
:deep(.ant-menu-horizontal) {
  border-bottom: none;
}

:deep(.ant-menu-item) {
  border-radius: 20px 5px 20px 5px !important;
  margin: 0 4px !important;
  border: 2px solid transparent;
}

:deep(.ant-menu-item-selected) {
  background-color: #ffcc00 !important;
  color: #000 !important;
  border: 2px solid #000 !important;
  transform: rotate(-2deg);
  font-weight: bold;
}

:deep(.ant-menu-item::after) {
  border-bottom: none !important;
}

/* 保证状态栏内容靠右对齐，避免名字短的时候头像离菜单太远 */
.user-login-status {
  display: flex;
  justify-content: flex-end;
}
</style>
