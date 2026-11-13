<script setup>
import { ref } from 'vue'
import { vaultService } from '../services/vault'
import { supabase } from '../services/supabase'

const props = defineProps({ entry: Object })
const emit = defineEmits(['close', 'saved'])

const title = ref(props.entry?.title || '')
const fullName = ref(props.entry?.full_name || '')
const nationalId = ref(props.entry?.national_id || '')
const phone = ref(props.entry?.phone || '')
const email = ref(props.entry?.email || '')
const address = ref(props.entry?.address || '')
const notes = ref(props.entry?.notes || '')
const loading = ref(false)

async function save() {
  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      title: title.value,
      full_name: fullName.value,
      national_id: nationalId.value,
      phone: phone.value,
      email: email.value,
      address: address.value,
      notes: notes.value
    }

    if (props.entry?.id) {
      await vaultService.updateEntry(props.entry.id, 'personal', payload)
    } else {
      await vaultService.saveEntry(user.id, 'personal', payload)
    }
    emit('saved')
    emit('close')
  } catch (err) {
    alert('Error saving entry: ' + err.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 overflow-y-auto">
    <div class="glass-panel w-full max-w-lg rounded-2xl p-6 space-y-4 my-8">
      <h3 class="text-xl font-bold text-white">{{ entry ? 'Edit Personal Info' : 'Add Personal Info' }}</h3>
      
      <form @submit.prevent="save" class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Custom Title</label>
          <input v-model="title" type="text" required class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="My Passport Info" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
          <input v-model="fullName" type="text" required class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="John Doe" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">IC or National ID</label>
          <input v-model="nationalId" type="text" class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="ID Number" />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
            <input v-model="phone" type="text" class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="+1234567890" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Email</label>
            <input v-model="email" type="email" class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="name@example.com" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Address</label>
          <textarea v-model="address" rows="2" class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="Home address"></textarea>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Notes</label>
          <textarea v-model="notes" rows="2" class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="Additional notes"></textarea>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button type="button" @click="$emit('close')" class="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">Cancel</button>
          <button type="submit" :disabled="loading" class="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition disabled:opacity-50">
            {{ loading ? 'Saving...' : 'Save Entry' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
