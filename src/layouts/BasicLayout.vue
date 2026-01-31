<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh; background: transparent">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout style="background: transparent">
        <GlobalSider class="sider" />
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
      </a-layout>
      <a-layout-footer class="footer">
        <a href="#" target="_blank">
          TraceHub 迹录 · 智能协作空间
        </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalSider from "@/components/GlobalSider.vue";
</script>

<style scoped>
#basicLayout .header {
  padding-inline: 20px;
  background: white;
  color: unset;
  margin-bottom: 1px;
  /* 底部粗黑线 */
  border-bottom: 2px solid #2c3e50;
  height: 64px;
  line-height: 64px;
  z-index: 10;
}

#basicLayout .sider {
  background: #fff;
  /* 右侧粗黑线 */
  border-right: 2px solid #2c3e50;
  padding-top: 20px;
}

#basicLayout :deep(.ant-menu-root) {
  border-bottom: none !important;
  border-inline-end: none !important;
  background: transparent;
}

#basicLayout .content {
  padding: 28px;
  background: transparent; /* 透明，透出 App.vue 的背景 */
  margin-bottom: 28px;
}

#basicLayout .footer {
  background: transparent;
  padding: 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  font-family: 'Patrick Hand', cursive;
  font-size: 16px;
  border-top: 1px dashed #bbb;
}
</style>
