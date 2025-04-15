<template>
  <q-page padding>
    <!-- 頁面標題區域 -->
    <div class="page-header q-mb-lg">
      <div class="row items-center flex">
        <q-icon name="school" size="36px" color="primary" class="q-mr-md" />
        <div>
          <h4 class="q-my-none text-weight-bold">知識庫管理</h4>
          <p class="text-grey-8 q-my-xs">管理與編輯AI助手使用的醫療知識資料</p>
        </div>
        <q-space />
        <q-btn color="primary" icon="add" label="新增知識" class="add-button q-px-md" @click="openAddDialog">
          <q-tooltip>新增醫療相關知識到系統</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- 統計卡片區域 -->
    <q-card flat bordered class="guide-card q-mb-md" v-if="showGuide">
      <q-card-section class="row items-center">
        <q-icon name="tips_and_updates" color="amber" size="24px" class="q-mr-sm" />
        <div class="text-subtitle1 text-weight-medium">知識庫管理使用指南</div>
        <q-space />
        <q-btn flat round dense icon="close" @click="showGuide = false" />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <div class="guide-item">
              <div class="text-weight-medium">新增知識</div>
              <p class="q-mt-xs">點擊右上角「新增知識」按鈕，填寫知識資料後儲存。新知識將自動更新到AI系統。</p>
            </div>
          </div>



          <div class="col-12 col-md-4">
            <div class="guide-item">
              <div class="text-weight-medium">知識內容</div>
              <p class="q-mt-xs">請使用簡明的標題和詳細的內容，內容支援Markdown格式，可以更好地組織醫療資訊。</p>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 搜尋與過濾區域 -->
    <q-card flat bordered class="search-card q-mb-md">
      <q-card-section>
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-8">
            <q-input outlined v-model="searchText" placeholder="搜尋知識內容..." clearable class="search-input">
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
              <template v-slot:append>
                <q-icon name="filter_list" class="cursor-pointer">
                  <q-tooltip>進階過濾選項</q-tooltip>
                  <q-menu>
                    <q-list style="min-width: 200px">
                      <q-item tag="label">
                        <q-item-section>
                          <q-item-label>日期排序</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-toggle v-model="sortByNewest" color="primary" />
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-4 flex justify-end">
            <q-btn outline color="secondary" icon="play_for_work" label="匯入知識" class="import-btn" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 知識列表 -->
    <q-card flat bordered class="data-card">
      <q-table :rows="filteredKnowledgeList" :columns="columns" row-key="id" :loading="loading" :pagination="pagination"
        :filter="searchText" class="knowledge-table">
        <!-- 表格標題 -->
        <template v-slot:top>
          <div class="row full-width items-center q-pb-sm">
            <div class="text-h6">知識庫項目</div>
            <q-space />
            <q-btn flat round icon="refresh" @click="refreshData">
              <q-tooltip>刷新數據</q-tooltip>
            </q-btn>
          </div>
        </template>

        <!-- 標題欄自定義 -->
        <template v-slot:header="props">
          <q-tr :props="props" class="table-header">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
            <q-th auto-width>操作</q-th>
          </q-tr>
        </template>

        <!-- 內容欄自定義 -->
        <template v-slot:body="props">
          <q-tr :props="props" class="table-row">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <div v-if="col.name === 'title'" class="row items-center">
                <q-icon name="article" color="primary" size="18px" class="q-mr-sm" />
                <div class="text-weight-medium">{{ props.row[col.name] }}</div>
              </div>
              <div v-else>{{ props.row[col.name] }}</div>
            </q-td>
            <q-td auto-width>
              <div class="row no-wrap q-gutter-x-sm">
                <q-btn flat round color="info" icon="visibility" @click="viewKnowledge(props.row)">
                  <q-tooltip>查看</q-tooltip>
                </q-btn>
                <q-btn flat round color="primary" icon="edit" @click="openEditDialog(props.row)">
                  <q-tooltip>編輯</q-tooltip>
                </q-btn>
                <q-btn flat round color="negative" icon="delete" @click="confirmDelete(props.row)">
                  <q-tooltip>刪除</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <!-- 無數據時顯示 -->
        <template v-slot:no-data>
          <div class="full-width flex flex-center q-pa-xl column">
            <q-icon name="sentiment_dissatisfied" size="50px" color="grey-6" />
            <div class="text-h6 text-grey-7 q-mt-md">暫無知識數據</div>
            <div class="text-grey-7 q-mb-md">請點擊"新增知識"按鈕添加內容</div>
            <q-btn color="primary" icon="add" label="新增第一筆知識" @click="openAddDialog" />
          </div>
        </template>

        <!-- 分頁顯示 -->
        <template v-slot:pagination="scope">
          <q-pagination v-model="scope.pagination.page"
            :max="Math.ceil(filteredKnowledgeList.length / scope.pagination.rowsPerPage)" input boundary-links
            direction-links color="primary" :max-pages="6" size="sm" class="q-px-sm" />
        </template>
      </q-table>
    </q-card>

    <!-- 查看知識對話框 -->
    <q-dialog v-model="viewDialog">
      <q-card class="view-card">
        <q-card-section class="view-header">
          <div class="text-h6">查看知識詳情</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-lg">
          <div class="text-h6 text-primary">{{ selectedKnowledge?.title || '' }}</div>
          <div class="text-grey-7 q-mt-xs row items-center">
            <q-icon name="event" size="18px" class="q-mr-xs" />
            <span>建立時間：{{ selectedKnowledge?.createdAt || '' }}</span>
            <q-separator vertical inset class="q-mx-sm" />
            <q-icon name="update" size="18px" class="q-mr-xs" />
            <span>更新時間：{{ selectedKnowledge?.updatedAt || '' }}</span>
          </div>
        </q-card-section>

        <q-card-section class="view-content q-mt-sm">
          <div class="text-body1 q-pa-md knowledge-content">
            {{ selectedKnowledge?.content || '' }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn outline icon="edit" label="編輯" color="primary" @click="openEditFromView" v-close-popup />
          <q-btn unelevated icon="close" label="關閉" color="grey-7" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 新增/編輯知識對話框 -->
    <q-dialog v-model="knowledgeDialog" persistent>
      <q-card class="edit-card">
        <q-bar class="bg-primary text-white">
          <div class="text-weight-bold">{{ isEditing ? '編輯知識' : '新增知識' }}</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>關閉</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section class="q-pa-md">
          <q-stepper v-model="formStep" ref="stepper" color="primary" alternative-labels header-nav class="no-shadow">
            <q-step name="content" title="知識內容" icon="article" :done="formStep > 2">
              <div class="q-pa-md">
                <q-select v-model="knowledgeForm.category" :options="categoryOptions" outlined label="知識分類"
                  class="q-mb-md">
                  <template v-slot:prepend>
                    <q-icon name="category" color="primary" />
                  </template>
                </q-select>

                <q-input v-model="knowledgeForm.title" label="知識標題" outlined class="q-mb-md"
                  :rules="[val => !!val || '標題不能為空']">
                  <template v-slot:prepend>
                    <q-icon name="title" color="primary" />
                  </template>
                </q-input>



                <q-input v-model="knowledgeForm.content" label="知識內容" type="textarea" outlined autogrow :rows="12"
                  class="content-editor" :rules="[val => !!val || '內容不能為空']" />

                <div class="row justify-between q-mt-md">
                  <div class="text-caption text-grey-8">
                    字數統計: {{ knowledgeForm.content.length }} 字
                  </div>
                  <div class="text-caption text-primary">
                    <q-icon name="help_outline" size="16px" />
                    <span class="q-ml-xs">Markdown 格式支援</span>
                  </div>
                </div>
              </div>

              <q-stepper-navigation>
                <q-btn unelevated color="primary" label="下一步" @click="formStep = 3" />
                <q-btn flat color="secondary" label="返回" class="q-ml-sm" @click="formStep = 1" />
              </q-stepper-navigation>
            </q-step>

            <q-step name="confirm" title="確認儲存" icon="check_circle">
              <div class="q-pa-md">
                <div class="text-h6 text-primary q-mb-md">請檢查以下信息</div>

                <q-list bordered separator>
                  <q-item>
                    <q-item-section>
                      <q-item-label overline>標題</q-item-label>
                      <q-item-label>{{ knowledgeForm.title }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section>
                      <q-item-label overline>分類</q-item-label>
                      <q-item-label>{{ knowledgeForm.category }}</q-item-label>
                    </q-item-section>
                  </q-item>



                  <q-item>
                    <q-item-section>
                      <q-item-label overline>內容預覽 (前100字)</q-item-label>
                      <q-item-label class="text-body2">
                        {{ knowledgeForm.content.substring(0, 100) }}{{ knowledgeForm.content.length > 100 ? '...' :
                          ''
                        }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>

              <q-stepper-navigation>
                <q-btn unelevated color="positive" icon="save" label="確認儲存" @click="saveKnowledge" :loading="saving" />
                <q-btn flat color="secondary" label="返回編輯" class="q-ml-sm" @click="formStep = 2" />
              </q-stepper-navigation>
            </q-step>
          </q-stepper>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 刪除確認對話框 -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card class="delete-confirm-card">
        <q-card-section class="bg-negative text-white">
          <div class="text-h6">
            <q-icon name="warning" class="q-mr-sm" />
            刪除確認
          </div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <div class="text-body1 q-mb-md">
            確認要刪除以下知識嗎？此操作將無法恢復。
          </div>

          <q-card flat bordered class="delete-item-preview">
            <q-item>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ selectedKnowledge?.title }}</q-item-label>
                <q-item-label caption lines="2">
                  {{ selectedKnowledge?.content.substring(0, 100) }}{{ selectedKnowledge?.content.length > 100 ? '...' :
                    ''
                  }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-card>
        </q-card-section>

        <q-card-actions align="right" class="q-pb-md q-pr-md">
          <q-btn flat label="取消" color="dark" v-close-popup />
          <q-btn unelevated label="確認刪除" color="negative" class="q-ml-sm" icon="delete_forever" @click="deleteKnowledge"
            :loading="deleting" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 查看對話 -->
    <q-dialog v-model="knowledgeViewDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ viewKnowledgeTitle }}</div>
        </q-card-section>

        <q-card-section>
          <p>{{ viewKnowledgeContent }}</p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="關閉" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// 表格配置
const columns = [
  { name: 'id', align: 'left' as const, label: 'ID', field: 'id', sortable: true },
  { name: 'title', align: 'left' as const, label: '標題', field: 'title', sortable: true },
  { name: 'createdAt', align: 'left' as const, label: '創建時間', field: 'createdAt', sortable: true },
  { name: 'updatedAt', align: 'left' as const, label: '更新時間', field: 'updatedAt', sortable: true }
]

const pagination = ref({
  rowsPerPage: 10
})

// 狀態管理
const loading = ref(false)
const searchText = ref('')
const sortByNewest = ref(true)
const knowledgeDialog = ref(false)
const viewDialog = ref(false)
const isEditing = ref(false)
const deleteDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const selectedKnowledge = ref<any>(null)
const knowledgeViewDialog = ref(false)
const viewKnowledgeTitle = ref('')
const viewKnowledgeContent = ref('')
const formStep = ref(1)
const showGuide = ref(true) // 是否顯示指南卡片

const currentPage = ref(1) // 卡片視圖的當前頁碼
const itemsPerPage = 9 // 卡片視圖每頁顯示的項目數


// 分類選項
const categoryOptions = [
  '掛號流程',
  '醫療服務',
  '體檢項目',
  '醫院設施',
  '醫保政策',
  '健康指南'
]

// 表單數據
const knowledgeForm = ref({
  id: '',
  title: '',
  content: '',
  category: '醫療服務',
  tags: ''
})

// 模擬數據
const knowledgeList = ref([
  {
    id: '1',
    title: '掛號流程指南',
    content: '本醫院採用線上預約與現場掛號兩種方式。線上預約可透過醫院官網或APP進行。現場掛號請至一樓服務台。\n\n線上預約流程：\n1. 在官網或APP註冊帳號\n2. 選擇需要預約的科室\n3. 選擇醫生和時段\n4. 填寫個人資料\n5. 確認預約信息\n\n現場掛號流程：\n1. 攜帶有效證件到一樓服務台\n2. 告知服務人員需要掛號的科室\n3. 繳納掛號費\n4. 等待叫號',
    createdAt: '2025-03-15 09:30',
    updatedAt: '2025-03-15 09:30',
    category: '掛號流程',
    tags: '掛號,預約,流程'
  },
  {
    id: '2',
    title: '常見檢查項目說明',
    content: '本院提供的常見檢查項目包括：血常規、尿常規、肝功能、腎功能、心電圖、X光等。檢查前請遵循醫囑做好相應準備。\n\n各項檢查注意事項：\n\n血常規：空腹為佳，抽血前一天避免劇烈運動\n尿常規：清晨第一次尿液最佳，女性月經期避免\n肝腎功能：需空腹8小時以上\n心電圖：檢查前避免劇烈運動，保持情緒平穩\nX光：孕婦禁忌，檢查前需脫除金屬飾品\n\n如有任何疑問，請諮詢您的主治醫師或護理人員。',
    createdAt: '2025-03-16 14:20',
    updatedAt: '2025-04-01 10:15',
    category: '醫療服務',
    tags: '檢查,醫療項目,注意事項'
  },
  {
    id: '3',
    title: '體檢套餐介紹',
    content: '本院提供基礎套餐、進階套餐、全面套餐三種體檢套餐。基礎套餐包含血常規、尿常規等基本檢查；進階套餐增加了B超等項目；全面套餐則包含核磁共振等高級檢查。\n\n套餐詳情：\n\n1. 基礎套餐 (NT$3,500)\n   - 一般檢查：身高、體重、血壓、脈搏、體溫\n   - 血液檢查：血常規、血型、肝功能、腎功能、血脂\n   - 尿液檢查：尿常規\n   - 心電圖\n   - 胸部X光\n\n2. 進階套餐 (NT$6,800)\n   - 包含基礎套餐全部項目\n   - 腹部B超：肝、膽、脾、胰、腎\n   - 甲狀腺功能檢查\n   - 腫瘤標記物檢查\n   - 骨密度檢查\n\n3. 全面套餐 (NT$12,000)\n   - 包含進階套餐全部項目\n   - 頭部核磁共振\n   - 全身CT檢查\n   - 心臟超音波\n   - 胃腸鏡檢查\n\n體檢時間：週一至週六 8:00-11:30\n體檢地點：醫院3樓體檢中心\n預約電話：(02)2345-6789',
    createdAt: '2025-03-20 08:45',
    updatedAt: '2025-03-20 08:45',
    category: '體檢項目',
    tags: '體檢,套餐,健康檢查'
  },
  {
    id: '4',
    title: '醫院樓層及設施指南',
    content: '本院各樓層設施及科室分布說明：\n\n1樓：掛號大廳、急診、藥局、便利商店\n2樓：內科部（心臟科、腸胃科、腎臟科）\n3樓：外科部（一般外科、骨科、泌尿科）\n4樓：婦產科、兒科\n5樓：五官科（眼科、耳鼻喉科、牙科）\n6樓：健檢中心\n7樓：手術室、重症加護病房\n8-10樓：住院病房\n\n便民服務：\n- 停車場：地下1-3樓\n- ATM：1樓大廳左側\n- 餐廳：1樓後方\n- 祈禱室：8樓東側\n- 圖書室：9樓休息區',
    createdAt: '2025-03-22 15:10',
    updatedAt: '2025-03-22 15:10',
    category: '醫院設施',
    tags: '樓層,設施,地圖'
  }
])

// 過濾後的知識列表
const filteredKnowledgeList = computed(() => {
  let result = [...knowledgeList.value]

  // 搜尋過濾
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    result = result.filter(item =>
      item.title.toLowerCase().includes(search) ||
      item.content.toLowerCase().includes(search)
    )
  }

  // 排序
  if (sortByNewest.value) {
    result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  } else {
    result.sort((a, b) => a.title.localeCompare(b.title))
  }

  return result
})

// 查看知識詳情
const viewKnowledge = (knowledge: any) => {
  selectedKnowledge.value = knowledge
  viewDialog.value = true
}

// 打開新增對話框
const openAddDialog = () => {
  isEditing.value = false
  formStep.value = 1
  knowledgeForm.value = {
    id: '',
    title: '',
    content: '',
    category: '醫療服務',
    tags: ''
  }
  knowledgeDialog.value = true
}

// 打開編輯對話框
const openEditDialog = (knowledge: any) => {
  isEditing.value = true
  formStep.value = 1
  knowledgeForm.value = {
    id: knowledge.id,
    title: knowledge.title,
    content: knowledge.content,
    category: knowledge.category || '醫療服務',
    tags: knowledge.tags || ''
  }
  knowledgeDialog.value = true
}

// 從查看頁面進入編輯
const openEditFromView = () => {
  if (selectedKnowledge.value) {
    openEditDialog(selectedKnowledge.value)
  }
}

// 儲存知識
const saveKnowledge = async () => {
  try {
    saving.value = true

    // 模擬網絡延遲
    await new Promise(resolve => setTimeout(resolve, 1500))

    if (isEditing.value) {
      // 更新現有知識
      const index = knowledgeList.value.findIndex(item => item.id === knowledgeForm.value.id)
      if (index !== -1) {
        const updatedKnowledge = {
          id: knowledgeForm.value.id, // Explicitly set id as non-optional
          title: knowledgeForm.value.title,
          content: knowledgeForm.value.content,
          category: knowledgeForm.value.category,
          tags: knowledgeForm.value.tags,
          createdAt: knowledgeList.value[index]?.createdAt || new Date().toLocaleString(), // Maintain the original creation date
          updatedAt: new Date().toLocaleString()
        }
        knowledgeList.value[index] = updatedKnowledge
      }

      $q.notify({
        color: 'positive',
        message: '知識更新成功',
        icon: 'check_circle',
        position: 'top',
        timeout: 2000
      })
    } else {
      // 新增知識
      const now = new Date().toLocaleString()
      const newId = (Math.max(...knowledgeList.value.map(item => parseInt(item.id))) + 1).toString()

      knowledgeList.value.push({
        id: newId,
        title: knowledgeForm.value.title,
        content: knowledgeForm.value.content,
        category: knowledgeForm.value.category,
        tags: knowledgeForm.value.tags,
        createdAt: now,
        updatedAt: now
      })

      $q.notify({
        color: 'positive',
        message: '知識新增成功',
        icon: 'check_circle',
        position: 'top',
        timeout: 2000
      })
    }

    knowledgeDialog.value = false
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: '儲存失敗',
      icon: 'error',
      position: 'top'
    })
    console.error(error)
  } finally {
    saving.value = false
  }
}

// 確認刪除
const confirmDelete = (knowledge: any) => {
  selectedKnowledge.value = knowledge
  deleteDialog.value = true
}

// 刪除知識
const deleteKnowledge = async () => {
  try {
    deleting.value = true

    // 模擬網絡延遲
    await new Promise(resolve => setTimeout(resolve, 1500))

    const index = knowledgeList.value.findIndex(item => item.id === selectedKnowledge.value.id)
    if (index !== -1) {
      knowledgeList.value.splice(index, 1)
    }

    $q.notify({
      color: 'positive',
      message: '知識刪除成功',
      icon: 'check_circle',
      position: 'top',
      timeout: 2000
    })

    deleteDialog.value = false
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: '刪除失敗',
      icon: 'error',
      position: 'top'
    })
    console.error(error)
  } finally {
    deleting.value = false
  }
}

// 刷新數據
const refreshData = async () => {
  try {
    loading.value = true

    // 模擬數據刷新
    await new Promise(resolve => setTimeout(resolve, 1000))

    $q.notify({
      color: 'info',
      message: '數據已刷新',
      icon: 'refresh',
      position: 'top'
    })
  } catch (error) {
    console.error('刷新失敗:', error)
  } finally {
    loading.value = false
  }
}

// 載入數據
onMounted(async () => {
  try {
    loading.value = true

    // 模擬數據加載
    await new Promise(resolve => setTimeout(resolve, 1500))

  } catch (error) {
    $q.notify({
      color: 'negative',
      message: '載入知識庫數據失敗',
      icon: 'error',
      position: 'top'
    })
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
// 頁面標題樣式
.page-header {
  background: linear-gradient(to right, #e3f2fd, #bbdefb);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

// 統計卡片樣式
.stat-card {
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }
}

.stat-icon-container {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

// 搜尋卡片樣式
.search-card {
  border-radius: 8px;
  background-color: #fff;
}

// 指南卡片
.guide-card {
  border-radius: 8px;
  background-color: #fffde7;
  border-left: 4px solid #fbc02d;
}

.guide-item {
  padding: 10px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.7);
}

.search-input {
  border-radius: 8px;
}

.filter-btn,
.import-btn {
  height: 42px;
  border-radius: 8px;
}

// 添加按鈕樣式
.add-button {
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  }
}

// 數據卡片樣式
.data-card {
  border-radius: 8px;
  overflow: hidden;
}

// 表格樣式
.knowledge-table {
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

// 對話框樣式
.edit-card {
  width: 700px;
  max-width: 90vw;
  border-radius: 12px;
}

.content-editor {
  font-family: 'Courier New', monospace;
}

.view-card {
  width: 600px;
  max-width: 90vw;
  border-radius: 10px;
}

.view-header {
  background-color: #f5f7fa;
}

.knowledge-content {
  white-space: pre-line;
  background-color: #f8f9fa;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.delete-confirm-card {
  width: 400px;
  max-width: 90vw;
  border-radius: 10px;
}

.delete-item-preview {
  background-color: #fff8e1;
  border-left: 4px solid #ffb300;
}
</style>
