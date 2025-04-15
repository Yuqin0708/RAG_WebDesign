<template>
  <q-page padding>
    <div class="row q-mb-md">
      <div class="col-12 flex justify-between items-center">
        <h4 class="q-my-none">知識庫管理</h4>
        <q-btn color="primary" icon="add" label="新增知識" @click="openAddDialog" />
      </div>
    </div>

    <!-- 搜尋欄 -->
    <div class="row q-mb-md">
      <div class="col-12 col-md-6">
        <q-input outlined v-model="searchText" placeholder="搜尋知識..." dense clearable>
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- 知識列表 -->
    <q-card flat bordered>
      <q-table :rows="filteredKnowledgeList" :columns="columns" row-key="id" :loading="loading" :pagination="pagination"
        :filter="searchText">
        <!-- 標題欄自定義 -->
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
            <q-th auto-width>操作</q-th>
          </q-tr>
        </template>

        <!-- 內容欄自定義 -->
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              {{ props.row[col.name] }}
            </q-td>
            <q-td auto-width>
              <div class="row no-wrap q-gutter-x-sm">
                <q-btn flat round dense color="primary" icon="edit" @click="openEditDialog(props.row)">
                  <q-tooltip>編輯</q-tooltip>
                </q-btn>
                <q-btn flat round dense color="negative" icon="delete" @click="confirmDelete(props.row)">
                  <q-tooltip>刪除</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <!-- 無數據時顯示 -->
        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-md text-grey-8">
            暫無知識數據
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- 新增/編輯知識對話框 -->
    <q-dialog v-model="knowledgeDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ isEditing ? '編輯知識' : '新增知識' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveKnowledge" class="q-gutter-md">
            <q-input v-model="knowledgeForm.title" label="知識標題" outlined :rules="[val => !!val || '標題不能為空']" />

            <q-input v-model="knowledgeForm.content" label="知識內容" type="textarea" outlined autogrow :rows="8"
              :rules="[val => !!val || '內容不能為空']" />

            <q-card-actions align="right">
              <q-btn flat label="取消" color="grey-8" v-close-popup />
              <q-btn unelevated label="保存" color="primary" type="submit" :loading="saving" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 刪除確認對話框 -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">確認刪除這條知識嗎？此操作不可恢復。</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="grey-8" v-close-popup />
          <q-btn flat label="刪除" color="negative" @click="deleteKnowledge" :loading="deleting" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { QTableColumn, useQuasar } from 'quasar'

const $q = useQuasar()

// 表格配置
const columns: Array<QTableColumn> = [
  { name: 'id', align: 'left', label: 'ID', field: 'id', sortable: true },
  { name: 'title', align: 'left', label: '標題', field: 'title', sortable: true },
  { name: 'createdAt', align: 'left', label: '創建時間', field: 'createdAt', sortable: true },
  { name: 'updatedAt', align: 'left', label: '更新時間', field: 'updatedAt', sortable: true }
]

const pagination = ref({
  rowsPerPage: 10
})

// 狀態管理
const loading = ref(false)
const searchText = ref('')
const knowledgeDialog = ref(false)
const isEditing = ref(false)
const deleteDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const selectedKnowledge = ref<any>(null)

// 表單數據
const knowledgeForm = ref({
  id: '',
  title: '',
  content: ''
})

// 模擬數據
const knowledgeList = ref([
  {
    id: '1',
    title: '掛號流程指南',
    content: '本醫院採用線上預約與現場掛號兩種方式。線上預約可透過醫院官網或APP進行。現場掛號請至一樓服務台。',
    createdAt: '2025-03-15 09:30',
    updatedAt: '2025-03-15 09:30'
  },
  {
    id: '2',
    title: '常見檢查項目說明',
    content: '本院提供的常見檢查項目包括：血常規、尿常規、肝功能、腎功能、心電圖、X光等。檢查前請遵循醫囑做好相應準備。',
    createdAt: '2025-03-16 14:20',
    updatedAt: '2025-04-01 10:15'
  },
  {
    id: '3',
    title: '體檢套餐介紹',
    content: '本院提供基礎套餐、進階套餐、全面套餐三種體檢套餐。基礎套餐包含血常規、尿常規等基本檢查；進階套餐增加了B超等項目；全面套餐則包含核磁共振等高級檢查。',
    createdAt: '2025-03-20 08:45',
    updatedAt: '2025-03-20 08:45'
  }
])

// 過濾後的知識列表
const filteredKnowledgeList = computed(() => {
  if (!searchText.value) return knowledgeList.value

  const search = searchText.value.toLowerCase()
  return knowledgeList.value.filter(item =>
    item.title.toLowerCase().includes(search) ||
    item.content.toLowerCase().includes(search)
  )
})

// 打開新增對話框
const openAddDialog = () => {
  isEditing.value = false
  knowledgeForm.value = {
    id: '',
    title: '',
    content: ''
  }
  knowledgeDialog.value = true
}

// 打開編輯對話框
const openEditDialog = (knowledge: any) => {
  isEditing.value = true
  knowledgeForm.value = {
    id: knowledge.id,
    title: knowledge.title,
    content: knowledge.content
  }
  knowledgeDialog.value = true
}

// 儲存知識
const saveKnowledge = async () => {
  try {
    saving.value = true

    // TODO: 實際保存邏輯
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (isEditing.value) {
      // 更新現有知識
      const index = knowledgeList.value.findIndex(item => item.id === knowledgeForm.value.id)
      if (index !== -1) {
        // @ts-ignore
        knowledgeList.value[index] = {
          ...knowledgeList.value[index],
          title: knowledgeForm.value.title,
          content: knowledgeForm.value.content,
          updatedAt: new Date().toLocaleString()
        }
      }

      $q.notify({
        color: 'positive',
        message: '知識更新成功',
        icon: 'check_circle'
      })
    } else {
      // 新增知識
      const now = new Date().toLocaleString()
      knowledgeList.value.push({
        id: (knowledgeList.value.length + 1).toString(),
        title: knowledgeForm.value.title,
        content: knowledgeForm.value.content,
        createdAt: now,
        updatedAt: now
      })

      $q.notify({
        color: 'positive',
        message: '知識新增成功',
        icon: 'check_circle'
      })
    }

    knowledgeDialog.value = false
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: '儲存失敗',
      icon: 'error'
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

    // TODO: 實際刪除邏輯
    await new Promise(resolve => setTimeout(resolve, 1000))

    const index = knowledgeList.value.findIndex(item => item.id === selectedKnowledge.value.id)
    if (index !== -1) {
      knowledgeList.value.splice(index, 1)
    }

    $q.notify({
      color: 'positive',
      message: '知識刪除成功',
      icon: 'check_circle'
    })

    deleteDialog.value = false
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: '刪除失敗',
      icon: 'error'
    })
    console.error(error)
  } finally {
    deleting.value = false
  }
}

// 載入數據
onMounted(async () => {
  try {
    loading.value = true

    // TODO: 實際獲取數據邏輯
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 這裡我們已經有模擬數據了
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: '載入知識庫數據失敗',
      icon: 'error'
    })
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>
