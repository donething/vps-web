import {useEffect, useState} from "react"
import {Button, ButtonGroup, Card, CardActions, CardContent, Divider, Stack, Typography} from "@mui/material"
import {useBetween} from "use-between"
import {useSnackbar} from "../components/snackbar"
import {useDialog} from "../components/dialog"
import {getJSON} from "../comm/comm"
import OnlinePredictionOutlinedIcon from '@mui/icons-material/OnlinePredictionOutlined'

// 标签
const TAG = "[MyRouter]"

// 路由器的 IP 地址信息
class IPInfo {
  ipv4: string = ""
  ipv6: string = ""
}

/**
 * 控制路由器组件
 * 发送给 VPS 后台服务的的请求可直接访问 "/api/..."，
 * 控制路由器的请求需要添加 IP：`http://[${ipInfo.ipv6}]:9090/api/reboot`
 */
const MyRouter = (): JSX.Element => {
  // 路由器的 IP 信息
  const [ipInfo, setIPInfo] = useState(new IPInfo())
  // 是否可连接到路由器
  const [status, setStatus] = useState<boolean | undefined>(undefined)

  // 共享 Snackbar
  const {setSbMsg} = useBetween(useSnackbar)
  const {setDialogMsg} = useBetween(useDialog)

  useEffect(() => {
    document.title = "管理路由器"

    const init = async () => {
      console.log(TAG, "读取路由器的信息...")
      // 路由器的公网 IP 信息
      let ipInfoObj = await getJSON<IPInfo>("/api/router/ip/get", undefined, setSbMsg)
      if (!ipInfoObj) {
        return
      }
      setIPInfo(ipInfoObj.data)

      // 是否连接到路由器
      if (ipInfoObj.data.ipv6.trim() !== "") {
        let statusURL = `http://[${ipInfoObj.data.ipv6}]:9090/api/status`
        let statusObj = await getJSON<IPInfo>(statusURL, undefined, setSbMsg)
        setStatus(statusObj?.code === 0)
      } else {
        console.log(TAG, "获取的路由器的 IPv6 地址为空")
      }
    }

    // 执行
    init()
  }, [])

  return (
    <Stack className={"main"} sx={{bgcolor: "background.paper"}}>
      <Card sx={{width: {sm: 350}}}>
        <CardContent>
          <Stack direction={"row"} justifyContent={"space-between"}>
            <Typography sx={{mb: 1.5}}>路由器信息</Typography>
            <OnlinePredictionOutlinedIcon titleAccess={"连接到路由器的状态"} color={status === true ?
              "success" : status === false ? "error" : "disabled"}
            />
          </Stack>
          <Divider component={"li"} sx={{mb: 1.5}}/>

          <Stack direction={"row"}>
            <span>IPv4:&nbsp;</span>
            <span>{ipInfo.ipv4}</span>
          </Stack>
          <Stack direction={"row"}>
            <span>IPv6:&nbsp;</span>
            <span>{ipInfo.ipv6}</span>
          </Stack>

          <Divider component={"li"} sx={{mt: 1.5}}/>
        </CardContent>

        <CardActions>
          <ButtonGroup disabled={ipInfo.ipv6.trim() === ""}>
            <Button size="small" onClick={() => {
              setDialogMsg(prev => ({
                ...prev, open: true, title: "确认",
                message: "重启路由器？", onOK: async () => {
                  let url = `http://[${ipInfo.ipv6}]:9090/api/reboot`
                  let obj = await getJSON<undefined>(url, {}, setSbMsg)
                  if (!obj) return

                  setSbMsg(prev => ({
                    ...prev,
                    open: true,
                    message: obj?.msg || "",
                    severity: obj?.code === 0 ? "success" : "error",
                    autoHideDuration: obj?.code === 0 ? 6 : undefined,
                    onClose: obj?.code === 0 ? undefined : () => console.log("")
                  }))
                }
              }))
            }}>重启路由器</Button>

            <Button size="small" onClick={async () => {
              let url = `http://[${ipInfo.ipv6}]:9090/api/wol`
              let obj = await getJSON<undefined>(url, {}, setSbMsg)
              if (!obj) return

              setSbMsg(prev => ({
                ...prev,
                open: true,
                message: obj?.msg || "",
                severity: obj?.code === 0 ? "success" : "error",
                autoHideDuration: obj?.code === 0 ? 6 : undefined,
                onClose: obj?.code === 0 ? undefined : () => console.log("")
              }))
            }}>远程开机</Button>
          </ButtonGroup>
        </CardActions>
      </Card>
    </Stack>
  )
}

export default MyRouter