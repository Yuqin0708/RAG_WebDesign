<template>
  <q-page padding>
    <div class="row q-mb-md">
      <div class="col-12">
        <h4 class="q-my-none">使用統計分析</h4>
        <p class="text-grey-8">查看AI助手使用情況和效能分析</p>
      </div>
    </div>

    <!-- 日期選擇器 -->
    <div class="row q-mb-md">
      <div class="col-12 col-md-6">
        <q-input outlined v-model="dateRange" label="選擇日期範圍" dense>
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="dateRange" range minimal />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-6 q-mt-sm q-mt-md-none">
        <q-btn color="primary" label="應用" icon="filter_alt" @click="applyFilter" />
        <q-btn flat color="grey-8" label="重置" icon="restart_alt" class="q-ml-sm" @click="resetFilter" />
      </div>
    </div>

    <!-- 數據概覽卡片 -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-3">
        <q-card class="bg-primary text-white">
          <q-card-section>
            <div class="text-h6">總對話次數</div>
            <div class="text-h3 q-mt-sm text-center">{{ stats.totalConversations }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="bg-secondary text-white">
          <q-card-section>
            <div class="text-h6">總用戶數</div>
            <div class="text-h3 q-mt-sm text-center">{{ stats.totalUsers }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="bg-accent text-white">
          <q-card-section>
            <div class="text-h6">平均回應時間</div>
            <div class="text-h3 q-mt-sm text-center">{{ stats.avgResponseTime }}秒</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="bg-positive text-white">
          <q-card-section>
            <div class="text-h6">滿意度</div>
            <div class="text-h3 q-mt-sm text-center">{{ stats.satisfactionRate }}%</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 對話趨勢圖表 -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-h6">對話趨勢</div>
      </q-card-section>
      <q-card-section class="q-pa-none">
        <div id="conversationTrend" style="height: 300px;"></div>
      </q-card-section>
    </q-card>

    <!-- 熱門問題類型 -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">熱門問題類型</div>
          </q-card-section>
          <q-card-section>
            <div class="q-gutter-y-md">
              <div v-for="(item, index) in topQuestions" :key="index" class="q-px-md">
                <div class="row items-center">
                  <div class="col-8">{{ item.question }}</div>
                  <div class="col-4 text-right text-bold">{{ item.count }} 次</div>
                </div>
                <q-linear-progress :value="item.percentage" color="primary" class="q-mt-sm" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 分流結果分佈 -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">科室分流統計</div>
          </q-card-section>
          <q-card-section>
            <div id="departmentDistribution" style="height: 300px;"></div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 詳細數據表格 -->
    <q-card flat bordered class="q-mt-md">
      <q-card-section>
        <div class="text-h6">詳細對話記錄</div>
      </q-card-section>
      <q-card-section class="q-pa-none">
        <q-table :rows="conversations" :columns="columns" row-key="id" :pagination="pagination" :loading="loading">
          <template v-slot:top-right>
            <q-btn color="primary" icon="file_download" label="導出報表" no-caps @click="exportReport" />
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { type QTableColumn, useQuasar } from 'quasar'

const $q = useQuasar()

// 狀態管理
const loading = ref(false)
const dateRange = ref('2025/04/01')

// 表格配置
const columns: Array<QTableColumn> = [
  { name: 'id', align: 'left', label: 'ID', field: 'id', sortable: true },
  { name: 'timestamp', align: 'left', label: '時間', field: 'timestamp', sortable: true },
  { name: 'userId', align: 'left', label: '用戶ID', field: 'userId', sortable: true },
  { name: 'question', align: 'left', label: '問題', field: 'question', sortable: true },
  { name: 'responseTime', align: 'left', label: '回應時間(秒)', field: 'responseTime', sortable: true },
  { name: 'satisfaction', align: 'left', label: '滿意度', field: 'satisfaction', sortable: true, format: val => `${val}/5` }
]

const pagination = ref({
  rowsPerPage: 10
})

// 模擬數據
const conversations = ref([
  { id: '1001', timestamp: '2025-04-01 09:15', userId: 'U12345', question: '如何掛號內科？', responseTime: 1.2, satisfaction: 5 },
  { id: '1002', timestamp: '2025-04-01 10:30', userId: 'U23456', question: '體檢需要空腹嗎？', responseTime: 0.8, satisfaction: 4 },
  { id: '1003', timestamp: '2025-04-02 14:20', userId: 'U34567', question: '心臟檢查需要掛哪個科？', responseTime: 1.5, satisfaction: 4 },
  { id: '1004', timestamp: '2025-04-03 11:05', userId: 'U45678', question: '週末有門診嗎？', responseTime: 0.7, satisfaction: 5 },
  { id: '1005', timestamp: '2025-04-03 16:45', userId: 'U56789', question: '健檢中心在哪裡？', responseTime: 0.9, satisfaction: 3 },
  { id: '1006', timestamp: '2025-04-05 08:30', userId: 'U67890', question: '腸胃不適應該掛哪科？', responseTime: 1.3, satisfaction: 5 },
  { id: '1007', timestamp: '2025-04-05 13:15', userId: 'U78901', question: '高階體檢價格？', responseTime: 1.1, satisfaction: 4 },
  { id: '1008', timestamp: '2025-04-07 10:20', userId: 'U89012', question: '抽血檢查多久出結果？', responseTime: 0.8, satisfaction: 4 },
  { id: '1009', timestamp: '2025-04-08 15:30', userId: 'U90123', question: '頭痛頭暈應該看哪一科？', responseTime: 1.4, satisfaction: 5 },
  { id: '1010', timestamp: '2025-04-09 09:50', userId: 'U01234', question: '血壓偏高怎麼辦？', responseTime: 1.6, satisfaction: 3 }
])

// 統計數據
const stats = ref({
  totalConversations: 876,
  totalUsers: 342,
  avgResponseTime: 1.2,
  satisfactionRate: 92
})

// 熱門問題
const topQuestions = ref([
  { question: '體檢套餐內容與價格', count: 156, percentage: 0.85 },
  { question: '掛號流程與方式', count: 124, percentage: 0.65 },
  { question: '各科門診時間', count: 98, percentage: 0.5 },
  { question: '症狀對應科室查詢', count: 76, percentage: 0.4 },
  { question: '檢查報告查詢方式', count: 52, percentage: 0.3 }
])

// 模擬圖表初始化
const initCharts = () => {
  // 在實際應用中，這裡會使用圖表庫（如 ECharts 或 Chart.js）初始化圖表
  console.log('圖表已初始化')
}

// 過濾
const applyFilter = () => {
  loading.value = true

  // TODO: 根據日期範圍獲取數據
  setTimeout(() => {
    loading.value = false
    $q.notify({
      color: 'info',
      message: `已更新為 ${dateRange.value} 至 ${dateRange.value} 的數據`,
      icon: 'info'
    })
  }, 1000)
}

// 重置過濾
const resetFilter = () => {
  dateRange.value = '2025/04/01'
  applyFilter()
}

// 導出報表
const exportReport = () => {
  $q.notify({
    color: 'positive',
    message: '報表已導出',
    icon: 'check_circle'
  })
}

// 初始化
onMounted(() => {
  loading.value = true

  // 模擬數據加載
  setTimeout(() => {
    loading.value = false
    initCharts()
  }, 1000)
})
</script>

<style scoped>
/* 這裡可添加頁面特定樣式 */
</style>
