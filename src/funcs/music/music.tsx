import {
  Alert,
  Checkbox, Divider, FormControlLabel,
  FormGroup,
  IconButton,
  ListItem,
  ListItemText, Stack
} from "@mui/material"
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import React, {Fragment, useEffect, useState} from "react"
import {getJSON} from "../../comm/comm"
import {DoAutocomplete, DoList, useSharedSnackbar} from "do-comps"
import {useBetween} from "use-between"
import {SInfo, SMData, Song} from "./types"

// 标签
const TAG = "[Music]"
// 存储搜索历史的键
const LS_HIST_KEY = "history_words"

// 需要分享的值
const useValues = () => {
  // 需要搜索的信息，歌曲名和页数
  const [sInfo, setSInfo] = useState<SInfo>({
    keyword: "",
    page: 1,
    ops: {song: 1, album: 1, singer: 1, mvSong: 1, songlist: 1, tagSong: 0, bestShow: 1}
  })

  return {sInfo, setSInfo}
}

// 需要分享的值
const useSharedValues = () => useBetween(useValues)

// 头部
const Header = React.memo(() => {
  // 搜索历史
  const [historyWords, setHistoryWords] = useState<string[]>([])

  // 共享的值
  const {sInfo, setSInfo} = useSharedValues()

  const handleKwChange = React.useCallback((kw: string) => {
    if (!kw.trim() || kw === sInfo.keyword) return

    // 更新搜索关键字后，也需要重置页数
    setSInfo(prev => ({...prev, keyword: kw, page: 1}))

    // 添加关键字到历史记录
    let history: string[] = JSON.parse(localStorage.getItem(LS_HIST_KEY) || "[]")
    let index = history.findIndex(value => value === kw)
    setHistoryWords(prev => {
      // 若不存在记录则添加，若有则提到最前面。总记录不超过指定数，否则删除最晚一条记录
      if (index === -1) {
        let nItems = [kw, ...prev]
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
  }, [sInfo.keyword, setSInfo, setHistoryWords])

  const handleOpsChange = React.useCallback((kv: { [k: string]: number }) => {
    // 更新搜索选项后，也需要重置页数
    setSInfo(prev => ({...prev, ops: {...prev.ops, ...kv}, page: 1}))
  }, [setSInfo])

  const handleDel = React.useCallback((option: string) => {
    setHistoryWords(prev => {
      // 删除指定记录
      let his = [...prev]
      let index = his.findIndex((v: string) => v === option)
      index !== -1 && his.splice(index, 1)
      localStorage.setItem(LS_HIST_KEY, JSON.stringify(his))
      return his
    })
  }, [setHistoryWords])

  // 加载历史记录
  useEffect(() => {
    setHistoryWords(JSON.parse(localStorage.getItem(LS_HIST_KEY) || '[]'))
  }, [])

  return (
    <Stack>
      <DoAutocomplete label={"搜索 歌曲、歌手、歌单、专辑"}
                      options={historyWords}
                      onEnter={handleKwChange}
                      onDelOption={handleDel}
      />

      <FormGroup row>
        <FormControlLabel label="歌曲" control={
          <Checkbox size="small" checked={sInfo.ops.song === 1}
                    onChange={e => handleOpsChange({song: e.target.checked ? 1 : 0})}
          />}
        />
        <FormControlLabel label="歌手" control={
          <Checkbox size="small" checked={sInfo.ops.singer === 1}
                    onChange={e => handleOpsChange({singer: e.target.checked ? 1 : 0})}
          />}
        />
        <FormControlLabel label="专辑" control={
          <Checkbox size="small" checked={sInfo.ops.album === 1}
                    onChange={e => handleOpsChange({album: e.target.checked ? 1 : 0})}
          />}
        />
        <FormControlLabel label="歌单" control={
          <Checkbox size="small" checked={sInfo.ops.songlist === 1}
                    onChange={e => handleOpsChange({songlist: e.target.checked ? 1 : 0})}
          />}
        />
        <FormControlLabel label="MV" control={
          <Checkbox size="small" checked={sInfo.ops.mvSong === 1}
                    onChange={e => handleOpsChange({mvSong: e.target.checked ? 1 : 0})}
          />}
        />
        <FormControlLabel label="标签" control={
          <Checkbox size="small" checked={sInfo.ops.tagSong === 1}
                    onChange={e => handleOpsChange({tagSong: e.target.checked ? 1 : 0})}
          />}
        />
      </FormGroup>

      <Divider component={"li"}/>
    </Stack>
  )
})

// 搜索结果的单个歌曲组件
const SongItem = (props: { song: Song }) => {
  return (
    <ListItem divider className={"hoverable"}>
      <ListItemText primary={props.song.name}
                    secondary={props.song.singers.map(item => item.name).join(" / ")}
      />
      <IconButton onClick={() => window.open(props.song.listenUrl)}>
        <PlayCircleOutlineOutlinedIcon/>
      </IconButton>
      <IconButton onClick={() => window.open(props.song.downloadUrl)}>
        <FileDownloadOutlinedIcon/>
      </IconButton>
    </ListItem>
  )
}

// 搜索结果
const Content = React.memo(() => {
  const [songList, setSongList] = useState<Song[]>([])
  const [total, setTotal] = useState(0)

  // 共享 Snackbar
  const {showSb} = useSharedSnackbar()
  const {setSInfo, sInfo} = useSharedValues()

  const obtain = React.useCallback(async (sInfo: SInfo) => {
    // 搜索
    console.log(TAG, `搜索歌曲 "${sInfo.keyword}"，第 ${sInfo.page} 页`)

    let path = "/api/music/search?page=" + sInfo.page + "&keyword=" +
      encodeURIComponent(sInfo.keyword) + "&ops=" +
      encodeURIComponent(JSON.stringify(sInfo.ops))
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
        autoHideDuration: undefined
      })
      return
    }
    setTotal(tt)
  }, [showSb, setSongList])

  // 开始新的搜索，初始化数据
  useEffect(() => {
    setTotal(0)
    // 没有歌曲时，不需要重置，避免重复渲染 Content 组件
    setSongList(prev => prev.length === 0 ? prev : [])
  }, [sInfo.keyword, sInfo.ops])

  // 执行搜索
  useEffect(() => {
    if (!sInfo.keyword) return

    // 获取
    obtain(sInfo)
  }, [sInfo, obtain])

  return (
    <DoList
      content={
        <Fragment>
          {songList.map((song, key) => <SongItem key={key} song={song}/>)}
          {(songList.length !== 0 && songList.length === total) &&
            <Alert severity="success" sx={{width: "-webkit-fill-available"}}>已显示所有结果</Alert>
          }
        </Fragment>
      }

      onLoadNext={() => {
        if (songList.length < total) {
          setSInfo(prev => ({...prev, page: ++prev.page}))
        }
      }}
    />
  )
})

// 音乐面板组件
const Music = React.memo(() => {

  useEffect(() => {
    document.title = "音乐搜索"
  }, [])

  return (
    <Stack className={"main"} bgcolor={"background.paper"} height={"100%"}>
      <Header/>
      <Content/>
    </Stack>
  )
})

export default Music