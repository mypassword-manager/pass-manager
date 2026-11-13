<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../services/supabase'
import { vaultService } from '../services/vault'

const router = useRouter()
const user = ref(null)

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  user.value = session?.user || null

  supabase.auth.onAuthStateChange((_, session) => {
    user.value = session?.user || null
  })
})

async function handleSignOut() {
  vaultService.lock()
  await supabase.auth.signOut()
  router.push('/')
}
</script>

<template>
  <header class="glass-panel sticky top-0 z-50 border-b border-slate-800/80 px-4 py-3 sm:px-8">
    <div class="mx-auto flex max-w-7xl items-center justify-between">
      <router-link to="/" class="flex items-center gap-2">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-600/30">
          V
        </div>
        <span class="text-lg font-bold tracking-tight text-white">My Personal Vault</span>
      </router-link>

      <nav class="flex items-center gap-3">
        <template v-if="!user">
          <router-link to="/signin" class="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition">
            Sign In
          </router-link>
          <router-link to="/signup" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition">
            Create Account
          </router-link>
        </template>
        <template v-else>
          <router-link to="/dashboard" class="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 transition">
            Dashboard
          </router-link>
          <button @click="handleSignOut" class="rounded-lg bg-rose-600/20 px-4 py-2 text-sm font-medium text-rose-300 hover:bg-rose-600/30 transition">
            Sign Out
          </button>
        </template>
      </nav>
    </div>
  </header>
</template>
