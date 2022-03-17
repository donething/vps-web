import {
  Alert,
  Checkbox, Divider, FormControlLabel,
  FormGroup,
  IconButton,
  ListItem,
  ListItemText, Stack,
  SxProps,
} from "@mui/material"
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import {Fragment, useEffect, useState} from "react"
import {useBetween} from "use-between"
import {LS_AUTH_KEY} from "./settings"
import {request} from "do-utils"
import {useSnackbar} from "../components/snackbar"
import ListInfinite from "../components/list_infinite"
import AutocompleteComp from "./autocomplete"
import {useBackdrop} from "../components/backdrop"

// 标签
const TAG = "[Music]"
// 存储搜索历史的键
const LS_HIST_KEY = "history_words"

// 搜索歌曲时返回的结果
interface SMResp {
  code: number
  msg: string
  data: {
    total: string
    payload: Song[]
  }
}

// 歌曲信息
interface Song {
  name: string
  size: number
  singers: {
    id: string
    name: string
  }[]
  tags: string[]
  lyricUrl: string
  download_url: string
  listen_url: string
  albums?: {
    id: string
    name: string
    type: string
  }[]
}

// 搜索选项
// 需搜索的设为 true，不需搜索的设为 false
class Ops {
  song: number = 1
  album: number = 1
  singer: number = 1
  mvSong: number = 1
  songlist: number = 1
  tagSong: number = 0
  bestShow: number = 1
}

// 共享歌曲的搜索结果，以便展示
const useSongList = () => {
  const [page, setPage] = useState(1)
  const [songList, setSongList] = useState<Array<Song>>([])
  const [total, setTotal] = useState(0)

  return {songList, setSongList, total, setTotal, page, setPage}
}

// 头部
const Header = (props: { sx?: SxProps }) => {
  // 搜索关键字
  const [kw, setKw] = useState("")
  // 搜索选项
  const [ops, setOps] = useState(new Ops())
  // 搜索历史
  const [historyWords, setHistoryWords] = useState<Array<string>>([])

  // 搜索结果，共享
  const {setSongList, setTotal, page, setPage} = useBetween(useSongList)
  // 共享 Snackbar
  const {setSbMsg} = useBetween(useSnackbar)
  // 共享 Backdrop
  const {setBackdropMsg} = useBetween(useBackdrop)

  // 搜索
  const onSearch = (keyword: string) => {
    console.log(TAG, "预备搜索：", keyword)
    if (!keyword.trim()) return

    // 清楚之前的记录
    setPage(1)
    setSongList([])
    setTotal(0)

    // 重开新的搜索
    setKw(keyword)

    // 添加关键字到历史记录
    let history: Array<string> = JSON.parse(localStorage.getItem(LS_HIST_KEY) || "[]")
    let index = history.findIndex(value => value === keyword)
    setHistoryWords(prev => {
      // 若不存在记录则添加，若有则提到最前面。总记录不超过指定数，否则删除最晚一条记录
      if (index === -1) {
        let nItems = [keyword, ...prev]
        if (prev.length === 30 + 1) {
          nItems.pop()
        }
        localStorage.setItem(LS_HIST_KEY, JSON.stringify(nItems))
        return nItems
      } else {
        let nItems = [...prev]
        let dels = nItems.splice(index, 1)
        nItems = [...dels, ...nItems]
        localStorage.setItem(LS_HIST_KEY, JSON.stringify(nItems))
        return nItems
      }
    })
  }

  // 加载历史记录
  useEffect(() => {
    let words = JSON.parse(localStorage.getItem(LS_HIST_KEY) || '[]')
    setHistoryWords(words)
  }, [])

  // 搜索歌曲
  useEffect(() => {
    const obtain = async () => {
      if (!kw) return
      // 搜索
      console.log(TAG, `搜索歌曲"${kw}"，第 ${page} 页`)
      setBackdropMsg(prev => ({...prev, bg: "transparent", open: true}))

      // 授权验证码
      const headers = {"Authorization": localStorage.getItem(LS_AUTH_KEY) || ""}
      let resp = await request("/api/music/search?page=" + page + "&keyword=" + encodeURIComponent(kw) +
        "&ops=" + encodeURIComponent(JSON.stringify(ops)), undefined, {headers: headers})
      let obj: SMResp = await resp.json().catch(e => console.log(TAG, "搜索歌曲出错：", e))

      // 获取失败
      if (!obj || obj.code !== 0) {
        console.log(TAG, "搜索歌曲失败：", obj?.msg || `服务端响应码 ${resp.status}`)
        setBackdropMsg(prev => ({...prev, open: false}))
        setSbMsg(prev => ({
          ...prev,
          open: true,
          message: `搜索歌曲失败：${obj?.msg || "服务端响应码 " + resp.status}`,
          severity: "error",
          autoHideDuration: undefined,
          onClose: () => console.log("已手动关闭 Snackbar")
        }))
        return
      }

      // 没有搜到匹配的歌曲
      if (!obj.data.payload || obj.data.payload.length === 0) {
        console.log(TAG, "没有搜到匹配的歌曲")
        setBackdropMsg(prev => ({...prev, open: false}))
        setSbMsg(prev => ({
          ...prev,
          open: true,
          message: "没有搜到匹配的歌曲",
          severity: "info"
        }))
        return
      }

      // 填充
      setSongList(prev => [...prev, ...obj.data.payload])

      setBackdropMsg(prev => ({...prev, open: false}))

      // 设置总搜索结果数
      let tt = Number(obj.data.total)
      if (isNaN(tt)) {
        console.log(TAG, "无法转换搜索结果数字符串为数字")
        setSbMsg(prev => ({
          ...prev,
          open: true,
          message: "无法转换搜索结果数字符串为数字",
          severity: "error",
          autoHideDuration: undefined,
          onClose: () => console.log("已手动关闭 Snackbar")
        }))
      } else {
        setTotal(tt)
      }
    }

    // 获取
    obtain()
  }, [kw, page])

  return (
    <Stack sx={{...props.sx}}>
      <AutocompleteComp label={"搜索 歌曲、歌手、歌单、专辑"} options={historyWords}
                        onEnter={option => onSearch(option)}
                        onDelOption={option => setHistoryWords(prev => {
                          // 删除指定记录
                          let his = [...prev]
                          let index = his.findIndex((v: string) => v === option)
                          index !== -1 && his.splice(index, 1)
                          localStorage.setItem(LS_HIST_KEY, JSON.stringify(his))
                          return his
                        })}/>

      <FormGroup row>
        <FormControlLabel label="歌曲" control={
          <Checkbox size="small" checked={ops.song === 1}
                    onChange={e => setOps(prev => ({...prev, song: e.target.checked ? 1 : 0}))}
          />}
        />
        <FormControlLabel label="歌手" control={
          <Checkbox size="small" checked={ops.singer === 1}
                    onChange={e => setOps(prev => ({...prev, singer: e.target.checked ? 1 : 0}))}
          />}
        />
        <FormControlLabel label="专辑" control={
          <Checkbox size="small" checked={ops.album === 1}
                    onChange={e => setOps(prev => ({...prev, album: e.target.checked ? 1 : 0}))}
          />}
        />
        <FormControlLabel label="歌单" control={
          <Checkbox size="small" checked={ops.songlist === 1}
                    onChange={e => setOps(prev => ({...prev, songlist: e.target.checked ? 1 : 0}))}
          />}
        />
        <FormControlLabel label="MV" control={
          <Checkbox size="small" checked={ops.mvSong === 1}
                    onChange={e => setOps(prev => ({...prev, mvSong: e.target.checked ? 1 : 0}))}
          />}
        />
        <FormControlLabel label="标签" control={
          <Checkbox size="small" checked={ops.tagSong === 1}
                    onChange={e => setOps(prev => ({...prev, tagSong: e.target.checked ? 1 : 0}))}
          />}
        />
      </FormGroup>
      <Divider component={"li"}/>
    </Stack>
  )
}

// 搜索结果的单个歌曲组件
const SongItem = (props: { song: Song }) => {
  return (
    <ListItem divider className={"hoverable"}>
      <ListItemText primary={props.song.name}
                    secondary={props.song.singers.map(item => item.name).join(" / ")}
      />
      <IconButton onClick={() => window.open(props.song.listen_url)}>
        <PlayCircleOutlineOutlinedIcon/>
      </IconButton>
      <IconButton onClick={() => window.open(props.song.download_url)}>
        <FileDownloadOutlinedIcon/>
      </IconButton>
    </ListItem>
  )
}

// 搜索结果
const Content = (props: { sx?: SxProps }) => {
  const {songList, total, setPage} = useBetween(useSongList)

  return (
    <ListInfinite sx={{...props.sx}} content={
      <Fragment>
        {console.log(TAG, "歌曲数", songList.length, total, songList.length === total)}
        {songList.map((song, key) => <SongItem key={key} song={song}/>)}
        {(songList.length !== 0 && songList.length === total) && <Alert severity="success">已显示所有结果</Alert>}
      </Fragment>} onLoadNext={() => {
      if (songList.length < total) {
        setPage(prev => ++prev)
      }
    }}/>
  )
}

// 音乐面板组件
const Music = () => {

  return (
    <Stack className={"main"} sx={{bgcolor: "background.paper", height: "100%", overflowY: "hidden"}}>
      <Header/>
      <Content/>
    </Stack>
  )
}

export default Music