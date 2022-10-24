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
import React, {Fragment, useEffect, useState} from "react"
import {getJSON} from "../comm/comm"
import {DoAutocomplete, DoList, useSharedSnackbar} from "do-comps"

// 标签
const TAG = "[Music]"
// 存储搜索历史的键
const LS_HIST_KEY = "history_words"

// 搜索歌曲时返回的结果
interface SMData {
  total: string
  payload: Song[]
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

// 头部
const Header = (props: {
  sx?: SxProps, setKeyword: React.Dispatch<React.SetStateAction<string>>,
  ops: Ops, setOps: React.Dispatch<React.SetStateAction<Ops>>
}) => {
  // 搜索历史
  const [historyWords, setHistoryWords] = useState<Array<string>>([])

  // 搜索
  const onSearch = (keyword: string) => {
    console.log(TAG, "准备搜索：", keyword)
    if (!keyword.trim()) return

    // 重开新的搜索
    props.setKeyword(keyword)

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

  return (
    <Stack sx={{...props.sx}}>
      <DoAutocomplete label={"搜索 歌曲、歌手、歌单、专辑"} options={historyWords}
                      onEnter={option => onSearch(option)}
                      onDelOption={option => setHistoryWords(prev => {
                        // 删除指定记录
                        let his = [...prev]
                        let index = his.findIndex((v: string) => v === option)
                        index !== -1 && his.splice(index, 1)
                        localStorage.setItem(LS_HIST_KEY, JSON.stringify(his))
                        return his
                      })}
      />

      <FormGroup row>
        <FormControlLabel label="歌曲" control={
          <Checkbox size="small" checked={props.ops.song === 1}
                    onChange={e => props.setOps(prev => ({...prev, song: e.target.checked ? 1 : 0}))}
          />}
        />
        <FormControlLabel label="歌手" control={
          <Checkbox size="small" checked={props.ops.singer === 1}
                    onChange={e => props.setOps(prev => ({...prev, singer: e.target.checked ? 1 : 0}))}
          />}
        />
        <FormControlLabel label="专辑" control={
          <Checkbox size="small" checked={props.ops.album === 1}
                    onChange={e => props.setOps(prev => ({...prev, album: e.target.checked ? 1 : 0}))}
          />}
        />
        <FormControlLabel label="歌单" control={
          <Checkbox size="small" checked={props.ops.songlist === 1}
                    onChange={e => props.setOps(prev => ({...prev, songlist: e.target.checked ? 1 : 0}))}
          />}
        />
        <FormControlLabel label="MV" control={
          <Checkbox size="small" checked={props.ops.mvSong === 1}
                    onChange={e => props.setOps(prev => ({...prev, mvSong: e.target.checked ? 1 : 0}))}
          />}
        />
        <FormControlLabel label="标签" control={
          <Checkbox size="small" checked={props.ops.tagSong === 1}
                    onChange={e => props.setOps(prev => ({...prev, tagSong: e.target.checked ? 1 : 0}))}
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
const Content = (props: { sx?: SxProps, keyword: string, ops: Ops }) => {
  const [page, setPage] = useState(1)
  const [songList, setSongList] = useState<Array<Song>>([])
  const [total, setTotal] = useState(0)

  // 共享 Snackbar
  const {showSb} = useSharedSnackbar()

  // 开始新的搜索，初始化数据
  useEffect(() => {
    setPage(1)
    setTotal(0)
    setSongList([])
  }, [props.keyword])

  const obtain = async () => {
    // 搜索
    console.log(TAG, `搜索歌曲"${props.keyword}"，第 ${page} 页`)

    let path = "/api/music/search?page=" + page + "&keyword=" +
      encodeURIComponent(props.keyword) + "&ops=" +
      encodeURIComponent(JSON.stringify(props.ops))
    let obj = await getJSON<SMData>(path, undefined, showSb)
    if (!obj) return

    // 没有搜到匹配的歌曲
    if (!obj.data.payload || obj.data.payload.length === 0) {
      console.log(TAG, "没有搜到匹配的歌曲")
      showSb({open: true, message: "没有搜到匹配的歌曲", severity: "info"})
      return
    }

    // 填充
    setSongList(prev => [...prev, ...obj?.data?.payload || []])

    // 设置总搜索结果数
    let tt = Number(obj.data.total)
    if (isNaN(tt)) {
      console.log(TAG, "无法转换搜索结果数字符串为数字")
      showSb({
        open: true,
        message: "无法转换搜索结果数字符串为数字",
        severity: "error",
        autoHideDuration: undefined,
        onClose: () => console.log("已手动关闭 Snackbar")
      })
      return
    }
    setTotal(tt)
  }

  // 执行搜索
  useEffect(() => {
    if (!props.keyword) return

    // 获取
    obtain()
  }, [props.keyword, page])

  return (
    <DoList sx={{...props.sx}} content={
      <Fragment>
        {songList.map((song, key) => <SongItem key={key} song={song}/>)}
        {(songList.length !== 0 && songList.length === total) &&
          <Alert severity="success" sx={{width: "-webkit-fill-available"}}>已显示所有结果</Alert>
        }
      </Fragment>} onLoadNext={() => {
      if (songList.length < total) {
        setPage(prev => ++prev)
      }
    }}/>
  )
}

// 音乐面板组件
const Music = () => {
  // 搜索关键字
  const [keyword, setKeyword] = useState("")
  // 搜索选项
  const [ops, setOps] = useState(new Ops())

  useEffect(() => {
    document.title = "音乐搜索"
  }, [])

  return (
    <Stack className={"main"} sx={{bgcolor: "background.paper", height: "100%", overflowY: "hidden"}}>
      <Header setKeyword={setKeyword} ops={ops} setOps={setOps}/>
      <Content keyword={keyword} ops={ops}/>
    </Stack>
  )
}

export default Music