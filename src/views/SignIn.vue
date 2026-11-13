<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../services/supabase'

const router = useRouter()
const loginMethod = ref('email_pass') // email_pass, user_pass, user_pin

const email = ref('')
const username = ref('')
const password = ref('')
const pin = ref('')
const errorMsg = ref('')
const loading = ref(false)

async function handleSignIn() {
  errorMsg.value = ''
  loading.value = true

  try {
    if (loginMethod.value === 'email_pass') {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
      })
      if (error) throw error
      router.push('/dashboard')
    } else {
      // For username-based methods, call Supabase / Cloudflare Worker endpoint
      errorMsg.value = 'Username sign-in method requires Cloudflare Worker integration. Please use Email & Password for immediate sign-in.'
    }
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="glass-panel w-full max-w-md rounded-2xl p-8 space-y-6 shadow-2xl">
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-bold tracking-tight text-white">Sign In to Your Vault</h2>
        <p class="text-sm text-slate-400">Select your preferred login method below</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Select Login Method</label>
          <select v-model="loginMethod" class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none">
            <option value="email_pass">1. Sign in with Email & Password</option>
            <option value="user_pass">2. Sign in with Username & Password</option>
            <option value="user_pin">3. Sign in with Username & PIN</option>
          </select>
        </div>

        <div v-if="errorMsg" class="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
          {{ errorMsg }}
        </div>

        <form @submit.prevent="handleSignIn" class="space-y-4">
          <div v-if="loginMethod === 'email_pass'">
            <label class="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
            <input v-model="email" type="email" required class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="name@example.com" />
          </div>

          <div v-else>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Username</label>
            <input v-model="username" type="text" required class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="your_username" />
          </div>

          <div v-if="loginMethod !== 'user_pin'">
            <label class="block text-xs font-semibold text-slate-400 mb-1">Password</label>
            <input v-model="password" type="password" required class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="••••••••••••" />
          </div>

          <div v-if="loginMethod === 'user_pin'">
            <label class="block text-xs font-semibold text-slate-400 mb-1">6-Digit PIN</label>
            <input v-model="pin" type="password" maxlength="6" required class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm tracking-widest text-white focus:border-indigo-500 focus:outline-none" placeholder="******" />
          </div>

          <button type="submit" :disabled="loading" class="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition disabled:opacity-50">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="flex items-center justify-between text-xs text-slate-400 pt-2">
          <router-link to="/signup" class="hover:text-indigo-400 transition">Create Account</router-link>
          <span class="hover:text-indigo-400 transition cursor-pointer">Forgot Password?</span>
        </div>
      </div>
    </div>
  </div>
</template>
