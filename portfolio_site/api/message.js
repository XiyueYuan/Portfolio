import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  if (req.method !== 'POST') {
    res.status(405).end(JSON.stringify({ error: 'Only POST allowed' }))
    return
  }

  try {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const raw = Buffer.concat(chunks).toString('utf8')
    const body = raw ? JSON.parse(raw) : {}
    const { username, content } = body

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      res.status(500).end(JSON.stringify({ error: 'Supabase env missing' }))
      return
    }
    if (!username || !content) {
      res.status(400).end(JSON.stringify({ error: 'Missing username or content' }))
      return
    }

    const { error } = await supabase
      .from('messages')
      .insert([{ username, content }])

    if (error) {
      res.status(500).end(JSON.stringify({ error: error.message }))
      return
    }

    res.status(200).end(JSON.stringify({ status: 'ok' }))
  } catch (e) {
    res.status(500).end(JSON.stringify({ error: 'Server error' }))
  }
}
