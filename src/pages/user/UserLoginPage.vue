<template>
  <div id="userLoginPage">
    <div class="login-paper">
      <h2 class="title">TraceHub</h2>
      <div class="desc">记录数据轨迹，连接团队空间</div>

      <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
        <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
          <a-input v-model:value="formState.userAccount" placeholder="请输入账号" size="large" />
        </a-form-item>
        <a-form-item
          name="userPassword"
          :rules="[
            { required: true, message: '请输入密码' },
            { min: 8, message: '密码长度不能小于 8 位' },
          ]"
        >
          <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" size="large" />
        </a-form-item>

        <div class="tips">
          没有账号？
          <RouterLink to="/user/register" style="font-weight: bold; text-decoration: underline;">去注册</RouterLink>
        </div>

        <a-form-item>
          <a-button type="primary" html-type="submit" style="width: 100%" size="large">
            登录
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { userLoginUsingPost } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'
import router from '@/router'

const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})

const loginUserStore = useLoginUserStore()

const handleSubmit = async (values: any) => {
  const res = await userLoginUsingPost(values)
  if (res.data.code === 0 && res.data.data) {
    await loginUserStore.fetchLoginUser()
    message.success('登录成功')
    router.push({
      path: '/',
      replace: true,
    })
  } else {
    message.error('登录失败，' + res.data.message)
  }
}
</script>

<style scoped>
#userLoginPage {
  min-height: 100vh;
  display: flex;
  /* 水平居中 */
  justify-content: center;
  /* 🌟 修改重点：垂直方向不再居中，而是靠上 */
  align-items: flex-start;
  /* 🌟 修改重点：距离顶部 15vh (视窗高度的15%)，这样视觉重心偏上 */
  padding-top: 15vh;

  /* 方格纸背景 */
  background-color: #fdfbf7;
  background-image:
    linear-gradient(#ccc 1px, transparent 1px),
    linear-gradient(90deg, #ccc 1px, transparent 1px);
  background-size: 20px 20px;
}

.login-paper {
  width: 360px;
  padding: 40px;
  background: #fff;

  /* 手绘便签纸核心样式 */
  border: 2px solid #2c3e50;
  /* 不规则圆角 */
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  /* 硬朗阴影 */
  box-shadow: 8px 8px 0px 0px #2c3e50;
  /* 微微倾斜 */
  transform: rotate(-1deg);
}

.title {
  text-align: center;
  font-family: 'Patrick Hand', sans-serif;
  font-size: 34px;
  font-weight: bold;
  margin-bottom: 8px;
}

.desc {
  text-align: center;
  margin-bottom: 24px;
  color: #666;
  font-family: 'Patrick Hand', cursive;
  font-size: 15px;
}

.tips {
  text-align: right;
  margin-bottom: 20px;
  font-family: 'Patrick Hand', cursive;
}
</style>
