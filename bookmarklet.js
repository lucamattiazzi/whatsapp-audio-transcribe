function blobToBase64(blob) {
  return new Promise(resolve => {
    const fileReader = new FileReader()
    fileReader.readAsDataURL(blob)
    fileReader.onloadend = () => resolve(fileReader.result)
  })
}

function sendBase64ToServer(base64) {
  const ws = new WebSocket('ws://localhost:4321')
  ws.onopen = () => {
    ws.send(base64)
  }
  ws.onmessage = e => {
    alert(e.data)
    ws.close()
  }
}

function readAudioElement(audioElement) {
  window
    .fetch(audioElement.src)
    .then(resp => resp.blob())
    .then(blobToBase64)
    .then(sendBase64ToServer)
}

for (const audioElement of Array.from(document.getElementsByTagName('audio'))) {
  const parent = audioElement.parentElement
  parent.oncontextmenu = () => readAudioElement(audioElement)
}
