import React from "react"
import {Button, Checkbox, Divider, FormControlLabel, FormGroup, Stack, TextField} from "@mui/material"
import {useSharedSnackbar} from "do-comps"
import {request} from "do-utils"
import {JResult} from "../comm/typedef"
import Auth from "../auth"

// 标签
const TAG = "[TGBot]"

// 番号面板
const FanHao = React.memo((): JSX.Element => {
  const [working, setWorking] = React.useState(false)
  // 番号、额外信息、重复发送
  const [fh, setFh] = React.useState("")
  const [still, setStill] = React.useState(false)
  // 已选择的标签
  const [tagObj, setTagObj] = React.useState<{ [tag: string]: boolean }>({})

  const {showSb} = useSharedSnackbar()

  const handleInputFH = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFh(e.target.value)
  }, [])

  const handleInputStill = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStill(e.target.checked)
  }, [])

  const tags = React.useMemo(() => {
    return Object.entries(tagObj).map(([tag, bool]) =>
      <FormControlLabel key={tag} control={<Checkbox checked={bool} onChange={e =>
        setTagObj(prev => ({...prev, [tag]: e.target.checked}))}/>} label={tag}/>)
  }, [tagObj])

  const handleSend = React.useCallback(async () => {
    if (!fh) {
      showSb({open: true, severity: "warning", message: "番号为空"})
      return
    }

    setWorking(true)
    const tagsStr = Object.entries(tagObj).filter(([_, b]) => b).map(([tag]) => "#" + tag).join(" ")
    const data = `fanhao=${encodeURIComponent(fh)}&tags=${encodeURIComponent(tagsStr)}&still=${still}`
    const resp = await request("/api/tgbot/fanhao/send", data)
    const json: JResult<any> = await resp.json()

    setWorking(false)
    if (json.code !== 0) {
      console.log(TAG, json.msg)
      showSb({open: true, severity: "error", message: json.msg})
      return
    }

    showSb({open: true, severity: "success", message: `已成功记录番号 ${fh}`})
    // 恢复输入为初始值
    setFh("")
    setStill(false)
    setTagObj(prev => Object.fromEntries(
      Object.entries(prev).map(([v]) => [[v], false])))
  }, [fh, still, tagObj, showSb])

  const init = React.useCallback(async () => {
    const resp = await request("/api/tgbot/fanhao/tags")
    const obj: JResult<string> = await resp.json()
    if (obj.code !== 0) {
      console.log(TAG, "获取影片标签错误：", obj.msg)
      showSb({open: true, severity: "error", message: `获取影片标签错误：${obj.msg}`})
      return
    }

    const tagsStr = decodeURIComponent(obj.data)
    const tags = tagsStr.split(",")
    const map = Object.fromEntries(tags.map(v => [v, false]))
    setTagObj(map)
  }, [showSb])

  React.useEffect(() => {
    init()
  }, [init])

  React.useEffect(() => {
    document.title = "记录番号"
  }, [])

  return (
    <Stack direction={"column"} gap={2}>
      <Divider>记录番号</Divider>
      <TextField label={"含番号的文本，多行时会共用下面的信息"} required multiline minRows={3} size={"small"}
                 value={fh} onChange={handleInputFH}/>
      <FormGroup row sx={{gap: 1}}>{tags}</FormGroup>
      <FormControlLabel sx={{width: "fit-content"}}
                        control={<Checkbox checked={still} onChange={handleInputStill}/>} label="重复发送"/>
      <Button variant={"contained"} disabled={working} onClick={handleSend}>记录番号</Button>
    </Stack>
  )
})

// TGBot 设置
const TGBot = React.memo((): JSX.Element => {
  return (
    <Stack direction={"column"} gap={2} padding={1}>
      <Auth/>
      <FanHao/>
    </Stack>
  )
})

export default TGBot