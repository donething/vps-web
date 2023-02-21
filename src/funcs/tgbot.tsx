import React from "react"
import {
  Accordion, AccordionDetails, AccordionSummary, Alert,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Stack,
  TextField
} from "@mui/material"
import {useSharedSnackbar} from "do-comps"
import {request} from "do-utils"
import {JResult} from "../comm/typedef"
import Auth from "../auth"

// 标签
const TAG = "[TGBot]"

// 发送的结果
type SendResult = {
  // 番号。发送成功、发送过时为解析后的番号，失败则为来源文本
  fanhao: string
  // 成功为0；发送过为 10；发送失败为 20
  code: number
  // 成功、失败、发送过的消息
  msg: string
}

/**
 * 发送结果展示
 * @param props 番号、发送结果代码
 */
const LItem = (props: { text: string, code: number, msg: string }) => {
  // 对应成功、发过、失败
  const s = props.code === 0 ? "success" : props.code === 10 ? "info" : "error"

  return (
    <Alert severity={s} title={props.msg}>{props.text}</Alert>
  )
}

// 番号面板
const FanHao = React.memo((): JSX.Element => {
  const [working, setWorking] = React.useState(false)
  // 番号、额外信息、重复发送
  const [fh, setFh] = React.useState("")
  const [still, setStill] = React.useState(false)
  // 影片标签
  const [tagObj, setTagObj] = React.useState<{ [tag: string]: boolean }>({})
  // 发送结果
  const [result, setResult] = React.useState<SendResult[]>([])

  const {showSb} = useSharedSnackbar()

  // 影片标签的组件
  const tags = React.useMemo(() => {
    return Object.entries(tagObj).map(([tag, bool]) =>
      <FormControlLabel key={tag} control={<Checkbox checked={bool} onChange={e =>
        setTagObj(prev => ({...prev, [tag]: e.target.checked}))}/>} label={tag}/>)
  }, [tagObj])

  // 发送结果的组件
  const results = React.useMemo(() => {
    return result.map(r => <LItem key={r.fanhao} text={r.fanhao} code={r.code} msg={r.msg}/>)
  }, [result])

  const handleInputFH = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFh(e.target.value)
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
    setResult([])
    const tagsStr = Object.entries(tagObj).filter(([_, b]) => b).map(([tag]) => "#" + tag).join(" ")
    const data = `fanhao=${encodeURIComponent(fh)}&tags=${encodeURIComponent(tagsStr)}&still=${still}`
    const resp = await request("/api/tgbot/fanhao/send", data)
    const json: JResult<SendResult[]> = await resp.json()
    setWorking(false)
    setResult(json.data)

    // 此次有发送失败的番号，需要将该番号显示在输入框中
    if (json.data.filter(r => r.code === 20).length !== 0) {
      showSb({open: true, severity: "error", message: "有发送失败的番号", autoHideDuration: 800})
    }

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
    <Stack direction={"column"} gap={2} height={"100%"}>
      <TextField label={"含番号的文本，多行时会共用下面的信息"} required multiline minRows={3}
                 value={fh} size={"small"} onChange={handleInputFH}/>
      <FormControl>
        <FormLabel>标签</FormLabel>
        <FormGroup row>{tags}</FormGroup>
      </FormControl>
      <FormControlLabel label="重复发送" sx={{width: "fit-content"}}
                        control={<Checkbox checked={still} onChange={handleInputStill}/>}/>
      <Button variant={"contained"} disabled={working} onClick={handleSend}>记录番号</Button>

      <Accordion defaultExpanded>
        <AccordionSummary>结果（绿：成功；蓝：发过；红：失败）</AccordionSummary>
        {/* 需要设置高度为约150px以下，才能出现滚动条 */}
        <AccordionDetails sx={{height: "150px", overflowY: "auto"}}>{results}</AccordionDetails>
      </Accordion>
    </Stack>
  )
})

// TGBot 设置
const TGBot = React.memo((): JSX.Element => {
  return (
    <Stack gap={2} padding={1} height={"100%"}>
      <Auth/>
      <FanHao/>
    </Stack>
  )
})

export default TGBot