import {useEffect, useState} from "react"
import {request} from "do-utils"
import {LS_AUTH_KEY} from "./settings"
import {Alert, Card, CardContent, IconButton, Stack, SxProps, Typography} from "@mui/material"
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined'

// 图集下载状态
type AlbumsStatusType = {
  total: number
  done: number
  skip: number
  fail: number
}

// 图集下载状态的组件
const AlbumsStatus = (props: { sx?: SxProps }): JSX.Element => {
  // 状态记录
  const [statusMap, setStatusMap] = useState<{ [id: string]: AlbumsStatusType }>({})
  // 需要重试下载的图集数
  const [countInfo, setCountInfo] = useState({fail: 0, skip: 0})
  // 用于刷新组件
  const [count, setCount] = useState(0)

  useEffect(() => {
    let headers = {"Authorization": localStorage.getItem(LS_AUTH_KEY) || ""}
    // 获取图集下载状态
    request("/api/pics/dl/status", undefined, {headers: headers}).then(resp =>
      resp.json()).then(obj => setStatusMap(obj.data))

    // 获取需要重试的图集数
    request("/api/pics/dl/count", undefined,
      {headers: {"Authorization": localStorage.getItem(LS_AUTH_KEY) || ""}})
      .then(resp => resp.json()).then(obj => setCountInfo(obj.data))
  }, [count])

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
    <Card sx={{...props.sx}}>
      <CardContent>
        <Stack direction={"row"} justifyContent={"space-between"}>
          <span>图集下载状态</span>
          <IconButton title="刷新" onClick={() => setCount(prev => ++prev)}>
            <RefreshOutlinedIcon/>
          </IconButton>
        </Stack>

        <ul>{statusElems.length !== 0 ? statusElems : <Alert severity="info">没有进行中的任务</Alert>}</ul>

        <hr/>
        <Typography>总失败 {countInfo.fail} 个，总跳过 {countInfo.skip} 个</Typography>
      </CardContent>
    </Card>
  )
}

// 任务状态的组件
const Tasks = () => {
  useEffect(() => {
    document.title = "任务状态"
  }, [])

  return (
    <Stack>
      <AlbumsStatus sx={{width: {sm: 300}}}/>
    </Stack>
  )
}

export default Tasks