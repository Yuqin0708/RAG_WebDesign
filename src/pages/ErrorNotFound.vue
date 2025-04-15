<template>
  <div class="fullscreen bg-blue-1 text-blue-10 flex flex-center">
    <div class="text-center">
      <div style="font-size: 8rem">
        <q-icon name="sentiment_dissatisfied" size="4rem" color="blue-5" />
        404
      </div>

      <div class="text-h2 q-mb-xl" style="opacity:0.7">
        頁面未找到
      </div>

      <q-btn color="primary" icon="home" label="返回首頁" no-caps to="/admin/knowledge" unelevated size="lg" />
    </div>
  </div>
</template>

<script setup lang="ts">
// 沒有需要的邏輯
</script>
