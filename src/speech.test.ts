import { describe, expect, it } from 'vitest'
import { rankVoices } from './speech'

const v = (name: string, lang = 'en-US') => ({ name, lang }) as SpeechSynthesisVoice

describe('音声の選び方', () => {
  it('おもしろ音声は選ばず、高品質版を優先', () => {
    const voices = [v('Albert'), v('Zarvox'), v('Fred'), v('Samantha'), v('Ava (Premium)'), v('Thomas', 'fr-FR')]
    expect(rankVoices(voices).map((x) => x.name)).toEqual(['Ava (Premium)', 'Samantha'])
  })
  it('知らない名前でも英語なら候補に入る（米国英語が先）', () => {
    expect(rankVoices([v('Daniel', 'en-GB'), v('Aaron')]).map((x) => x.name)).toEqual(['Aaron', 'Daniel'])
  })
})
