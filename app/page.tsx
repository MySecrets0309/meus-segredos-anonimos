'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Home() {
  const [secrets, setSecrets] = useState<any[]>([])
  const [newSecret, setNewSecret] = useState('')

  useEffect(() => {
    getSecrets()
  }, [])

  async function getSecrets() {
    const { data } = await supabase
      .from('secrets')
      .select('*')
      .order('created_at', { ascending: false })
    setSecrets(data || [])
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    if (newSecret === '') return

    await supabase.from('secrets').insert({ content: newSecret })
    
    setNewSecret('')
    getSecrets()
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h1>Meus Segredos Anônimos</h1>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={newSecret}
          onChange={(e) => setNewSecret(e.target.value)}
          placeholder="Digite seu segredo..."
          rows={4}
          style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px' }}>Postar Anonimamente</button>
      </form>

      <h2>Segredos:</h2>
      {secrets.length === 0 && <p>Nenhum segredo ainda. Seja o primeiro!</p>}
      {secrets.map((secret) => (
        <div key={secret.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', borderRadius: '8px' }}>
          <p>{secret.content}</p>
          <small>{new Date(secret.created_at).toLocaleString('pt-BR')}</small>
        </div>
      ))}
    </div>
  )
}