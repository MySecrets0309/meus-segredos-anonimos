'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Secret = {
  id: number
  title: string
  content: string
  created_at: string
  user_id: string
}

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [secrets, setSecrets] = useState<Secret[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)    
  

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)
    }
    getSession()
  }, [supabase])

  useEffect(() => {
    if (session) {
      fetchSecrets()
    }
  }, [session])

  async function fetchSecrets() {
    const { data, error } = await supabase
     .from('secrets')
     .select('*')
     .order('created_at', { ascending: false })

    if (error) {
      console.log('Erro ao buscar:', error)
    } else {
      setSecrets(data || [])
    }
  }

  async function addSecret() {
    if (!title.trim()) {
      alert('Coloca um título aí, mano')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('Erro: Você precisa estar logado pra salvar')
      return
    }

    const { error } = await supabase
     .from('secrets')
     .insert({
        title: title,
        content: content,
        user_id: user.id
      })

    if (error) {
      alert('Erro ao salvar: ' + error.message)
    } else {
      alert('Segredo salvo com sucesso!')
      setTitle('')
      setContent('')
      await fetchSecrets()
    }
  }

  async function handleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
    })
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setSession(null)
    setSecrets([])
  }

  if (loading) {
    return <main><p>Carregando...</p></main>
  }

  return (
    <main style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Meus Segredos</h1>

      {!session? (
        <button onClick={handleSignIn}>
          Entrar com GitHub
        </button>
      ) : (
        <>
          <p>Logado como: {session.user.email}</p>
          <button onClick={handleSignOut}>Sair</button>

          <div style={{ marginTop: '20px', marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Título do segredo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />

            <textarea
              placeholder="Escreve seu segredo"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px', minHeight: '100px' }}
            />

            <button onClick={addSecret}>
              Salvar Segredo
            </button>
          </div>

          <h2>Seus Segredos Salvos:</h2>
          {secrets.length === 0? (
            <p>Nenhum segredo ainda. Cria o primeiro!</p>
          ) : (
            <ul>
              {secrets.map((secret) => (
                <li key={secret.id} style={{ marginBottom: '15px', border: '1px solid #ccc', padding: '10px' }}>
                  <strong>{secret.title}</strong>
                  <p>{secret.content}</p>
                  <small>{new Date(secret.created_at).toLocaleString('pt-BR')}</small>
                </li>
              ))}
            </ul>
             )}
         </>
      )}
    </main>
  )
}