<template>
  <div class="login-page">
    <div class="login-container">
      <div class="row">
        <!-- 左側圖片區 -->
        <div class="col-12 col-md-6 welcome-panel">
          <div class="welcome-content">
            <div class="logo-container q-mb-xl">
              <q-icon name="local_hospital" size="40px" color="white" class="logo-icon" />
              <div class="text-h4 text-white q-ml-sm">Asktria</div>
            </div>

            <h4 class="text-white q-mb-md">醫療智能助手管理平台</h4>
            <p class="text-grey-3 q-mb-xl">
              結合AI與醫療專業知識，提供高效的醫院服務流程
            </p>

            <div class="feature-list q-my-xl">
              <div class="feature-item">
                <q-icon name="check_circle" color="green" size="24px" />
                <span class="q-ml-sm text-white">智能分流，減少等候時間</span>
              </div>
              <div class="feature-item q-my-md">
                <q-icon name="check_circle" color="green" size="24px" />
                <span class="q-ml-sm text-white">詳盡醫療信息，滿足患者需求</span>
              </div>
              <div class="feature-item">
                <q-icon name="check_circle" color="green" size="24px" />
                <span class="q-ml-sm text-white">數據分析，優化醫院服務</span>
              </div>
            </div>
          </div>

          <div class="wave-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
              <path fill="#ffffff" fill-opacity="1"
                d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,245.3C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
              </path>
            </svg>
          </div>
        </div>

        <!-- 右側登入表單 -->
        <div class="col-12 col-md-6 flex flex-center login-form-container">
          <div class="login-form" :class="{ 'shake-animation': loginFailed }">
            <div class="text-center q-mb-xl">
              <div class="text-h4 text-weight-bold q-mb-md text-primary">歡迎回來</div>
              <div class="text-subtitle1 text-grey-7">請登入您的帳號以繼續</div>
            </div>

            <q-form @submit="onSubmit" class="q-gutter-y-md">
              <q-input outlined v-model="username" label="管理員帳號" class="input-field" :rules="[val => !!val || '請輸入帳號']"
                :disable="loading">
                <template v-slot:prepend>
                  <q-icon name="person" color="primary" />
                </template>
              </q-input>

              <q-input outlined type="password" v-model="password" label="密碼" class="input-field"
                :rules="[val => !!val || '請輸入密碼']" :disable="loading" @keyup.enter="onSubmit">
                <template v-slot:prepend>
                  <q-icon name="lock" color="primary" />
                </template>
              </q-input>

              <div v-if="errorMessage" class="text-negative q-mb-md">
                <q-icon name="error" size="sm" />
                <span class="q-ml-xs">{{ errorMessage }}</span>
              </div>

              <div class="flex justify-between items-center q-mt-md">
                <q-checkbox v-model="rememberMe" label="記住我" color="primary" :disable="loading" />
                <q-btn flat color="primary" label="忘記密碼？" class="text-weight-medium" :disable="loading" />
              </div>

              <q-btn unelevated color="primary" size="lg" class="full-width q-py-sm q-mt-lg login-btn" label="登入系統"
                type="submit" :loading="loading" />

              <div class="text-center q-mt-md text-grey-8">
                遇到問題？請聯繫 <a href="#" class="text-primary">系統管理員</a>
              </div>
            </q-form>

            <q-card flat bordered class="system-status-card q-pa-sm q-mt-xl">
              <q-item>
                <q-item-section avatar>
                  <q-icon name="info" color="info" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>系統狀態: <span class="text-positive">正常運行中</span></q-item-label>
                  <q-item-label caption>最近更新: 2025/04/15 09:30</q-item-label>
                </q-item-section>
              </q-item>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/user-store'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)
const initialized = ref(false)
const loginFailed = ref(false)
const errorMessage = ref('')

// 添加一些動畫效果
onMounted(() => {
  // 檢查是否已經登入
  if (userStore.checkAuth()) {
    router.push('/admin/knowledge').catch(err => {
      console.error('Navigation error:', err);
    });
    return;
  }

  // 從localStorage嘗試獲取保存的用戶名
  const savedUsername = localStorage.getItem('remembered_username')
  if (savedUsername) {
    username.value = savedUsername
    rememberMe.value = true
  }

  // 添加動畫延遲，使頁面順暢呈現
  setTimeout(() => {
    initialized.value = true
  }, 100)
})

const onSubmit = async () => {
  // 重置錯誤狀態
  errorMessage.value = ''
  loginFailed.value = false

  try {
    loading.value = true

    // 使用store進行登入
    const success = await userStore.login(username.value, password.value)

    if (success) {
      // 保存記住的用戶名
      if (rememberMe.value) {
        localStorage.setItem('remembered_username', username.value)
      } else {
        localStorage.removeItem('remembered_username')
      }

      // 顯示加載中動畫
      $q.loading.show({
        message: '正在加載系統...',
        spinnerColor: 'primary',
        spinnerSize: 40
      })

      // 延遲一下再跳轉，給用戶更好的視覺體驗
      setTimeout(() => {
        $q.loading.hide()

        // 登入成功後跳轉
        const redirectPath = route.query.redirect as string || '/admin/knowledge'
        router.push(redirectPath).catch(err => console.error('Navigation error:', err))

        $q.notify({
          color: 'positive',
          message: `歡迎回來，${username.value}！`,
          icon: 'check_circle',
          position: 'top',
          timeout: 2000
        })
      }, 1000)
    } else {
      // 登入失敗
      errorMessage.value = '帳號或密碼錯誤'
      loginFailed.value = true

      $q.notify({
        color: 'negative',
        message: '登入失敗：帳號或密碼錯誤',
        icon: 'error',
        position: 'top',
        timeout: 3000
      })

      // 5秒後重置晃動狀態
      setTimeout(() => {
        loginFailed.value = false
      }, 1000)
    }
  } catch (error) {
    errorMessage.value = '登入時發生錯誤，請稍後再試'

    $q.notify({
      color: 'negative',
      message: '登入時發生錯誤',
      icon: 'error',
      position: 'top'
    })
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss">
.login-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  overflow: hidden;
}

.login-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
  height: 100vh;
  max-height: 700px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.welcome-panel {
  background: linear-gradient(135deg, #3f51b5 0%, #1a237e 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3rem;
  overflow: hidden;
  height: 100%;
}

.welcome-content {
  position: relative;
  z-index: 2;
  padding: 2rem;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo-icon {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 8px;
}

.feature-item {
  display: flex;
  align-items: center;
  margin: 1rem 0;
}

.wave-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1;
}

.login-form-container {
  background-color: white;
  padding: 2rem;
  height: 100%;
}

.login-form {
  width: 100%;
  max-width: 400px;
  transition: all 0.3s ease;
}

.input-field {
  border-radius: 8px;
  margin-bottom: 1rem;
}

.login-btn {
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: bold;
  margin-top: 2rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(63, 81, 181, 0.2);
  }
}

.system-status-card {
  border-radius: 8px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
}

// 晃動動畫
@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }

  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}

.shake-animation {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
}

// 響應式設計
@media (max-width: 992px) {
  .login-container {
    max-height: none;
    height: auto;
    position: relative;
    top: 0;
    left: 0;
    transform: none;
    border-radius: 0;
    box-shadow: none;
  }

  .welcome-panel {
    min-height: 40vh;
    padding: 2rem;
  }

  .login-form-container {
    padding: 2rem 1rem;
    min-height: 60vh;
  }
}
</style>
