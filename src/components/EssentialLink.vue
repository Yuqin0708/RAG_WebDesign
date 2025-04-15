<template>
  <q-item clickable tag="a" :to="link" :active="active" active-class="menu-active" class="q-my-sm menu-item">
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption v-if="caption">{{ caption }}</q-item-label>
    </q-item-section>

    <q-item-section side v-if="active">
      <q-icon name="chevron_right" color="white" size="16px" />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  title: string
  caption?: string
  link: string
  icon?: string
  active?: boolean
}>()

const route = useRoute()

// 如果沒有提供active屬性，則根據當前路由自動判斷
const active = computed(() => {
  if (props.active !== undefined) return props.active
  return route.path.includes(props.link)
})
</script>

<style lang="scss" scoped>
.menu-item {
  border-radius: 8px;
  margin-left: 8px;
  margin-right: 8px;
  color: #000000;
  font-weight: 500;
  transition: color 0.3s, background-color 0.3s;


  &:hover {
    color: rgb(0, 0, 0);
    background: rgba(255, 255, 255, 0.15);
  }

  .q-icon {
    transition: transform 0.3s;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  }

  &:hover .q-icon {
    transform: scale(1.1);
  }

  // 確保caption文字也有足夠的對比度
  :deep(.q-item__label--caption) {
    color: rgba(87, 87, 87, 0.9);
  }
}

.menu-active {
  color: rgb(8, 8, 8);
  background: rgba(255, 255, 255, 0.2);
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #64b5f6;
    border-radius: 0 2px 2px 0;
  }
}
</style>
