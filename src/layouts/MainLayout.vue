<template>
  <q-layout view="hHh LpR lFf">
    <q-header elevated class="bg-gradient text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="q-mr-sm"
        />

        <q-toolbar-title class="row items-center no-wrap">
          <q-icon name="local_hospital" size="28px" class="q-mr-sm" />
          <span class="text-weight-bold">醫院智能助手管理系統</span>
          <q-badge color="secondary" text-color="white" class="q-ml-sm">管理版</q-badge>
        </q-toolbar-title>

        <q-space />

        <q-btn round flat icon="notifications">
          <q-badge color="red" floating>2</q-badge>
          <q-tooltip>通知</q-tooltip>
        </q-btn>

        <q-btn-dropdown flat class="q-ml-sm admin-profile">
          <template v-slot:label>
            <div class="row items-center no-wrap">
              <q-avatar size="28px">
                <img src="https://cdn.quasar.dev/img/avatar.png" />
              </q-avatar>
              <div class="q-ml-sm text-weight-bold">管理員</div>
            </div>
          </template>

          <q-list>
            <q-item clickable>
              <q-item-section avatar>
                <q-icon name="account_circle" />
              </q-item-section>
              <q-item-section>個人資料</q-item-section>
            </q-item>

            <q-item clickable>
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
              <q-item-section>設定</q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable v-close-popup @click="logout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>登出</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="sidebar-gradient"
      :width="250"
    >
      <q-scroll-area class="fit">
        <div class="drawer-header q-py-md q-px-lg flex">
          <q-avatar size="40px" class="q-mr-md">
            <img src="https://cdn.quasar.dev/img/mountains.jpg" />
          </q-avatar>
          <div>
            <div class="text-weight-bold text-black">醫院AI助手</div>
            <div class="text-blue-4 text-caption">智能醫療服務</div>
          </div>
        </div>

        <q-separator dark />
        <q-list padding>
          <q-item-label header class="text-indigo-9 q-pb-xs">
            <div class="row items-center">
              <q-icon name="apps" size="14px" class="q-mr-sm text-indigo-9" />
              管理功能
            </div>
          </q-item-label>

          <EssentialLink v-for="link in essentialLinks" :key="link.title" v-bind="link" />

          <q-separator dark spaced />

          <q-item-label header class="text-grey-1 q-pb-xs text-grey-9">
            <div class="row items-center">
              <q-icon name="more_horiz" size="14px" class="q-mr-sm text-grey-9" />
              更多功能
            </div>
          </q-item-label>

          <EssentialLink title="使用指南" icon="help" link="/admin/guide" />

          <EssentialLink title="系統狀態" icon="monitor_heart" link="/admin/status" />
        </q-list>

        <div class="absolute-bottom q-pa-md">
          <q-card flat bordered class="system-status">
            <q-item>
              <q-item-section avatar>
                <q-icon name="memory" color="green" />
              </q-item-section>
              <q-item-section>
                <q-item-label>系統運行正常</q-item-label>
                <q-item-label caption>上次更新：今天 10:25</q-item-label>
              </q-item-section>
            </q-item>
          </q-card>
        </div>
      </q-scroll-area>
    </q-drawer>
    <q-footer bordered class="bg-white text-grey-8">
      <q-toolbar>
        <q-toolbar-title class="text-caption">
          © 2025 醫院智能助手管理系統 - 版本 v1.0.0
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
    <q-page-container>
      <div class="q-pa-md">
        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
        >
          <router-view />
        </transition>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import EssentialLink from 'components/EssentialLink.vue';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const leftDrawerOpen = ref(false);

interface EssentialLinkProps {
  title: string;
  caption?: string;
  link: string;
  icon: string;
  active?: boolean;
}

const essentialLinks = ref<EssentialLinkProps[]>([
  {
    title: '知識庫管理',
    caption: '瀏覽、編輯、新增知識',
    icon: 'school',
    link: '/admin/knowledge',
  },
  {
    title: 'LLM 設定',
    caption: '配置系統提示詞',
    icon: 'tune',
    link: '/admin/llm-settings',
  },
  {
    title: '統計報表',
    caption: '查看使用數據與分析',
    icon: 'analytics',
    link: '/admin/analytics',
  },
]);

// 根據當前路由更新活躍菜單
const updateActiveLink = () => {
  essentialLinks.value.forEach((link) => {
    link.active = route.path.includes(link.link);
  });
};

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const logout = async () => {
  // TODO: 實際登出邏輯
  localStorage.removeItem('auth_token');
  await router.push('/login');
};

onMounted(async () => {
  // 檢查是否已登入
  const token = localStorage.getItem('auth_token');
  if (!token) {
    await router.push('/login');
    return;
  }

  updateActiveLink();

  // 監聽路由變化
  router.afterEach(() => {
    updateActiveLink();
  });

  // 初始化設定
  $q.dark.set(false);
});
</script>

<style lang="scss">
.bg-gradient {
  background: linear-gradient(135deg, #3f51b5 0%, #2196f3 100%);
}

.sidebar-gradient {
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
}

.drawer-header {
  background-color: rgba(0, 0, 0, 0.1);
}

.system-status {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
}

.admin-profile {
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

// 添加一些全局動畫
.animated {
  animation-duration: 0.5s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }

  to {
    opacity: 0;
    transform: translateY(10px);
  }
}
</style>
