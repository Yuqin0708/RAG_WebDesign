<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          醫院智能助手管理系統
        </q-toolbar-title>

        <q-space />

        <q-btn-dropdown flat icon="person">
          <q-list>
            <q-item clickable v-close-popup @click="logout">
              <q-item-section>
                <q-item-label>登出</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list>
        <q-item-label header class="text-grey-8">
          管理選單
        </q-item-label>

        <EssentialLink v-for="link in essentialLinks" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import EssentialLink from 'components/EssentialLink.vue'

const router = useRouter()
const leftDrawerOpen = ref(false)

interface EssentialLinkProps {
  title: string
  caption?: string
  link: string
  icon: string
}

const essentialLinks: EssentialLinkProps[] = [
  {
    title: '知識庫管理',
    caption: '瀏覽、編輯、新增知識',
    icon: 'school',
    link: '/admin/knowledge'
  },
  {
    title: 'LLM 設定',
    caption: '配置系統提示詞',
    icon: 'settings',
    link: '/admin/llm-settings'
  },
  {
    title: '統計報表',
    caption: '查看使用數據與分析',
    icon: 'analytics',
    link: '/admin/analytics'
  }
]

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const logout = async () => {
  // TODO: 實際登出邏輯
  localStorage.removeItem('auth_token')
  await router.push('/login')
}

onMounted(async () => {
  // 檢查是否已登入
  const token = localStorage.getItem('auth_token')
  if (!token) {
    await router.push('/login')
  }
})
</script>
