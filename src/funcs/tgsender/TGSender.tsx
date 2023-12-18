import React from "react"
import {
  Alert,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel, Radio, RadioGroup,
  Stack,
  TextField
} from "@mui/material"
import {useSharedSnackbar} from "do-comps"
import {SendResult, WebSite, WebSiteCType} from "./types"
import {reqJSON} from "../../comm/comm"

// 标签
const TAG = "[TGSender]"

// 初始发送内容的类型
const initCType: WebSiteCType = "movie"
// 初始网站信息
const initWebSite: WebSite = {
  movie: {
    cType: "",
    cTypeName: "",
    inputLabel: "",
    bnText: ""
  },
  novel: {
    cType: "",
    cTypeName: "",
    inputLabel: "",
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
  // 发送的结果
  const [result, setResult] = React.useState<SendResult>()
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


  // 当前可供选择的发送内容类型的组件
  const ctypes = React.useMemo(() => {
    return Object.entries(webSite || {}).map(([key, info]) =>
      <FormControlLabel key={key} value={key} control={
        <Radio onChange={handleInputCType}/>} label={info.cTypeName}/>
    )
  }, [webSite, handleInputCType])

  // 发送结果的组件
  const resultElem = React.useMemo(() => {
    return result ? <LItem key={result.name} text={result.name} code={result.code} msg={result.msg}/> :
      <Alert severity={"info"}>等待发送任务…</Alert>
  }, [result])

  const handleSend = React.useCallback(async () => {
    if (!content) {
      showSb({open: true, severity: "warning", message: "内容为空"})
      return
    }

    setWorking(true)
    setResult(undefined)
    const data = `ctype=${webSite[cType].cType}&content=${encodeURIComponent(content)}`
    const json = await reqJSON<SendResult>("/api/tgsender/send", data)
    if (!json) {
      return
    }

    setWorking(false)
    setResult(json.data)
    setContent("")
  }, [content, cType, webSite, showSb])

  const init = React.useCallback(async () => {
    const obj = await reqJSON<WebSite>("/api/tgsender/website")
    if (!obj || obj.code !== 0) {
      return
    }

    setWebSite(obj.data)
  }, [])

  React.useEffect(() => {
    init()
  }, [init])

  React.useEffect(() => {
    document.title = "记录电影"
  }, [])

  return (
    <Stack direction={"column"} gap={2} height={"100%"}>
      <FormControl>
        <FormLabel>发送内容的类型</FormLabel>
        <RadioGroup row defaultValue={initCType} name="ctypes">{ctypes}</RadioGroup>
      </FormControl>

      <TextField label={webSite[cType].inputLabel} value={content}
                 required size={"small"} onChange={handleInputContent}/>

      <Button variant={"contained"} disabled={working} onClick={handleSend}>{webSite[cType].bnText}</Button>

      {resultElem}
    </Stack>
  )
})

// TGBot 设置
const TGSender = React.memo((): JSX.Element => {
  return (
    <Stack gap={2} padding={1} height={"100%"}>
      <Sender/>
    </Stack>
  )
})

export default TGSender