<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../services/supabase'
import { vaultService } from '../services/vault'
import PersonalEntryModal from './PersonalEntryModal.vue'
import LoginEntryModal from './LoginEntryModal.vue'

const router = useRouter()
const user = ref(null)
const masterPassphrase = ref('')
const isUnlocked = ref(false)
const unlockError = ref('')

const activeTab = ref('personal') // 'personal' or 'logins'
const searchQuery = ref('')
const entries = ref([])
const loading = ref(false)

const showPersonalModal = ref(false)
const showLoginModal = ref(false)
const editingEntry = ref(null)

const deleteModalOpen = ref(false)
const entryToDelete = ref(null)

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    router.push('/signin')
    return
  }
  user.value = session.user
})

async function unlockVault() {
  unlockError.value = ''
  if (!masterPassphrase.value) {
    unlockError.value = 'Please enter your master passphrase.'
    return
  }

  try {
    vaultService.setPassphrase(masterPassphrase.value)
    isUnlocked.value = true
    await loadEntries()
  } catch (err) {
    unlockError.value = 'Failed to unlock vault.'
    vaultService.lock()
    isUnlocked.value = false
  }
}

async function loadEntries() {
  loading.value = true
  try {
    entries.value = await vaultService.getEntries(user.value.id)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function lockVault() {
  vaultService.lock()
  isUnlocked.value = false
  masterPassphrase.value = ''
  entries.value = []
}

const filteredEntries = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  const tabFiltered = entries.value.filter(e => activeTab.value === 'personal' ? e.type === 'personal' : e.type === 'login')
  
  if (!q) return tabFiltered

  return tabFiltered.filter(e => {
    const titleMatch = (e.title || '').toLowerCase().includes(q)
    const nameMatch = (e.name || e.website_name || '').toLowerCase().includes(q)
    return titleMatch || nameMatch
  }).sort((a, b) => {
    // Rank items beginning with search query first
    const aText = (a.title || a.website_name || '').toLowerCase()
    const bText = (b.title || b.website_name || '').toLowerCase()
    const aStarts = aText.startsWith(q) ? 0 : 1
    const bStarts = bText.startsWith(q) ? 0 : 1
    return aStarts - bStarts
  })
})

function openAddModal() {
  editingEntry.value = null
  if (activeTab.value === 'personal') {
    showPersonalModal.value = true
  } else {
    showLoginModal.value = true
  }
}

function openEditModal(entry) {
  editingEntry.value = entry
  if (entry.type === 'personal') {
    showPersonalModal.value = true
  } else {
    showLoginModal.value = true
  }
}

function confirmDelete(entry) {
  entryToDelete.value = entry
  deleteModalOpen.value = true
}

async function handleDelete() {
  if (!entryToDelete.value) return
  try {
    await vaultService.deleteEntry(entryToDelete.value.id)
    entries.value = entries.value.filter(e => e.id !== entryToDelete.value.id)
    deleteModalOpen.value = false
    entryToDelete.value = null
  } catch (err) {
    alert('Failed to delete entry: ' + err.message)
  }
}

function exportBackup() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries.value, null, 2))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute("href", dataStr)
  downloadAnchor.setAttribute("download", `vault_backup_${new Date().toISOString().slice(0,10)}.json`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}
</script>

<template>
  <div class="flex flex-1 flex-col py-8 px-4 sm:px-8 max-w-7xl mx-auto w-full">
    <!-- Vault Locked Screen -->
    <div v-if="!isUnlocked" class="flex flex-1 items-center justify-center">
      <div class="glass-panel w-full max-w-md rounded-2xl p-8 space-y-6 text-center shadow-2xl">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 text-3xl">
          🔒
        </div>
        <div class="space-y-2">
          <h2 class="text-2xl font-bold text-white">Your Vault is Locked</h2>
          <p class="text-sm text-slate-400">Enter your master passphrase to decrypt your records.</p>
        </div>

        <div v-if="unlockError" class="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
          {{ unlockError }}
        </div>

        <form @submit.prevent="unlockVault" class="space-y-4 text-left">
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Master Passphrase</label>
            <input v-model="masterPassphrase" type="password" required class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="Enter master passphrase" />
          </div>
          <button type="submit" class="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition">
            Unlock Vault
          </button>
        </form>
      </div>
    </div>

    <!-- Vault Unlocked Dashboard -->
    <div v-else class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">Vault Dashboard</h1>
          <p class="text-sm text-slate-400">Manage your encrypted personal data and app credentials safely.</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button @click="exportBackup" class="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 transition">
            Export Backup
          </button>
          <button @click="lockVault" class="rounded-xl bg-amber-600/20 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-600/30 transition">
            Lock Vault
          </button>
        </div>
      </div>

      <!-- Search and Actions Bar -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="w-full sm:w-96">
          <input v-model="searchQuery" type="text" class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="Search by title, website, or app..." />
        </div>
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <div class="flex rounded-xl bg-slate-900 p-1 border border-slate-800 w-full sm:w-auto">
            <button @click="activeTab = 'personal'" :class="{ 'bg-indigo-600 text-white': activeTab === 'personal', 'text-slate-400': activeTab !== 'personal' }" class="flex-1 sm:flex-none rounded-lg px-4 py-2 text-xs font-semibold transition">
              Personal Info
            </button>
            <button @click="activeTab = 'logins'" :class="{ 'bg-indigo-600 text-white': activeTab === 'logins', 'text-slate-400': activeTab !== 'logins' }" class="flex-1 sm:flex-none rounded-lg px-4 py-2 text-xs font-semibold transition">
              Website & App Logins
            </button>
          </div>
          <button @click="openAddModal" class="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition whitespace-nowrap">
            + Add Entry
          </button>
        </div>
      </div>

      <!-- Entries List -->
      <div class="space-y-4">
        <div v-if="loading" class="text-center py-12 text-slate-500">Decrypting vault entries...</div>
        <div v-else-if="filteredEntries.length === 0" class="glass-panel rounded-2xl p-12 text-center space-y-3">
          <div class="text-3xl">📭</div>
          <h3 class="text-lg font-semibold text-white">No entries found</h3>
          <p class="text-sm text-slate-400">Click "+ Add Entry" to securely store your first record.</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="entry in filteredEntries" :key="entry.id" class="glass-panel rounded-2xl p-5 space-y-3 relative">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-lg font-bold text-white">{{ entry.title || entry.website_name }}</h3>
                <p class="text-xs text-indigo-400 font-medium">{{ entry.type === 'personal' ? entry.full_name : entry.url }}</p>
              </div>
              <div class="flex items-center gap-2">
                <button @click="openEditModal(entry)" class="rounded-lg bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 transition" title="Edit">✏️</button>
                <button @click="confirmDelete(entry)" class="rounded-lg bg-rose-600/20 p-2 text-rose-300 hover:bg-rose-600/30 transition" title="Delete">🗑️</button>
              </div>
            </div>

            <!-- Details based on type -->
            <div v-if="entry.type === 'personal'" class="space-y-1 text-xs text-slate-300 border-t border-slate-800 pt-3">
              <p><span class="text-slate-500">ID Number:</span> {{ entry.national_id }}</p>
              <p><span class="text-slate-500">Phone:</span> {{ entry.phone }}</p>
              <p><span class="text-slate-500">Email:</span> {{ entry.email }}</p>
            </div>
            <div v-else class="space-y-1 text-xs text-slate-300 border-t border-slate-800 pt-3">
              <p><span class="text-slate-500">Username:</span> {{ entry.username }}</p>
              <p><span class="text-slate-500">Password:</span> ••••••••</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div class="glass-panel w-full max-w-sm rounded-2xl p-6 space-y-4">
        <h3 class="text-lg font-bold text-white">Confirm Deletion</h3>
        <p class="text-sm text-slate-400">Are you sure you want to delete this encrypted record? This action cannot be undone.</p>
        <div class="flex justify-end gap-3 pt-2">
          <button @click="deleteModalOpen = false" class="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">Cancel</button>
          <button @click="handleDelete" class="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500 transition">Delete</button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <PersonalEntryModal v-if="showPersonalModal" :entry="editingEntry" @close="showPersonalModal = false" @saved="loadEntries" />
    <LoginEntryModal v-if="showLoginModal" :entry="editingEntry" @close="showLoginModal = false" @saved="loadEntries" />
  </div>
</template>
