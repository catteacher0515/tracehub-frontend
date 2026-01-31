<template>
  <div id="app">
    <a-config-provider :locale="zhCN">
      <BasicLayout />
    </a-config-provider>
  </div>
</template>

<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import BasicLayout from '@/layouts/BasicLayout.vue';

dayjs.locale('zh-cn');
</script>

<style>
/* === 1. 引入手写字体 === */
@import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap');

:root {
  /* === 2. 核心手绘变量 === */
  --hand-bg: #fcfbf7;           /* 米色纸张背景 */
  --hand-line: #2c3e50;         /* 铅笔黑 */
  --hand-primary: #ffcc00;      /* 荧光笔黄 (高亮色) */
  --hand-border: 2px solid var(--hand-line);
  /* 灵魂参数：不规则圆角 */
  --hand-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  --hand-shadow: 4px 4px 0px 0px var(--hand-line);
}

#app {
  /* 优先使用手写体，中文回退到黑体 */
  font-family: 'Patrick Hand', 'PingFang SC', sans-serif;
  background-color: var(--hand-bg);
  /* 纸张噪点纹理 */
  background-image: radial-gradient(#d0d0d0 1px, transparent 0);
  background-size: 20px 20px;
  color: var(--hand-line);
  min-height: 100vh;
}

/* === 3. 覆盖 Ant Design 组件 === */

/* 卡片：手绘边框 + 硬阴影 */
.ant-card {
  border: var(--hand-border) !important;
  border-radius: var(--hand-radius) !important;
  box-shadow: var(--hand-shadow) !important;
  transition: all 0.2s ease-in-out;
}
.ant-card:hover {
  transform: translate(-2px, -2px) rotate(0.5deg); /* 悬浮微动 */
  box-shadow: 6px 6px 0px 0px var(--hand-line) !important;
}

/* 按钮：粗边框 */
.ant-btn {
  border: var(--hand-border) !important;
  border-radius: var(--hand-radius) !important;
  box-shadow: 2px 2px 0px 0px var(--hand-line) !important;
  font-weight: bold;
}
.ant-btn-primary {
  background-color: var(--hand-primary) !important;
  color: #000 !important;
  border-color: #000 !important;
}

/* 输入框：去背景，加边框 */
.ant-input, .ant-input-password, .ant-input-affix-wrapper {
  border: var(--hand-border) !important;
  border-radius: 15px 225px 15px 255px / 255px 15px 225px 15px !important;
  background: transparent !important;
  box-shadow: none !important;
}
.ant-input:focus, .ant-input-affix-wrapper-focused {
  background: #fff !important;
  box-shadow: 2px 2px 0px 0px var(--hand-line) !important;
}
</style>
