import React from "react"
import {Divider, Stack} from "@mui/material"
import {DoTextFieldBtn, useSharedSnackbar} from "do-comps"
import {request} from "do-utils"
import {JResult} from "../comm/typedef"

// 标签
const TAG = "[TGBot]"

// 番号面板
const FanHao = React.memo((): JSX.Element => {
  const {showSb} = useSharedSnackbar()

  const handleEnter = React.useCallback(async (value: string) => {
    if (!value) {
      showSb({open: true, severity: "warning", message: "番号为空"})
      return
    }
    const resp = await request("/api/tgbot/fanhao/send", `fanhao=${value}`)
    const json: JResult<any> = await resp.json()
    if (json.code !== 0) {
      console.log(TAG, json.msg)
      showSb({open: true, severity: "error", message: json.msg})
      return
    }

    showSb({open: true, severity: "success", message: `已成功记录番号 ${value}`})
  }, [showSb])

  return (
    <Stack direction={"column"} gap={1}>
      <Divider>记录番号</Divider>
      <DoTextFieldBtn size={"small"} enterNode={"记录"} clearAfterEnter onEnter={handleEnter}/>
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