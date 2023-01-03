import React, {useEffect, useState} from "react"
import {Button, Stack} from "@mui/material"
import {DoPasswdField, useSharedSnackbar} from "do-comps"

// 标签
const TAG = "[Settings]"

// 操作授权码，存储到 localStorage 的键
export const LS_AUTH_KEY = "auth_key"
// Transmission 磁力下载地址，存储到 localStorage 的键
export const LS_Trans_Port_KEY = "transmission_port"

// Settings 设置
const Settings = React.memo((): JSX.Element => {
  // 授权码
  const [auth, setAuth] = useState("")
  // 磁力工具的地址
  const [trans, setTrans] = useState("")

  // 共享 Snackbar
  const {showSb} = useSharedSnackbar()

  useEffect(() => {
    document.title = "设置选项"

    setAuth(localStorage.getItem(LS_AUTH_KEY) || "")
    setTrans(localStorage.getItem(LS_Trans_Port_KEY) || "")
  }, [])

  return (
    <Stack className={"main"} sx={{bgcolor: "background.paper", gap: 3}}>
      <DoPasswdField id="ss_auth" value={auth} setValue={setAuth} label={"Auth 授权码"} size={"small"}/>

      <DoPasswdField id="ss_trans" value={trans} setValue={setTrans} label={"磁力工具的端口"} size={"small"}/>

      <Button variant="contained" color="primary" onClick={() => {
        localStorage.setItem(LS_AUTH_KEY, auth)
        localStorage.setItem(LS_Trans_Port_KEY, trans)
        console.log(TAG, "已保存设置")
        showSb({open: true, message: "已保存设置", severity: "success"})
      }}>保存</Button>
    </Stack>
  )
})

export default Settings