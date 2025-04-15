import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: '/login', component: () => import('pages/LoginPage.vue') },
      {
        path: '/admin',
        redirect: '/admin/knowledge',
        children: [
          {
            path: 'knowledge',
            component: () => import('pages/KnowledgeBasePage.vue'),
            meta: { requiresAuth: true },
          },
          {
            path: 'llm-settings',
            component: () => import('pages/LLMSettingsPage.vue'),
            meta: { requiresAuth: true },
          },
          {
            path: 'analytics',
            component: () => import('pages/AnalyticsPage.vue'),
            meta: { requiresAuth: true },
          },
        ],
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
