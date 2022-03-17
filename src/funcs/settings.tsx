// 文件操作验证码存储到 localStorage 的键
import {useEffect, useState} from "react"
import {Button, FormControl, InputLabel, OutlinedInput, Stack} from "@mui/material"
import {useBetween} from "use-between"
import {useSnackbar} from "../components/snackbar"

const TAG = "[Settings]"

export const LS_AUTH_KEY = "auth_key"
// Transmission 磁力下载地址存储到 localStorage 的键
export const LS_Trans_KEY = "transmission_url"

// Settings 设置
const Settings = (): JSX.Element => {
  // 授权码
  const [auth, setAuth] = useState("")
  // 磁力工具的地址
  const [trans, setTrans] = useState("")
  // 共享 Snackbar
  const {setSbMsg} = useBetween(useSnackbar)

  useEffect(() => {
    document.title = "设置选项"

    setAuth(localStorage.getItem(LS_AUTH_KEY) || "")
    setTrans(localStorage.getItem(LS_Trans_KEY) || "")
  }, [])

  return (
    <Stack className={"main"} sx={{bgcolor: "background.paper", gap: 2}}>
      <FormControl fullWidth size="small">
        <InputLabel htmlFor="ss_auth">Auth 授权码</InputLabel>
        <OutlinedInput
          id="ss_auth"
          value={auth}
          type="password"
          onChange={event => setAuth(event.target.value)}
          label="Auth 授权码"
        />
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel htmlFor="ss_trans">磁力工具的地址</InputLabel>
        <OutlinedInput
          id="ss_trans"
          value={trans}
          type="password"
          onChange={event => setTrans(event.target.value)}
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
    </Stack>
  )
}

export default Settings