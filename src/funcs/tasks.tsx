import React, {useEffect, useState} from "react"
import {Alert, Card, CardContent, IconButton, Stack, Typography} from "@mui/material"
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined'
import {reqJSON} from "../comm/comm"
import {useSharedSnackbar} from "do-comps"

// 图集下载状态
type AlbumsStatusType = {
  total: number
  done: number
  skip: number
  fail: number
}

// 图集下载的总状态
type TotalCountInfo = {
  fail: number
  skip: number
}

// 图集下载状态的组件
const AlbumsStatus = React.memo((): JSX.Element => {
  // 状态记录
  const [statusMap, setStatusMap] = useState<{ [id: string]: AlbumsStatusType }>({})
  // 需要重试下载的图集数
  const [totalCountInfo, setTotalCountInfo] = useState<TotalCountInfo>({fail: 0, skip: 0})
  // 用于刷新组件
  const [count, setCount] = useState(0)

  // 共享 Snackbar
  const {showSb} = useSharedSnackbar()

  // 获取图集下载状态
  const init = React.useCallback(async () => {
    let obj = await reqJSON<{ [id: string]: AlbumsStatusType }>("/api/pics/dl/status",
      undefined, showSb)
    if (obj?.code === 0) {
      setStatusMap(obj.data)
    }

    // 获取需要重试的图集数
    let countObj = await reqJSON<TotalCountInfo>("/api/pics/dl/count", undefined, showSb)
    if (countObj?.code === 0) {
      setTotalCountInfo(countObj.data)
    }
  }, [showSb])

  useEffect(() => {
    init()
  }, [count, init])

  let statusElems: Array<JSX.Element> = []
  for (const [id, s] of Object.entries(statusMap)) {
    statusElems.push(
      <li className="col" key={id}>
        <Typography>共有 {s.total} 个，发送 {s.done} 个</Typography>
        <Typography>跳过 {s.skip} 个，失败 {s.fail} 个</Typography>
      </li>
    )
  }

  return (
    <Card sx={{width: {sm: 300}}}>
      <CardContent>
        <Stack direction={"row"} justifyContent={"space-between"}>
          <span>图集下载状态</span>
          <IconButton title="刷新" onClick={() => setCount(prev => ++prev)}>
            <RefreshOutlinedIcon/>
          </IconButton>
        </Stack>

        <ul>{statusElems.length !== 0 ? statusElems : <Alert severity="info">没有进行中的任务</Alert>}</ul>

        <hr/>
        <Typography>总失败 {totalCountInfo.fail} 个，总跳过 {totalCountInfo.skip} 个</Typography>
      </CardContent>
    </Card>
  )
})

// 任务状态的组件
const Tasks = React.memo(() => {
  useEffect(() => {
    document.title = "任务状态"
  }, [])

  return (
    <Stack className={"main"} sx={{bgcolor: "background.paper", height: "100%", overflowY: "hidden"}}>
      <AlbumsStatus/>
    </Stack>
  )
})

export default Tasks