// 搜索歌曲时返回的结果
export type  SMData = {
  total: string
  payload: Song[]
}

// 歌曲信息
export type Song = {
  name: string
  size: number
  singers: {
    id: string
    name: string
  }[]
  tags: string[]
  lyricUrl: string
  downloadUrl: string
  listenUrl: string
  albums?: {
    id: string
    name: string
    type: string
  }[]
}

// 搜索相关
// 搜索选项需搜索的设为 1，不需搜索的设为 0
export type Ops = {
  song: number
  album: number
  singer: number
  mvSong: number
  songlist: number
  tagSong: number
  bestShow: number
}
// 搜索的信息
export type SInfo = { keyword: string, page: number, ops: Ops }