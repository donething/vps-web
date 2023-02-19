import React from "react"
import {Button, Checkbox, Divider, FormControlLabel, Stack, TextField} from "@mui/material"
import {useSharedSnackbar} from "do-comps"
import {request} from "do-utils"
import {JResult} from "../comm/typedef"

// 标签
const TAG = "[TGBot]"

// 番号面板
const FanHao = React.memo((): JSX.Element => {
  const [fh, setFh] = React.useState("")
  const [extra, setExtra] = React.useState("")
  const [still, setStill] = React.useState(false)
  const [working, setWorking] = React.useState(false)

  const {showSb} = useSharedSnackbar()

  const handleInputFH = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFh(e.target.value)
  }, [])

  const handleInputExtra = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setExtra(e.target.value)
  }, [])

  const handleInputStill = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStill(e.target.checked)
  }, [])

  const handleSend = React.useCallback(async () => {
    if (!fh) {
      showSb({open: true, severity: "warning", message: "番号为空"})
      return
    }

    setWorking(true)
    const data = `fanhao=${encodeURIComponent(fh)}&extra=${encodeURIComponent(extra)}&still=${still}`
    const resp = await request("/api/tgbot/fanhao/send", data)
    const json: JResult<any> = await resp.json()

    setWorking(false)
    if (json.code !== 0) {
      console.log(TAG, json.msg)
      showSb({open: true, severity: "error", message: json.msg})
      return
    }

    showSb({open: true, severity: "success", message: `已成功记录番号 ${fh}`})
    setFh("")
    setExtra("")
    setStill(false)
  }, [fh, extra, still, showSb])

  return (
    <Stack direction={"column"} gap={1}>
      <Divider>记录番号</Divider>
      <TextField label={"番号"} required size={"small"} value={fh} onChange={handleInputFH}/>
      <TextField label={"额外信息"} size={"small"} value={extra} onChange={handleInputExtra}/>
      <FormControlLabel control={<Checkbox checked={still} onChange={handleInputStill}/>} label="重复发送"/>
      <Button variant={"contained"} size={"small"} disabled={working} onClick={handleSend}>记录番号</Button>
    </Stack>
  )
})

// TGBot 设置
const TGBot = React.memo((): JSX.Element => {
  return (
    <Stack direction={"column"} gap={2} padding={1}>
      <FanHao/>
    </Stack>
  )
})

export default TGBot