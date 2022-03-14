// 文件操作验证码存储到 localStorage 的键
import {useEffect, useState} from "react"
import {Box, Button, FormControl, InputLabel, OutlinedInput} from "@mui/material"
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
    document.title = "设置"

    setAuth(localStorage.getItem(LS_AUTH_KEY) || "")
    setTrans(localStorage.getItem(LS_Trans_KEY) || "")
  }, [])

  return (
    <Box className="col" sx={{bgcolor: "background.paper", padding: "16px", gap: "15px"}}>
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
    </Box>
  )
}

export default Settings