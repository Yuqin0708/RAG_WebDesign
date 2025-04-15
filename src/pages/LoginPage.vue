<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card flat bordered class="login-card q-pa-lg">
      <q-card-section class="text-center">
        <div class="text-h5 q-mb-md">醫院智能助手管理系統</div>
        <div class="text-subtitle2 text-grey-7">請登入以繼續</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input filled v-model="username" label="帳號" :rules="[val => !!val || '請輸入帳號']">
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input filled type="password" v-model="password" label="密碼" :rules="[val => !!val || '請輸入密碼']">
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
          </q-input>

          <div class="flex justify-between items-center">
            <q-checkbox v-model="rememberMe" label="記住我" />
            <q-btn flat color="primary" label="忘記密碼？" />
          </div>

          <q-btn unelevated color="primary" size="lg" class="full-width" label="登入" type="submit" :loading="loading" />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()

const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)

const onSubmit = async () => {
  try {
    loading.value = true

    // TODO: 這裡實現真正的登入邏輯，與後端 API 交互
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模擬登入成功
    if (username.value === 'admin' && password.value === 'password') {
      // 儲存認證信息
      localStorage.setItem('auth_token', 'dummy_token')

      // 登入成功後跳轉
      router.push('/admin/knowledge')

      $q.notify({
        color: 'positive',
        message: '登入成功',
        icon: 'check_circle'
      })
    } else {
      // 登入失敗
      $q.notify({
        color: 'negative',
        message: '帳號或密碼錯誤',
        icon: 'error'
      })
    }
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: '登入時發生錯誤',
      icon: 'error'
    })
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: 400px;
}
</style>
