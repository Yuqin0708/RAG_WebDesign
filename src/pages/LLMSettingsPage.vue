<template>
  <q-page padding>
    <!-- 頁面標題區域 -->
    <div class="page-header q-mb-lg">
      <div class="row items-center">
        <q-icon name="tune" size="36px" color="accent" class="q-mr-md" />
        <div>
          <h4 class="q-my-none text-weight-bold">LLM 設定</h4>
          <p class="text-grey-8 q-my-xs">配置AI助手的行為與回應方式</p>
        </div>
      </div>
    </div>

    <!-- System Prompt 設定卡片 -->
    <q-card flat bordered class="settings-card q-mb-lg">
      <q-card-section class="card-header">
        <div class="row items-center">
          <q-icon name="smart_toy" size="28px" color="accent" class="q-mr-sm" />
          <div class="text-h6">System Prompt 設定</div>
        </div>
        <p class="text-grey-8 q-mt-sm">
          此提示詞定義了AI助手的角色、行為和回應方式。它是AI與使用者之間每次對話的基礎指令。
        </p>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form @submit="saveSettings" class="q-gutter-md">
          <div class="prompt-editor-container">
            <q-input v-model="systemPrompt" type="textarea" label="System Prompt 內容" outlined autogrow :rows="10"
              :rules="[val => !!val || 'System Prompt 不能為空']" class="prompt-editor" bg-color="grey-1" />

            <div class="prompt-helper q-mt-sm">
              <div class="row justify-between">
                <div class="text-caption text-grey-7">
                  <q-icon name="info" size="16px" class="q-mr-xs" />
                  提示詞將決定AI助手的人格和專業能力
                </div>
                <div class="text-caption text-accent cursor-pointer">
                  <q-icon name="help_outline" size="16px" />
                  <span class="q-ml-xs">查看提示詞指南</span>
                </div>
              </div>
            </div>
          </div>

          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn outline color="warning" icon="refresh" label="還原預設" @click="resetToDefault" class="action-btn" />
            <q-btn unelevated color="primary" icon="save" label="儲存設定" type="submit" :loading="saving"
              class="action-btn" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- 模型參數設定卡片 -->
    <q-card flat bordered class="settings-card q-mb-lg">
      <q-card-section class="card-header">
        <div class="row items-center">
          <q-icon name="settings" size="28px" color="secondary" class="q-mr-sm" />
          <div class="text-h6">模型參數設定</div>
        </div>
        <p class="text-grey-8 q-mt-sm">
          調整AI模型的關鍵參數，影響回應的多樣性與創造性。
        </p>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-card flat class="param-card">
              <q-card-section class="q-pb-none">
                <div class="text-subtitle1 text-weight-medium row items-center">
                  <q-icon name="thermostat" color="orange-8" size="20px" class="q-mr-xs" />
                  Temperature
                  <q-icon name="help" size="16px" color="grey-7" class="q-ml-xs cursor-pointer">
                    <q-tooltip max-width="300px" class="bg-dark">
                      控制輸出的隨機性。較高的值將產生更多樣化和創造性的回應，較低的值會使回應更加確定和可預測。
                    </q-tooltip>
                  </q-icon>
                </div>
                <p class="text-caption text-grey-7 q-mt-xs">控制輸出的隨機性與創意程度</p>
              </q-card-section>
              <q-card-section>
                <q-input v-model.number="temperature" type="number" outlined :rules="[
                  val => val !== null && val !== undefined || '請輸入溫度值',
                  val => val >= 0 && val <= 1 || '溫度值需在0到1之間'
                ]" :min="0" :max="1" :step="0.1">
                  <template v-slot:append>
                    <div class="text-primary text-weight-medium">{{ temperature }}</div>
                  </template>
                </q-input>

                <q-slider v-model="temperature" :min="0" :max="1" :step="0.05" color="orange-8" class="q-mt-md" label
                  label-always />

                <div class="row q-mt-sm">
                  <div class="col text-left text-caption">更精確</div>
                  <div class="col text-right text-caption">更創意</div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-6">
            <q-card flat class="param-card">
              <q-card-section class="q-pb-none">
                <div class="text-subtitle1 text-weight-medium row items-center">
                  <q-icon name="format_size" color="blue-8" size="20px" class="q-mr-xs" />
                  Max Tokens
                  <q-icon name="help" size="16px" color="grey-7" class="q-ml-xs cursor-pointer">
                    <q-tooltip max-width="300px" class="bg-dark">
                      控制模型回應的最大長度。較大的值允許更長的回應，但可能會增加處理時間和成本。
                    </q-tooltip>
                  </q-icon>
                </div>
                <p class="text-caption text-grey-7 q-mt-xs">控制生成文本的最大長度</p>
              </q-card-section>
              <q-card-section>
                <q-input v-model.number="maxTokens" type="number" outlined :rules="[
                  val => val !== null && val !== undefined || '請輸入最大令牌數',
                  val => val > 0 && val <= 4096 || '令牌數需在1到4096之間'
                ]" :min="1" :max="4096" :step="16">
                  <template v-slot:append>
                    <div class="text-primary text-weight-medium">{{ maxTokens }}</div>
                  </template>
                </q-input>

                <q-slider v-model="maxTokens" :min="256" :max="4096" :step="256" color="blue-8" class="q-mt-md" label
                  label-always />

                <div class="row q-mt-sm">
                  <div class="col text-left text-caption">較短回應</div>
                  <div class="col text-right text-caption">較長回應</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 測試區域卡片 -->
    <q-card flat bordered class="settings-card">
      <q-card-section class="card-header">
        <div class="row items-center">
          <q-icon name="psychology" size="28px" color="green-8" class="q-mr-sm" />
          <div class="text-h6">測試對話</div>
        </div>
        <p class="text-grey-8 q-mt-sm">
          使用當前設定測試AI助手的回應效果
        </p>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="test-dialog-container">
          <div class="test-header q-mb-md">
            <q-icon name="chat" size="20px" class="q-mr-xs" color="primary" />
            <span class="text-subtitle1 text-weight-medium">與AI助手對話</span>
          </div>

          <q-input v-model="testQuery" label="輸入測試問題" outlined class="test-input q-mb-md" placeholder="例如：體檢需要空腹嗎？">
            <template v-slot:before>
              <q-avatar size="32px">
                <img src="https://cdn.quasar.dev/img/avatar.png" />
              </q-avatar>
            </template>
            <template v-slot:after>
              <q-btn round flat icon="send" color="primary" @click="testAI" :loading="testing" />
            </template>
          </q-input>

          <q-card v-if="testResponse" flat bordered class="response-card q-pa-md">
            <q-card-section>
              <div class="row items-start no-wrap">
                <q-avatar size="32px" color="primary" text-color="white" icon="smart_toy" class="q-mr-md" />
                <div>
                  <div class="text-subtitle2 text-primary">AI助手</div>
                  <p class="q-mt-sm" style="white-space: pre-line">{{ testResponse }}</p>
                </div>
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat round icon="thumb_up" color="green-7">
                <q-tooltip>這個回應有幫助</q-tooltip>
              </q-btn>
              <q-btn flat round icon="thumb_down" color="red-7">
                <q-tooltip>這個回應需要改進</q-tooltip>
              </q-btn>
              <q-btn flat round icon="content_copy" color="grey-7">
                <q-tooltip>複製回應</q-tooltip>
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// 默認系統提示詞
const DEFAULT_SYSTEM_PROMPT = `你是一個醫院智能助手，專門協助患者進行門診分流與提供體檢資訊。

## 角色職責：
1. 幫助患者了解掛號流程和方式
2. 引導患者根據症狀選擇適合的科室
3. 解釋體檢項目和套餐的內容與注意事項
4. 回答患者關於醫院服務的常見問題

## 回應準則：
- 提供準確、專業的醫療相關信息
- 對無法確定的問題，建議患者諮詢醫護人員
- 語氣親切，用詞平易近人
- 優先使用知識庫中的資訊回答問題
- 避免診斷疾病或提供治療建議

請記住，你的目標是提高患者就醫體驗，幫助醫院提供更高效的服務，但不替代專業醫療人員的工作。`

// 狀態管理
const systemPrompt = ref(DEFAULT_SYSTEM_PROMPT)
const temperature = ref(0.7)
const maxTokens = ref(2048)
const saving = ref(false)
const testQuery = ref('')
const testResponse = ref('')
const testing = ref(false)

// 重置為默認設定
const resetToDefault = () => {
  $q.dialog({
    title: '確認重置',
    message: '確定要將系統提示詞重置為默認值嗎？',
    cancel: true,
    persistent: true
  }).onOk(() => {
    systemPrompt.value = DEFAULT_SYSTEM_PROMPT
    $q.notify({
      color: 'info',
      message: '已重置為默認設定',
      icon: 'refresh',
      position: 'top'
    })
  })
}

// 保存設定
const saveSettings = async () => {
  try {
    saving.value = true

    // TODO: 實際保存邏輯
    await new Promise(resolve => setTimeout(resolve, 1000))

    $q.notify({
      color: 'positive',
      message: 'LLM 設定已更新',
      icon: 'check_circle',
      position: 'top'
    })
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: '設定更新失敗',
      icon: 'error',
      position: 'top'
    })
    console.error(error)
  } finally {
    saving.value = false
  }
}

// 測試 AI 回應
const testAI = async () => {
  if (!testQuery.value.trim()) {
    $q.notify({
      color: 'warning',
      message: '請輸入測試問題',
      icon: 'warning',
      position: 'top'
    })
    return
  }

  try {
    testing.value = true

    // TODO: 實際 API 調用
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 模擬 AI 回應
    if (testQuery.value.includes('掛號')) {
      testResponse.value = '您好！本院掛號方式有兩種：\n\n1. 線上預約：可透過醫院官網或APP進行，提前3-7天預約。\n2. 現場掛號：請於就診當日提前30分鐘到一樓服務台辦理。\n\n掛號時請攜帶健保卡和身份證件。若有任何疑問，可撥打客服專線：(02)1234-5678。'
    } else if (testQuery.value.includes('體檢')) {
      testResponse.value = '本院目前提供三種體檢套餐：\n\n1. 基礎套餐 (NT$3,500)：包含血常規、尿常規、肝腎功能、血脂、胸部X光等基本檢查。\n2. 進階套餐 (NT$6,800)：在基礎套餐基礎上，增加心電圖、腹部超音波等項目。\n3. 全面套餐 (NT$12,000)：最完整的檢查，包含基礎+進階項目，並增加核磁共振等高階影像檢查。\n\n體檢前請空腹8小時，充分休息，避免劇烈運動。'
    } else {
      testResponse.value = '您好！我是醫院智能助手，很高興為您服務。請問有什麼可以幫助您的嗎？無論是掛號流程、科室選擇還是體檢資訊，我都可以為您提供相關指引。如果您有具體的症狀或疑問，也歡迎告訴我，我會盡力提供適合的建議。'
    }
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'AI 測試失敗',
      icon: 'error',
      position: 'top'
    })
    console.error(error)
  } finally {
    testing.value = false
  }
}

// 載入初始設定
onMounted(() => {
  try {
    // TODO: 載入保存的設定
  } catch (error) {
    console.error('載入設定失敗:', error)
  }
})
</script>

<style lang="scss" scoped>
// 頁面標題區域
.page-header {
  background: linear-gradient(to right, #ede3fa, #c192ff);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
}

// 設定卡片共通樣式
.settings-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .card-header {
    background-color: #f9fafc;
    padding: 16px 20px;
  }
}

// Prompt編輯區域
.prompt-editor-container {
  position: relative;

  .prompt-editor {
    border-radius: 8px;
    transition: all 0.3s ease;

    :deep(.q-field__control) {
      background-color: #f8fafc;
    }

    &:focus-within {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
  }

  .prompt-helper {
    display: flex;
    justify-content: space-between;
    padding: 4px 8px;
  }
}

// 按鈕樣式
.action-btn {
  border-radius: 8px;
  min-width: 120px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}

// 模型參數卡片
.param-card {
  padding: 8px;
  border-radius: 12px;
  background-color: #f8fafc;
  transition: all 0.3s ease;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: #f5f9ff;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  }
}

// 測試對話區域
.test-dialog-container {
  padding: 8px;

  .test-header {
    display: flex;
    align-items: center;
  }

  .test-input {
    border-radius: 8px;

    :deep(.q-field__control) {
      background-color: #f8fafc;
    }
  }

  .response-card {
    border-radius: 10px;
    background-color: #f8fafc;
    border-left: 4px solid #1976d2;
    transition: all 0.3s ease;
    margin-left: 36px;

    &:hover {
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    }
  }
}

// 響應式調整
@media (max-width: 768px) {
  .settings-card {
    border-radius: 8px;
  }

  .response-card {
    margin-left: 0;
  }
}
</style>
