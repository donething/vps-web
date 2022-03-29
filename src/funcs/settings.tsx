// 文件操作验证码存储到 localStorage 的键
import {useEffect, useState} from "react"
import {Button, FormControl, FormControlLabel, InputLabel, OutlinedInput, Stack, Switch} from "@mui/material"
import {useBetween} from "use-between"
import {useSnackbar} from "../components/snackbar"

const TAG = "[Settings]"

// 授权码，存储到 localStorage 的键
export const LS_AUTH_KEY = "auth_key"
// Transmission 磁力下载地址，存储到 localStorage 的键
export const LS_Trans_KEY = "transmission_url"
// 是否通过Nginx服务下载文件，存储到 localStorage 的键
export const LS_DL_WITH_NGINX = "dl_with_nginx"

// Settings 设置
const Settings = (): JSX.Element => {
  // 授权码
  const [auth, setAuth] = useState("")
  // 磁力工具的地址
  const [trans, setTrans] = useState("")
  // 是否通过 Nginx 下载文件
  const [nginx, setNginx] = useState(false)

  // 共享 Snackbar
  const {setSbMsg} = useBetween(useSnackbar)

  useEffect(() => {
    document.title = "设置选项"

    setAuth(localStorage.getItem(LS_AUTH_KEY) || "")
    setTrans(localStorage.getItem(LS_Trans_KEY) || "")
    setNginx(localStorage.getItem(LS_DL_WITH_NGINX) === "true")
  }, [])

  return (
    <Stack className={"main"} sx={{bgcolor: "background.paper", gap: 2}}>
      <FormControl fullWidth size="small">
        <InputLabel htmlFor="ss_auth">Auth 授权码</InputLabel>
        <OutlinedInput
          id="ss_auth"
          value={auth}
          type="password"
          onChange={e => setAuth(e.target.value)}
          label="Auth 授权码"
        />
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel htmlFor="ss_trans">磁力工具的地址</InputLabel>
        <OutlinedInput
          id="ss_trans"
          value={trans}
          type="password"
          onChange={e => setTrans(e.target.value)}
          label="磁力工具的地址"
        />
      </FormControl>

      <Button variant="contained" color="primary" onClick={() => {
        localStorage.setItem(LS_AUTH_KEY, auth)
        localStorage.setItem(LS_Trans_KEY, trans)
        console.log(TAG, "已保存设置")
        setSbMsg(prev => ({
          ...prev,
          open: true,
          message: "已保存设置",
          severity: "success"
        }))
      }}>保存</Button>

      <FormControlLabel label="通过Nginx服务下载文件" control={
        <Switch checked={nginx} onChange={e => {
          setNginx(e.target.checked)
          localStorage.setItem(LS_DL_WITH_NGINX, e.target.checked.toString())
        }}/>}
      />
    </Stack>
  )
}

export default Settings