<template>
  <div id="userRegisterPage">
    <div class="login-paper">
      <h2 class="title">TraceHub 迹录</h2>
      <div class="desc">用户注册 - 开启你的 "迹录" 之旅吧</div>

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

        <a-form-item
          name="checkPassword"
          :rules="[
            { required: true, message: '请输入确认密码' },
            { min: 8, message: '确认密码长度不能小于 8 位' },
          ]"
        >
          <a-input-password v-model:value="formState.checkPassword" placeholder="请输入确认密码" size="large" />
        </a-form-item>

        <div class="tips">
          已有账号？
          <RouterLink to="/user/login" style="font-weight: bold; text-decoration: underline;">去登录</RouterLink>
        </div>

        <a-form-item>
          <a-button type="primary" html-type="submit" style="width: 100%" size="large">
            注册
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { userRegisterUsingPost } from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import router from '@/router'

// 用于接受表单输入的值
const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  // 校验两次输入的密码是否一致
  if (values.userPassword !== values.checkPassword) {
    message.error('两次输入的密码不一致')
    return
  }
  const res = await userRegisterUsingPost(values)
  // 注册成功，跳转到登录页面
  if (res.data.code === 0 && res.data.data) {
    message.success('注册成功')
    router.push({
      path: '/user/login',
      replace: true,
    })
  } else {
    message.error('注册失败，' + res.data.message)
  }
}
</script>

<style scoped>
/* 复用登录页的容器样式，只改ID选择器 */
#userRegisterPage {
  min-height: 100vh;
  display: flex;
  /* 水平居中 */
  justify-content: center;
  /* 垂直方向靠上 */
  align-items: flex-start;
  /* 距离顶部 15vh，保持视觉重心偏上 */
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
  transform: rotate(1deg); /* 登录页是 -1deg，这里改成 1deg 增加一点活泼感，也可以改回 -1deg */
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
