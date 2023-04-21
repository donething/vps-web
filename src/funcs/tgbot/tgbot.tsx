import React from "react"
import {
  Accordion, AccordionDetails, AccordionSummary, Alert,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel, IconButton, Radio, RadioGroup,
  Stack,
  TextField, Typography
} from "@mui/material"
import {useSharedSnackbar} from "do-comps"
import {InputInfo, SendResult, WebSite, WebSiteCType} from "./types"
import KeyboardDoubleArrowRightOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowRightOutlined'
import KeyboardDoubleArrowLeftOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowLeftOutlined'
import {getJSON} from "../../comm/comm"

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

// 解析标签信息
const parseTags = (tagsStr: string) => {
  const tags = tagsStr.split(",").filter(v => !!v)
  return Object.fromEntries(tags.map(v => [v, false]))
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
  // 发送的额外信息
  const [extra, setExtra] = React.useState("")
  // 是否重复发送
  const [still, setStill] = React.useState(false)
  // 标签选择的信息
  const [tagObj, setTagObj] = React.useState<{ [tag: string]: boolean }>({})
  // 编辑标签时保存临时内容
  const [tagTmp, setTagTmp] = React.useState("")
  // 是否展示标签编辑框
  const [tagVisible, setTagVisible] = React.useState(false)
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

  const handleInputExtra = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setExtra(e.target.value)
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

  // 显示开关标签编辑器的图标
  const tagIcon = React.useMemo(() => {
    return tagVisible ? <KeyboardDoubleArrowLeftOutlinedIcon/> : <KeyboardDoubleArrowRightOutlinedIcon/>
  }, [tagVisible])

  // 重置输入的信息
  const reset = React.useCallback(() => {
    setContent("")
    setExtra("")
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
    const data = `ctype=${webSite[cType].cType}&content=${encodeURIComponent(content)}&` +
      `tags=${encodeURIComponent(tagsStr)}&extra=${encodeURIComponent(extra)}&still=${still}`

    const json = await getJSON<SendResult[]>("/api/tgbot/send", data)
    if (!json) {
      return
    }

    setWorking(false)
    setResult(json.data)

    // 此次有发送失败的，需提示。code 为 20 表示发送失败
    if (json.data.filter(r => r.code === 20).length !== 0) {
      console.log(TAG, "有失败的内容")
      showSb({open: true, severity: "error", message: "有失败的内容", autoHideDuration: 800})
    } else {
      // 恢复输入为初始值
      reset()
    }
  }, [content, extra, still, tagObj, cType, reset, webSite, showSb])

  const init = React.useCallback(async () => {
    const obj = await getJSON<WebSite>("/api/tgbot/website")
    if (!obj || obj.code !== 0) {
      return
    }

    setWebSite(obj.data)
  }, [showSb])

  React.useEffect(() => {
    init()
  }, [init])

  React.useEffect(() => {
    setTagTmp(webSite[cType].tags)
    setTagObj(parseTags(webSite[cType].tags))
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

      <TextField label={webSite[cType].inputLabel} value={content}
                 required multiline maxRows={3} size={"small"} onChange={handleInputContent}/>

      <TextField label={"额外的说明"} value={extra}
                 multiline maxRows={3} size={"small"} onChange={handleInputExtra}/>

      <FormControl>
        <FormLabel>
          <Stack direction={"row"} alignItems={"center"} gap={0.5}>
            <Typography flex={"0 0 auto"}>标签</Typography>
            <IconButton title={"编辑标签信息"} onClick={() => setTagVisible(prev => !prev)}>
              {tagIcon}
            </IconButton>

            <TextField size={"small"} fullWidth label={"多个标签用逗号分隔"} sx={{display: tagVisible ? "" : "none"}}
                       value={tagTmp}
                       onChange={e => setTagTmp(e.target.value)}
                       onKeyDown={async e => {
                         // 回车后修改网站信息、设置标签编辑框不可见、发送修改到服务端
                         if (e.key !== "Enter") {
                           return
                         }
                         e.preventDefault()

                         setWebSite(prev => {
                           // 先提取目标的 InputInfo，修改其 tags 后，返回完整 website 信息以完成完整的修改
                           const obj: InputInfo = {...webSite[cType], tags: tagTmp}
                           return {...prev, [cType]: obj}
                         })

                         setTagVisible(false)

                         const data = `tags=${tagTmp}`
                         const obj = await getJSON("/api/tgbot/tags/edit", data)
                         if (!obj || obj.code !== 0) {
                           console.log(TAG, "修改标签出错：", obj?.msg)
                           showSb({open: true, severity: "error", message: "修改标签出错：" + obj?.msg})
                           return
                         }
                       }}
            />
          </Stack>
        </FormLabel>
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
      <Sender/>
    </Stack>
  )
})

export default TGBot