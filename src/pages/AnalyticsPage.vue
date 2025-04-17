<template>
  <q-page padding>
    <!-- 頁面標題區域 -->
    <div class="page-header q-mb-lg">
      <div class="row items-center">
        <q-icon name="analytics" size="36px" color="orange" class="q-mr-md" />
        <div class="flex-center ">
          <h4 class="q-my-none text-weight-bold">使用統計分析</h4>
          <p class="text-grey-8 q-my-xs">查看AI助手使用情況和效能分析</p>
        </div>
      </div>
    </div>

    <!-- 日期選擇器 -->
    <q-card flat bordered class="filter-card q-mb-lg">
      <q-card-section>
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input outlined v-model="dateRange" label="選擇日期範圍" class="date-input">
              <template v-slot:prepend>
                <q-icon name="event" color="primary" />
              </template>
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="dateRange" range minimal class="calendar-popup" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <div class="row q-col-gutter-sm">
              <div class="col-2 q-mr-sm">
                <q-btn color="primary" label="應用篩選" icon="filter_alt" class="full-width filter-btn"
                  @click="applyFilter" />
              </div>
              <div class="col-auto">
                <q-btn outline color="grey-7" icon="restart_alt" class="reset-btn" @click="resetFilter">
                  <q-tooltip>重置篩選條件</q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 數據概覽卡片 -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card stat-conversations">
          <q-card-section>
            <div class="row no-wrap items-center">
              <div class="stat-icon-container">
                <q-icon name="question_answer" size="40px" />
              </div>
              <div class="q-ml-sm">
                <div class="text-subtitle1 text-weight-medium">總對話次數</div>
                <div class="text-h4 text-weight-bold q-mt-xs">{{ stats.totalConversations }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card stat-users">
          <q-card-section>
            <div class="row no-wrap items-center">
              <div class="stat-icon-container">
                <q-icon name="people" size="40px" />
              </div>
              <div class="q-ml-sm">
                <div class="text-subtitle1 text-weight-medium">總用戶數</div>
                <div class="text-h4 text-weight-bold q-mt-xs">{{ stats.totalUsers }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card stat-response-time">
          <q-card-section>
            <div class="row no-wrap items-center">
              <div class="stat-icon-container">
                <q-icon name="speed" size="40px" />
              </div>
              <div class="q-ml-sm">
                <div class="text-subtitle1 text-weight-medium">平均回應時間</div>
                <div class="text-h4 text-weight-bold q-mt-xs">{{ stats.avgResponseTime }}<span
                    class="text-body2">秒</span>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card stat-satisfaction">
          <q-card-section>
            <div class="row no-wrap items-center">
              <div class="stat-icon-container">
                <q-icon name="thumb_up" size="40px" />
              </div>
              <div class="q-ml-sm">
                <div class="text-subtitle1 text-weight-medium">滿意度</div>
                <div class="text-h4 text-weight-bold q-mt-xs">{{ stats.satisfactionRate }}<span
                    class="text-body2">%</span>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 對話趨勢圖表 -->
    <q-card flat bordered class="chart-card q-mb-lg">
      <q-card-section class="chart-header">
        <div class="text-h6 flex">對話趨勢
          <q-space />
          <q-btn flat round dense icon="more_vert">
            <q-menu>
              <q-list style="min-width: 150px">
                <q-item clickable v-close-popup>
                  <q-item-section>匯出圖表</q-item-section>
                </q-item>
                <q-item clickable v-close-popup>
                  <q-item-section>查看詳情</q-item-section>
                </q-item>
                <q-item clickable v-close-popup>
                  <q-item-section>刷新數據</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-none">
        <div id="conversationTrend" style="height: 300px;"></div>
      </q-card-section>

      <q-separator />

      <q-card-section class="chart-footer q-py-sm">
        <div class="row items-center justify-end text-grey-7">
          <q-icon name="update" size="18px" />
          <span class="q-ml-xs text-caption">最後更新: 今天 08:30</span>
        </div>
      </q-card-section>
    </q-card>

    <!-- 熱門問題與分流區域 -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <!-- 熱門問題類型 -->
      <div class="col-12 col-lg-6">
        <q-card flat bordered class="feature-card">
          <q-card-section class="feature-header">
            <div class="text-h6 flex items-center">
              <q-icon name="trending_up" size="24px" color="orange" class="q-mr-sm" />
              熱門問題類型
              <q-space />
              <q-btn flat round dense icon="help_outline" class="q-ml-sm">
                <q-tooltip>顯示最常被問到的問題類型</q-tooltip>
              </q-btn>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-md">
            <div class="q-gutter-y-md">
              <div v-for="(item, index) in topQuestions" :key="index" class="question-item q-pa-sm">
                <div class="row items-center">
                  <div class="col-8 text-weight-medium">{{ item.question }}</div>
                  <div class="col-4 text-right text-primary text-weight-bold">{{ item.count }} 次</div>
                </div>
                <q-linear-progress :value="item.percentage" color="orange" size="10px" class="q-mt-sm progress-bar" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 分流結果分佈 -->
      <div class="col-12 col-lg-6">
        <q-card flat bordered class="feature-card">
          <q-card-section class="feature-header">
            <div class="text-h6 flex items-center">
              <q-icon name="pie_chart" size="24px" color="secondary" class="q-mr-sm" />
              科室分流統計
              <q-space />
              <q-btn flat round dense icon="help_outline">
                <q-tooltip>顯示AI分流到不同科室的比例</q-tooltip>
              </q-btn>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-none">
            <div id="departmentDistribution" style="height: 300px;"></div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 詳細數據表格 -->
    <q-card flat bordered class="table-card q-mb-md">
      <q-card-section class="table-header">
        <div class="text-h6 ">
          <q-icon name="list_alt" size="24px" color="primary" class="q-mr-sm " />
          詳細對話記錄

          <q-btn class="q-mx-lg" color="light-green-8" icon="file_download" label="導出報表" no-caps unelevated
            @click="exportReport" />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-none">
        <q-table :rows="conversations" :columns="columns" row-key="id" :pagination="pagination" :loading="loading"
          class="data-table" :loading-label="'載入中...'" :no-data-label="'暫無數據'">
          <!-- 自定義 loading 插槽 -->
          <template v-slot:loading>
            <q-inner-loading showing color="primary">
              <q-spinner-dots size="40px" color="primary" />
            </q-inner-loading>
          </template>

          <!-- 滿意度欄位自定義 -->
          <template v-slot:body-cell-satisfaction="props">
            <q-td :props="props">
              <div class="row items-center">
                <div class="satisfaction-rating">
                  <q-rating v-model="props.row.satisfaction" size="1em" color="amber" readonly icon="star" />
                </div>
                <span class="q-ml-sm text-grey-8">{{ props.row.satisfaction }}/5</span>
              </div>
            </q-td>
          </template>

          <!-- 時間欄位自定義 -->
          <template v-slot:body-cell-responseTime="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.responseTime < 1 ? 'positive' : props.row.responseTime < 2 ? 'warning' : 'negative'"
                text-color="white" class="response-time-badge">
                {{ props.row.responseTime }} 秒
              </q-badge>
            </q-td>
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
  { name: 'responseTime', align: 'left', label: '回應時間', field: 'responseTime', sortable: true },
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
      message: `已更新為 ${dateRange.value} 的數據`,
      icon: 'info',
      position: 'top'
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
    icon: 'check_circle',
    position: 'top'
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

<style lang="scss" scoped>
// 頁面標題區域
.page-header {
  background: linear-gradient(to right, #f8ebde, #ffb769);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

// 過濾卡片
.filter-card {
  border-radius: 8px;
  background-color: #fff;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.date-input {
  border-radius: 8px;
}

.filter-btn,
.reset-btn {
  height: 42px;
  border-radius: 8px;
}

// 統計卡片樣式
.stat-card {
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s;
  overflow: hidden;
  height: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  }

  .stat-icon-container {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
  }
}

.stat-conversations {
  background: linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%);

  .stat-icon-container {
    background-color: rgba(33, 150, 243, 0.1);
  }

  .q-icon {
    color: #2196f3;
  }
}

.stat-users {
  background: linear-gradient(135deg, #ffffff 0%, #e8f5e9 100%);

  .stat-icon-container {
    background-color: rgba(76, 175, 80, 0.1);
  }

  .q-icon {
    color: #4caf50;
  }
}

.stat-response-time {
  background: linear-gradient(135deg, #ffffff 0%, #fff8e1 100%);

  .stat-icon-container {
    background-color: rgba(255, 193, 7, 0.1);
  }

  .q-icon {
    color: #ffc107;
  }
}

.stat-satisfaction {
  background: linear-gradient(135deg, #ffffff 0%, #e8eaf6 100%);

  .stat-icon-container {
    background-color: rgba(103, 58, 183, 0.1);
  }

  .q-icon {
    color: #673ab7;
  }
}

// 圖表卡片樣式
.chart-card,
.feature-card,
.table-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.chart-header,
.feature-header,
.table-header {
  background-color: #f5f7fa;
  padding: 16px;
}

.chart-footer {
  background-color: #f5f7fa;
}

// 問題項目樣式
.question-item {
  border-radius: 8px;
  background-color: #f5f7fa;
  transition: all 0.3s ease;

  &:hover {
    background-color: #e3f2fd;
  }
}

.progress-bar {
  border-radius: 4px;
}

// 表格樣式
.data-table {
  :deep(.q-table__card) {
    box-shadow: none;
  }

  :deep(.q-table thead tr) {
    background-color: #f5f7fa;
  }

  :deep(.q-table tbody tr) {
    transition: background-color 0.3s;

    &:hover {
      background-color: #f5f7fa;
    }
  }
}

.response-time-badge {
  font-weight: normal;
  padding: 4px 8px;
  border-radius: 4px;
}

.satisfaction-rating {
  display: inline-flex;
}

// 日曆彈窗
:deep(.calendar-popup) {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
</style>
