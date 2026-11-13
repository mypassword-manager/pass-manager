<script setup>
import { ref } from 'vue'

const activeFaq = ref(null)
const faqs = [
  { q: 'How is my data encrypted?', a: 'All data is encrypted in your browser using AES-GCM 256-bit encryption before reaching our servers. Only you hold the master passphrase.' },
  { q: 'What happens if I forget my master passphrase?', a: 'Due to our zero-knowledge architecture, we cannot recover or reset your master passphrase. If lost, your encrypted vault cannot be unlocked.' },
  { q: 'Can I access my vault from multiple devices?', a: 'Yes! Simply sign in with your account credentials and enter your master passphrase to unlock your records on any device.' },
  { q: 'How does the Username & PIN login work?', a: 'In addition to username verification, high security actions and logins require an encrypted PIN verified server-side with strict rate-limiting.' }
]

function toggleFaq(index) {
  activeFaq.value = activeFaq.value === index ? null : index
}
</script>

<template>
  <div class="flex flex-col flex-1">
    <!-- Hero Section -->
    <section class="relative overflow-hidden py-20 px-4 sm:px-8 text-center">
      <div class="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950"></div>
      <div class="mx-auto max-w-4xl space-y-6">
        <div class="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300">
          <span class="h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
          Zero-Knowledge Client-Side Encryption
        </div>
        <h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Your Personal Vault for <span class="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Secure Credentials</span>
        </h1>
        <p class="mx-auto max-w-2xl text-lg text-slate-400">
          Store personal identity details, secure notes, and website logins with impenetrable zero-knowledge browser encryption. Accessible anywhere, controlled exclusively by you.
        </p>
        <div class="flex flex-wrap justify-center gap-4 pt-4">
          <router-link to="/signup" class="rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition">
            Create Free Account
          </router-link>
          <router-link to="/signin" class="rounded-xl border border-slate-700 bg-slate-900/60 px-8 py-3.5 text-base font-semibold text-slate-200 hover:bg-slate-800 transition">
            Sign In to Vault
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features Banner -->
    <section class="py-16 px-4 sm:px-8 border-y border-slate-800/80 bg-slate-900/40">
      <div class="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="glass-panel rounded-2xl p-6 space-y-3">
          <div class="h-12 w-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xl">🔒</div>
          <h3 class="text-xl font-semibold text-white">Client-Side Encryption</h3>
          <p class="text-slate-400 text-sm">Your data is encrypted locally with AES-GCM before upload. Our servers never see your plaintext data or passphrase.</p>
        </div>
        <div class="glass-panel rounded-2xl p-6 space-y-3">
          <div class="h-12 w-12 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold text-xl">⚡</div>
          <h3 class="text-xl font-semibold text-white">Lightning Fast Search</h3>
          <p class="text-slate-400 text-sm">Instant fuzzy search across your titles, apps, and websites directly in browser memory without server queries.</p>
        </div>
        <div class="glass-panel rounded-2xl p-6 space-y-3">
          <div class="h-12 w-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-xl">🛡️</div>
          <h3 class="text-xl font-semibold text-white">Multiple Sign-In Methods</h3>
          <p class="text-slate-400 text-sm">Flexible login options including Email & Password, Username & Password, or secure Username & PIN with email OTP verification.</p>
        </div>
      </div>
    </section>

    <!-- FAQ Accordion -->
    <section class="py-20 px-4 sm:px-8 max-w-4xl mx-auto w-full">
      <div class="text-center space-y-3 mb-12">
        <h2 class="text-3xl font-bold text-white">Frequently Asked Questions</h2>
        <p class="text-slate-400">Everything you need to know about your personal vault security.</p>
      </div>
      <div class="space-y-4">
        <div v-for="(faq, index) in faqs" :key="index" class="glass-panel rounded-xl overflow-hidden border border-slate-800">
          <button @click="toggleFaq(index)" class="w-full flex items-center justify-between p-5 text-left font-semibold text-white hover:bg-slate-800/40 transition">
            <span>{{ faq.q }}</span>
            <span class="transform transition-transform" :class="{ 'rotate-180': activeFaq === index }">▼</span>
          </button>
          <div v-if="activeFaq === index" class="p-5 pt-0 text-slate-400 text-sm border-t border-slate-800/60">
            {{ faq.a }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
