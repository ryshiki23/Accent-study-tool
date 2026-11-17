/** 発音（Web Speech API, en-US）。SPEC 4.5：S 類は単語ではなく例文だけを読む */
export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find((v) => v.lang === 'en-US' && v.localService) ??
    voices.find((v) => v.lang === 'en-US') ??
    voices.find((v) => v.lang.startsWith('en'))
  )
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
