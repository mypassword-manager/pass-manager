// Client-side encryption using Web Crypto API (AES-GCM 256-bit with PBKDF2)

export async function deriveKey(passphrase, salt) {
  const enc = new TextEncoder()
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptData(dataObject, passphrase) {
  const salt = window.crypto.getRandomValues(new Uint8Array(16))
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(passphrase, salt)
  
  const enc = new TextEncoder()
  const encoded = enc.encode(JSON.stringify(dataObject))
  
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encoded
  )

  // Package salt, iv, and ciphertext into a base64 versioned envelope
  return {
    version: 1,
    salt: btoa(String.fromCharCode(...salt)),
    iv: btoa(String.fromCharCode(...iv)),
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext)))
  }
}

export async function decryptData(encryptedEnvelope, passphrase) {
  try {
    const salt = Uint8Array.from(atob(encryptedEnvelope.salt), c => c.charCodeAt(0))
    const iv = Uint8Array.from(atob(encryptedEnvelope.iv), c => c.charCodeAt(0))
    const ciphertext = Uint8Array.from(atob(encryptedEnvelope.ciphertext), c => c.charCodeAt(0))
    
    const key = await deriveKey(passphrase, salt)
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ciphertext
    )
    
    const dec = new TextDecoder()
    return JSON.parse(dec.decode(decrypted))
  } catch (err) {
    throw new Error('Incorrect master passphrase or corrupted backup.')
  }
}
