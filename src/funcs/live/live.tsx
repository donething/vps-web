import {
  delRevoke,
  DoListAdd,
  DoLItemProps,
  DoOptionsInputProps,
  DoSnackbarProps,
  useSharedSnackbar
} from "do-comps"
import React, {useEffect, useState} from "react"
import Button from "@mui/material/Button"
import type {SxProps, Theme} from "@mui/material"
import {IconButton, Switch, Typography} from "@mui/material"
import Stack from "@mui/material/Stack"
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined"
import {reqJSON} from "../../comm/comm"
import {AnchorInfo, Plat, Sorts} from "./anchors"
import {useBetween} from "use-between"
import {insertOrdered} from "do-utils"
import {Settings, settingsDefault} from "./settings"

// 样式
const sxOneLine: SxProps<Theme> = {
  display: "block",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
}
const sxWidth300: SxProps<Theme> = {width: 350}

// 排序规则
const sortRules: Function[] = [Sorts.isMarked, Sorts.id]

// 需要分享的值
const useValues = () => {
  // 获取的主播的信息列表
  const [infos, setInfos] = useState<AnchorInfo[]>([])

  return {infos, setInfos}
}

// 需要分享的值
const useSharedValues = () => useBetween(useValues)

// 增加新主播
const handleAdd = async (id: string,
                         plat: Plat,
                         setInfos: React.Dispatch<React.SetStateAction<AnchorInfo[]>>,
                         showSb: (ps: DoSnackbarProps) => void) => {
  // 判断新项的数据是否完整
  if (id === "") {
    showSb({open: true, message: "无法添加主播：ID、房间号为空", severity: "info"})
    return
  }

  // 添加新主播
  const data = `plat=${plat}&id=${id}&operate=add`
  const obj = await reqJSON<AnchorInfo>("/api/live/anchor/operate", data, showSb)
  if (!obj || obj.code !== 0) {
    return
  }

  setInfos(oldArray => [...oldArray, obj.data])
}

// 删除项目
const handleDel = async (info: AnchorInfo,
                         showSb: (ps: DoSnackbarProps) => void,
                         setInfos: React.Dispatch<React.SetStateAction<AnchorInfo[]>>) => {
  await delRevoke(`主播【${info.name}】(${info.uid})`, info, async () => {
    const data = `plat=${info.plat}&id=${info.uid}&operate=del`
    const obj = await reqJSON<null>("/api/live/anchor/operate", data, showSb)

    if (obj?.code !== 0) {
      return Error(obj?.msg)
    }

    setInfos(prev => {
      const anchors = [...prev]
      const index = anchors.findIndex(item => item.uid === info.uid && item.plat === info.plat)
      if (index === -1) {
        console.log("删除主播失败，没有找到索引")
        return prev
      }

      anchors.splice(index, 1)
      return anchors
    })
    return undefined
  }, async info => {
    await handleAdd(info.uid, info.plat, setInfos, showSb)
    return undefined
  }, showSb)
}

// 主播的描述和录制状态的组件
const AnchorDespAndStatus = (props: { desp: string, status: string }) => {
  return (
    <React.Fragment>
      <Typography title={props.desp} className={"line-1"} marginTop={1} marginBottom={1}
                  fontSize={"small"} component="span">{props.desp}</Typography>
      {
        <Typography title={props.status} className={"line-1"} marginTop={1} marginBottom={1}
                    fontSize={"small"} component="span">{props.status ? props.status : "正在获取…"}</Typography>
      }
    </React.Fragment>
  )
}

// 获取某个主播的信息
const genAnchorInfoCompData = (info: AnchorInfo,
                               setInfos: React.Dispatch<React.SetStateAction<AnchorInfo[]>>,
                               showSb: (ps: DoSnackbarProps) => void,
                               isNewAdded?: boolean): DoLItemProps => {
  return {
    id: `${info.plat}_${info.uid}`,
    avatar: info.avatar,
    divider: true,
    isMarked: info.isLive,
    isNewAdded: isNewAdded,
    primary: <Button color={"inherit"} href={info.webUrl} target="_blank"
                     sx={{padding: 0, margin: 0, ...sxOneLine}}>{info.name}</Button>,
    secondary: <AnchorDespAndStatus desp={info.title} status={info.status}/>,
    extra: (
      <Stack>
        <IconButton title={"删除"} onClick={_ => handleDel(info, showSb, setInfos)}>
          <HighlightOffOutlinedIcon opacity={0.3}/>
        </IconButton>
      </Stack>
    )
  }
}

// 主播列表组件
const Live = React.memo(() => {
  // 设置
  const [settings, setSettings] = useState<Settings>(settingsDefault)
  // 主播的信息
  const {infos, setInfos} = useSharedValues()
  // 显示消息
  const {showSb} = useSharedSnackbar()

  // 处理准许录制的开关事件
  const handleSwEnable = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) =>
    setSettings(prev => {
      let newSettings: Settings = {...prev, DisCapture: event.target.checked}

      reqJSON<AnchorInfo[]>("/api/live/settings/set", newSettings, showSb)

      return newSettings
    }), [showSb])

  // 添加面板的属性
  const inputProps: DoOptionsInputProps = React.useMemo(() => {
    return (
      {
        enterNode: "添加",
        onEnter: (value, sList) => handleAdd(value, sList[0] as Plat, setInfos, showSb),
        optionsList: [{
          label: "平台",
          options: [
            {title: "哔哩", value: "bili", tip: "主播的 UID"},
            {title: "抖音", value: "douyin", tip: "主播的 直播间号"},
            {title: "足迹", value: "zuji", tip: "主播的 ID"}
          ]
        }],
        placeholder: "悬浮选项，查看提示",
        size: "small"
      }
    )
  }, [showSb, setInfos])

  // 主播信息，用于显示
  const compInfos = React.useMemo(() => {
    let cInfos: DoLItemProps[] = []
    for (let info of infos) {
      const data = genAnchorInfoCompData(info, setInfos, showSb)
      cInfos = insertOrdered(cInfos, data, sortRules)
    }

    return cInfos
  }, [infos, setInfos, showSb])

  const swEnable = React.useMemo(() => {
    return <Switch title={"禁止录制直播(不会停止正在录制)"} checked={settings.DisCapture} onChange={handleSwEnable}/>
  }, [settings.DisCapture, handleSwEnable])

  const initGetSettings = React.useCallback(async () => {
    // 获取主播列表及其信息
    let obj = await reqJSON<Settings>("/api/live/settings/get", undefined, showSb)
    if (!obj || obj.code !== 0) {
      return
    }

    setSettings(obj.data)
  }, [setSettings, showSb])

  const initGetInfo = React.useCallback(async () => {
    // 获取主播列表及其信息
    let obj = await reqJSON<AnchorInfo[]>("/api/live/anchor/getinfo",
      undefined, showSb)
    if (!obj || obj.code !== 0) {
      return
    }

    setInfos(obj.data || [])
  }, [setInfos, showSb])

  // 获取录制状态
  const getCapStatus = React.useCallback(async () => {
    // 获取到主播数据前，不需要获取录制状态
    if (infos.length === 0) {
      return
    }

    // 获取主播列表及其信息
    let obj = await reqJSON<{ [key: string]: string }>(
      "/api/live/anchor/capture/status", undefined, showSb)
    if (!obj || obj.code !== 0) {
      return
    }

    setInfos(prev => {
      const items = [...prev]
      for (let item of items) {
        const status = obj?.data[item.plat + "_" + item.uid]
        if (!status) {
          continue
        }

        item.status = status
      }
      return items
    })

  }, [infos, setInfos, showSb])

  useEffect(() => {
    // 初始化
    initGetSettings()
    initGetInfo()
  }, [initGetInfo, initGetSettings])

  useEffect(() => {
    const intervalId = setInterval(() => {
      getCapStatus()
    }, 1000)

    return () => clearInterval(intervalId)
  }, [getCapStatus])

  useEffect(() => {
    document.title = "主播"
  }, [])

  return (
    <>
      <DoListAdd list={compInfos} title={"主播"} inputProps={inputProps} sx={sxWidth300} slot={swEnable}/>
    </>
  )
})

export default Live