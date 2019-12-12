const { SpeechClient } = require('@google-cloud/speech')
const WebSocket = require('ws')
const decode = require('audio-decode')
const toWav = require('audiobuffer-to-wav')
require('opus.js')

process.env.GOOGLE_APPLICATION_CREDENTIALS = './googlecloud.json'
process.env.PORT = process.env.PORT || 4321

function transcribeAudio(content) {
  if (!content) return null
  const speechClient = new SpeechClient()
  const audio = { content }
  const config = {
    sampleRateHertz: 48000,
    languageCode: 'it-IT',
  }
  const request = {
    audio: audio,
    config: config,
  }
  return speechClient.recognize(request).then(response => {
    const { results } = response[0]
    const transcription = results.map(result => result.alternatives[0].transcript).join('\n')
    return transcription
  })
}

function convertAudio(opusBase64) {
  const buff = new Buffer(opusBase64.split(',')[1], 'base64')
  return decode(buff)
    .then(audioBuffer => {
      const wave = toWav(audioBuffer)
      const waveBase64 = Buffer.from(wave).toString('base64')
      return waveBase64
    })
    .catch(err => {
      console.log(err)
    })
}

const wss = new WebSocket.Server({ port: process.env.PORT })

wss.on('listening', () => {
  console.log('wella')
})

wss.on('connection', ws => {
  ws.on('message', message => {
    convertAudio(message)
      .then(transcribeAudio)
      .then(results => ws.send(results))
  })
})
