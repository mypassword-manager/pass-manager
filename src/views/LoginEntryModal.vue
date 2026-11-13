<script setup>
import { ref } from 'vue'
import { vaultService } from '../services/vault'
import { supabase } from '../services/supabase'

const props = defineProps({ entry: Object })
const emit = defineEmits(['close', 'saved'])

const title = ref(props.entry?.title || '')
const websiteName = ref(props.entry?.website_name || '')
const url = ref(props.entry?.url || '')
const username = ref(props.entry?.username || '')
const email = ref(props.entry?.email || '')
const password = ref(props.entry?.password || '')
const notes = ref(props.entry?.notes || '')
const loading = ref(false)

async function save() {
  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      title: title.value,
      website_name: websiteName.value,
      url: url.value,
      username: username.value,
      email: email.value,
      password: password.value,
      notes: notes.value
    }

    if (props.entry?.id) {
      await vaultService.updateEntry(props.entry.id, 'login', payload)
    } else {
      await vaultService.saveEntry(user.id, 'login', payload)
    }
    emit('saved')
    emit('close')
  } catch (err) {
    alert('Error saving login: ' + err.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 overflow-y-auto">
    <div class="glass-panel w-full max-w-lg rounded-2xl p-6 space-y-4 my-8">
      <h3 class="text-xl font-bold text-white">{{ entry ? 'Edit Website & App Login' : 'Add Website & App Login' }}</h3>
      
      <form @submit.prevent="save" class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Custom Title</label>
          <input v-model="title" type="text" required class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="RCash Github" />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Website or App Name</label>
            <input v-model="websiteName" type="text" required class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="GitHub" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">URL</label>
            <input v-model="url" type="text" class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="https://github.com" />
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Username</label>
            <input v-model="username" type="text" class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="username" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Email</label>
            <input v-model="email" type="email" class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="name@example.com" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Password</label>
          <input v-model="password" type="text" required class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="SecurePassword123" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Notes</label>
          <textarea v-model="notes" rows="2" class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="Additional notes"></textarea>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button type="button" @click="$emit('close')" class="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">Cancel</button>
          <button type="submit" :disabled="loading" class="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition disabled:opacity-50">
            {{ loading ? 'Saving...' : 'Save Login' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
