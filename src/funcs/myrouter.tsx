import React, {useEffect, useState} from "react"
import {Button, Card, CardActions, CardContent, Stack, Typography} from "@mui/material"
import {getJSON} from "../comm/comm"
import {sha256} from "do-utils"
import {LS_AUTH_KEY} from "./settings"
import {useSharedSnackbar} from "do-comps"

// 标签
const TAG = "[MyRouter]"

// 路由器的 IP 地址信息
type IPInfo = {
  ipv4: string
  ipv6: string
}

/**
 * 控制路由器组件
 * 发送给 VPS 后台服务的的请求可直接访问 "/api/..."，
 * 控制路由器的请求需要添加 IP：`http://[${ipInfo.ipv6}]:9090/api/reboot`
 */
const MyRouter = React.memo((): JSX.Element => {
  // 路由器的 IP 信息
  const [ipInfo, setIPInfo] = useState<IPInfo>({ipv4: "", ipv6: ""})

  // 共享 Snackbar
  const {showSb} = useSharedSnackbar()

  // 初始化
  const init = React.useCallback(async () => {
    console.log(TAG, "读取路由器的信息...")
    // 路由器的公网 IP 信息
    let ipInfoObj = await getJSON<IPInfo>("/api/router/ip/get", undefined, showSb)
    if (!ipInfoObj) {
      return
    }

    if (ipInfoObj?.data) {
      setIPInfo(ipInfoObj.data)
    }
  }, [showSb])

  useEffect(() => {
    document.title = "管理路由器"

    // 执行
    init()
  }, [init])

  return (
    <Stack className={"main"} sx={{bgcolor: "background.paper"}}>
      <Card sx={{width: {sm: 420}}}>
        <CardContent>
          <Typography sx={{mb: 1.5}}>路由器信息</Typography>
          <Stack direction={"row"} gap={1}>
            <span>IPv4:</span><span>{ipInfo.ipv4}</span>
          </Stack>

          <Stack direction={"row"} gap={1} sx={{mt: 1}}>
            <span>IPv6:</span><span>{ipInfo.ipv6}</span>
          </Stack>
        </CardContent>

        <CardActions>
          <Button size={"small"} disabled={ipInfo.ipv6.trim() === ""} onClick={async () => {
            let auth = localStorage.getItem(LS_AUTH_KEY) || ""
            let t = new Date().getTime()
            let s = await sha256(auth + t + auth)
            window.open(`http://[${ipInfo.ipv6}]:20220?t=${t}&s=${s}`, "_blank")
          }}>打开管理页面</Button>
        </CardActions>
      </Card>
    </Stack>
  )
})

export default MyRouter