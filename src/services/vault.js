import { supabase } from './supabase'
import { encryptData, decryptData } from './crypto'

class VaultService {
  constructor() {
    this.masterPassphrase = null
    this.unlocked = false
    this.inactivityTimer = null
  }

  setPassphrase(passphrase) {
    this.masterPassphrase = passphrase
    this.unlocked = true
    this.resetInactivityTimer()
  }

  lock() {
    this.masterPassphrase = null
    this.unlocked = false
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer)
  }

  resetInactivityTimer() {
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer)
    // Auto lock after 10 minutes of inactivity
    this.inactivityTimer = setTimeout(() => {
      this.lock()
      window.dispatchEvent(new CustomEvent('vault-locked'))
    }, 10 * 60 * 1000)
  }

  async getEntries(userId) {
    if (!this.unlocked || !this.masterPassphrase) throw new Error('Vault is locked')
    
    const { data, error } = await supabase
      .from('vault_entries')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error

    const entries = []
    for (const row of data) {
      try {
        const decrypted = await decryptData(row.encrypted_payload, this.masterPassphrase)
        entries.push({ id: row.id, type: row.type, ...decrypted, updated_at: row.updated_at })
      } catch (e) {
        console.error('Failed to decrypt record ID:', row.id)
      }
    }
    return entries
  }

  async saveEntry(userId, type, payload) {
    if (!this.unlocked || !this.masterPassphrase) throw new Error('Vault is locked')

    const encryptedPayload = await encryptData(payload, this.masterPassphrase)

    const { data, error } = await supabase
      .from('vault_entries')
      .insert({
        user_id: userId,
        type: type,
        encrypted_payload: encryptedPayload
      })
      .select()
      .single()

    if (error) throw error
    return { id: data.id, type, ...payload }
  }

  async updateEntry(entryId, type, payload) {
    if (!this.unlocked || !this.masterPassphrase) throw new Error('Vault is locked')

    const encryptedPayload = await encryptData(payload, this.masterPassphrase)

    const { error } = await supabase
      .from('vault_entries')
      .update({
        encrypted_payload: encryptedPayload,
        updated_at: new Date().toISOString()
      })
      .eq('id', entryId)

    if (error) throw error
    return { id: entryId, type, ...payload }
  }

  async deleteEntry(entryId) {
    const { error } = await supabase
      .from('vault_entries')
      .delete()
      .eq('id', entryId)

    if (error) throw error
  }
}

export const vaultService = new VaultService()
