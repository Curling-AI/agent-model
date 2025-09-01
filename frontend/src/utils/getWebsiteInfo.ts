export const getWebsiteTitle = async (url: string) => {
  try {
    const response = await fetch(url)
    const html = await response.text()

    const match = html.match(/<title>(.*?)<\/title>/i)
    if (match && match[1]) {
      return match[1]
    } else {
      return null
    }
  } catch {
    return null
  }
}

export const getYoutubeVideoInfo = async (url: string) => {
  try {
    const response = await fetch(url)
    const html = await response.text()

    const title = html.match(/<title>(.*?)<\/title>/i)
    const jsonMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{.*?\});/)
    let duration = null
    let channelName = null
    if (jsonMatch) {
      // 2. Faz parse do JSON
      const playerResponse = JSON.parse(jsonMatch[1])

      // 3. Extrai duração e nome do canal
      const durationSecs = parseInt(playerResponse.videoDetails.lengthSeconds, 10)
      const hours = Math.floor(durationSecs / 60 / 60)
      const mins = Math.floor((durationSecs - hours * 60 * 60) / 60)
      const sec = durationSecs - hours * 60 * 60 - mins * 60
      const pad = (num: number) => String(num).padStart(2, '0')
      duration = hours > 0 ? `${pad(hours)}:${pad(mins)}:${pad(sec)}` : `${pad(mins)}:${pad(sec)}`
      channelName = playerResponse.videoDetails.author
    }

    return { title: title && title[1] ? title[1] : null, duration, channelName }
  } catch {
    return { title: null, duration: null, channelName: null }
  }
}
