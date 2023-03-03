import React from "react"
import {
  Accordion, AccordionDetails, AccordionSummary, Alert,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel, Radio, RadioGroup,
  Stack,
  TextField
} from "@mui/material"
import {useSharedSnackbar} from "do-comps"
import {request} from "do-utils"
import {JResult} from "../../comm/typedef"
import Auth from "../../auth"
import {SendResult, WebSite, WebSiteCType} from "./types"

// 标签
const TAG = "[TGBot]"

// 初始发送内容的类型
const initCType: WebSiteCType = "fanhao"
// 初始网站信息
const initWebSite: WebSite = {
  fanhao: {
    cType: "",
    cTypeName: "",
    inputLabel: "",
    tags: "",
    bnText: ""
  },
  novel: {
    cType: "",
    cTypeName: "",
    inputLabel: "",
    tags: "",
    bnText: ""
  }
}

/**
 * 发送结果展示
 * @param props 番号、发送结果代码
 */
const LItem = (props: { text: string, code: number, msg: string }) => {
  // 对应成功、发过、失败
  const s = props.code === 0 ? "success" : props.code === 10 ? "info" : "error"

  return (
    <Alert severity={s} title={props.msg}>{props.text}：{props.msg}</Alert>
  )
}

// 发送面板
const Sender = React.memo((): JSX.Element => {
  // 网站地图
  const [webSite, setWebSite] = React.useState(initWebSite)
  // 当前选择的发送内容的类型
  const [cType, setCType] = React.useState<WebSiteCType>(initCType)
  // 发送的内容
  const [content, setContent] = React.useState("")
  // 是否重复发送
  const [still, setStill] = React.useState(false)
  // 标签选择的信息
  const [tagObj, setTagObj] = React.useState<{ [tag: string]: boolean }>({})
  // 发送的结果
  const [result, setResult] = React.useState<SendResult[]>([])
  // 是否工作中
  const [working, setWorking] = React.useState(false)

  const {showSb} = useSharedSnackbar()

  // 回调
  const handleInputCType = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCType(e.target.value as WebSiteCType)
  }, [])

  const handleInputContent = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value)
  }, [])

  const handleInputStill = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStill(e.target.checked)
  }, [])

  // 当前可供选择的发送内容类型的组件
  const ctypes = React.useMemo(() => {
    return Object.entries(webSite || {}).map(([key, info]) =>
      <FormControlLabel key={key} value={key} control={
        <Radio onChange={handleInputCType}/>} label={info.cTypeName}/>
    )
  }, [webSite, handleInputCType])

  // 标签信息的组件
  const tags = React.useMemo(() => {
    return Object.entries(tagObj).map(([tag, bool]) =>
      <FormControlLabel key={tag} control={<Checkbox checked={bool} onChange={e =>
        setTagObj(prev => ({...prev, [tag]: e.target.checked}))}/>} label={tag}/>)
  }, [tagObj])

  // 发送结果的组件
  const results = React.useMemo(() => {
    return result.map(r => <LItem key={r.name} text={r.name} code={r.code} msg={r.msg}/>)
  }, [result])

  const reset = React.useCallback(() => {
    setContent("")
    setStill(false)
    setTagObj(prev => Object.fromEntries(Object.entries(prev).map(([v]) => [[v], false])))
  }, [])

  const handleSend = React.useCallback(async () => {
    if (!content) {
      showSb({open: true, severity: "warning", message: "内容为空"})
      return
    }

    setWorking(true)
    setResult([])
    const tagsStr = Object.entries(tagObj).filter(([_, b]) => b).map(([tag]) => "#" + tag).join(" ")
    const data = `ctype=${webSite[cType].cType}&content=${encodeURIComponent(content)}` +
      `&tags=${encodeURIComponent(tagsStr)}&still=${still}`

    const resp = await request("/api/tgbot/send", data)
    const json: JResult<SendResult[]> = await resp.json()
    setWorking(false)
    setResult(json.data)

    // 此次有发送失败的番号，需提示
    if (json.data.filter(r => r.code === 20).length !== 0) {
      console.log(TAG, "有失败的番号")
      showSb({open: true, severity: "error", message: "有失败的番号", autoHideDuration: 800})
    }

    // 恢复输入为初始值
    reset()
  }, [content, still, tagObj, cType, reset, showSb])

  const init = React.useCallback(async () => {
    const resp = await request("/api/tgbot/website")
    const obj: JResult<WebSite> = await resp.json()
    setWebSite(obj.data)
  }, [])

  React.useEffect(() => {
    init()
  }, [init])

  React.useEffect(() => {
    const tagsStr = decodeURIComponent(webSite[cType].tags)
    const tags = tagsStr.split(" ").filter(v => !!v)
    const map = Object.fromEntries(tags.map(v => [v, false]))
    setTagObj(map)
  }, [webSite, cType])

  React.useEffect(() => {
    document.title = "记录番号"
  }, [])

  return (
    <Stack direction={"column"} gap={2} height={"100%"}>
      <FormControl>
        <FormLabel>发送内容的类型</FormLabel>
        <RadioGroup row defaultValue={initCType} name="ctypes">{ctypes}</RadioGroup>
      </FormControl>

      <TextField label={webSite[cType].inputLabel} required multiline rows={3}
                 value={content} size={"small"} onChange={handleInputContent}/>

      <FormControl sx={{display: Object.keys(tagObj).length === 0 ? "none" : "inline-flex"}}>
        <FormLabel>标签</FormLabel>
        <FormGroup row>{tags}</FormGroup>
      </FormControl>

      <FormControlLabel label="重复发送" sx={{width: "fit-content"}}
                        control={<Checkbox checked={still} onChange={handleInputStill}/>}/>
      <Button variant={"contained"} disabled={working} onClick={handleSend}>{webSite[cType].bnText}</Button>

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
      <Sender/>
    </Stack>
  )
})

export default TGBot