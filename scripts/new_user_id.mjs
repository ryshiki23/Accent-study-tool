// 利用者用のランダム ID（22 文字）と URL を作る。
// 使い方: node scripts/new_user_id.mjs https://<サイトのURL>
import { randomBytes } from 'node:crypto'

const id = randomBytes(16).toString('base64url').slice(0, 22)
const base = (process.argv[2] || 'https://accent-study-tool.vercel.app').replace(/\/$/, '')
console.log(`ID : ${id}`)
console.log(`URL: ${base}/?u=${id}`)
