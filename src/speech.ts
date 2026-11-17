/** 発音（Web Speech API, en-US）。SPEC 4.5：S 類は単語ではなく例文だけを読む */
export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

/** iOS / macOS の「おもしろ音声」（ロボット声など）。選ばない */
const NOVELTY = [
  'Albert', 'Bad News', 'Bahh', 'Bells', 'Boing', 'Bubbles', 'Cellos', 'Deranged', 'Good News', 'Hysterical',
  'Jester', 'Junior', 'Kathy', 'Organ', 'Superstar', 'Trinoids', 'Whisper', 'Wobble', 'Zarvox', 'Ralph', 'Fred',
  'Grandma', 'Grandpa', 'Eddy', 'Flo', 'Reed', 'Rocko', 'Sandy', 'Shelley',
]

/** 自然に聞こえる音声（上ほど優先）。端末にあるものを使う */
const PREFERRED = [
  /premium/i, /enhanced/i, /natural/i, /neural/i, // 高品質版（iPhone は設定からダウンロードできる）
  /^Ava\b/, /^Samantha\b/, /^Allison\b/, /^Susan\b/, /^Zoe\b/, /^Nicky\b/, /^Evan\b/, /^Tom\b/,
  /Google US English/, /Microsoft (Aria|Jenny|Guy)/,
]

export function rankVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const usable = voices.filter(
    (v) => v.lang.replace('_', '-').startsWith('en') && !NOVELTY.some((n) => v.name.startsWith(n)),
  )
  const score = (v: SpeechSynthesisVoice) => {
    const i = PREFERRED.findIndex((re) => re.test(v.name))
    const pref = i === -1 ? PREFERRED.length : i
    const us = v.lang.replace('_', '-') === 'en-US' ? 0 : 1
    return pref * 2 + us
  }
  return [...usable].sort((a, b) => score(a) - score(b))
}

let cached: SpeechSynthesisVoice | undefined
function pickVoice(): SpeechSynthesisVoice | undefined {
  if (!cached) cached = rankVoices(window.speechSynthesis.getVoices())[0]
  return cached
}
if (canSpeak) {
  // 音声の一覧はあとから読み込まれることがある
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    cached = undefined
  })
}

export function speak(text: string) {
  if (!canSpeak) return
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = 0.9
  const voice = pickVoice()
  if (voice) u.voice = voice
  synth.speak(u)
}
