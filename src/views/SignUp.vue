<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../services/supabase'

const router = useRouter()
const signUpMethod = ref('email_pass') // email_pass, user_pass, user_pin

const fullName = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const pin = ref('')
const confirmPin = ref('')
const errorMsg = ref('')
const successMsg = ref('')
const loading = ref(false)

async function handleSignUp() {
  errorMsg.value = ''
  successMsg.value = ''

  if ((signUpMethod.value.includes('pass')) && password.value !== confirmPassword.value) {
    errorMsg.value = 'Passwords do not match.'
    return
  }

  if (signUpMethod.value === 'user_pin' && pin.value !== confirmPin.value) {
    errorMsg.value = 'PINs do not match.'
    return
  }

  loading.value = true

  try {
    if (signUpMethod.value === 'email_pass') {
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          data: { full_name: fullName.value, username: username.value }
        }
      })
      if (error) throw error
      successMsg.value = 'Registration successful! Please check your email to verify your account before signing in.'
    } else {
      successMsg.value = 'Username & PIN/Password registration requires Cloudflare Worker integration. Please use Email & Password for immediate registration.'
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
        <h2 class="text-2xl font-bold tracking-tight text-white">Create Your Vault Account</h2>
        <p class="text-sm text-slate-400">Choose your preferred sign-up method</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Select Sign-up Method</label>
          <select v-model="signUpMethod" class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none">
            <option value="email_pass">1. Sign up with Email & Password</option>
            <option value="user_pass">2. Sign up with Username & Password</option>
            <option value="user_pin">3. Sign up with Username & PIN</option>
          </select>
        </div>

        <div v-if="errorMsg" class="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
          {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300">
          {{ successMsg }}
        </div>

        <form @submit.prevent="handleSignUp" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
            <input v-model="fullName" type="text" required class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="John Doe" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Username</label>
            <input v-model="username" type="text" required class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="johndoe" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
            <input v-model="email" type="email" required class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="name@example.com" />
          </div>

          <template v-if="signUpMethod !== 'user_pin'">
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">Password</label>
              <input v-model="password" type="password" required class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="••••••••••••" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">Confirm Password</label>
              <input v-model="confirmPassword" type="password" required class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="••••••••••••" />
            </div>
          </template>

          <template v-else>
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">6-Digit PIN</label>
              <input v-model="pin" type="password" maxlength="6" required class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm tracking-widest text-white focus:border-indigo-500 focus:outline-none" placeholder="******" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">Confirm 6-Digit PIN</label>
              <input v-model="confirmPin" type="password" maxlength="6" required class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm tracking-widest text-white focus:border-indigo-500 focus:outline-none" placeholder="******" />
            </div>
          </template>

          <button type="submit" :disabled="loading" class="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition disabled:opacity-50">
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

        <div class="text-center text-xs text-slate-400 pt-2">
          Already have an account? <router-link to="/signin" class="text-indigo-400 hover:underline">Sign In</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
