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
import {insertOrdered} from "do-utils"
import type {SxProps, Theme} from "@mui/material"
import {IconButton, Typography} from "@mui/material"
import Stack from "@mui/material/Stack"
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined'
import {getJSON} from "../../comm/comm"
import {AnchorInfo, Plat, Sorts} from "./anchors"

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

// 增加新主播
const onAdd = async (id: string,
                     plat: Plat,
                     setInfos: React.Dispatch<React.SetStateAction<DoLItemProps[]>>,
                     showSb: (ps: DoSnackbarProps) => void) => {
  // 判断新项的数据是否完整
  if (id === "") {
    showSb({open: true, message: "无法添加主播：ID、房间号为空", severity: "info"})
    return
  }

  // 添加新主播
  const data = `plat=${plat}&id=${id}&operate=add`
  const obj = await getJSON<AnchorInfo>("/api/live/anchor/operate", data, showSb)
  if (!obj) {
    return
  }

  // 获取信息详情以显示
  let props = getAnchorInfo(obj.data, setInfos, showSb, true)
  setInfos(oldArray => insertOrdered(oldArray, props, sortRules))
}

// 删除项目
const handleDel = async (info: AnchorInfo,
                         showSb: (ps: DoSnackbarProps) => void,
                         setInfos: React.Dispatch<React.SetStateAction<DoLItemProps[]>>) => {
  await delRevoke(`主播【${info.name}】(${info.id})`, info, async () => {
    const data = `plat=${info.plat}&id=${info.id}&operate=del`
    const obj = await getJSON<null>("/api/live/anchor/operate", data, showSb)

    if (obj?.code !== 0) {
      return Error(obj?.msg)
    }

    setInfos(prev => {
      const anchors = [...prev]
      anchors.splice(anchors.findIndex(item => item.id === `${info.plat}_${info.id}`), 1)
      return anchors
    })
    return undefined
  }, async info => {
    await onAdd(info.id, info.plat, setInfos, showSb)
    return undefined
  }, showSb)
}

// 获取某个主播的信息
const getAnchorInfo = (info: AnchorInfo,
                       setInfos: React.Dispatch<React.SetStateAction<DoLItemProps[]>>,
                       showSb: (ps: DoSnackbarProps) => void,
                       isNewAdded?: boolean): DoLItemProps => {
  return {
    id: `${info.plat}_${info.id}`,
    avatar: info.avatar,
    divider: true,
    isMarked: info.isLive,
    isNewAdded: isNewAdded,
    primary: <Button color={"inherit"} href={info.webUrl} target="_blank"
                     sx={{padding: 0, margin: 0, ...sxOneLine}}>{info.name}</Button>,
    secondary: <Typography title={info.title} className={"line-1"} marginTop={1} marginBottom={1}
                           fontSize={"small"} component="span">{info.title}</Typography>,
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
  // 主播信息，用于显示
  const [infos, setInfos] = useState<DoLItemProps[]>([])

  // 显示消息
  const {showSb} = useSharedSnackbar()

  // 添加面板的属性
  const inputProps: DoOptionsInputProps = React.useMemo(() => {
    return (
      {
        enterNode: "添加",
        onEnter: (value, sList) => onAdd(value, sList[0] as Plat, setInfos, showSb),
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
  }, [showSb])

  const init = React.useCallback(async () => {
    // 获取主播列表及其信息
    let obj = await getJSON<AnchorInfo[]>("/api/live/anchor/getinfo", undefined, showSb)
    if (!obj) {
      return
    }

    const anchorsInfo = obj.data
    // 获取状态并显示
    setInfos([])
    anchorsInfo.map(info => setInfos(oldArray =>
      insertOrdered(oldArray, getAnchorInfo(info, setInfos, showSb), sortRules)))
  }, [showSb])

  useEffect(() => {
    // 初始化
    init()
  }, [init])

  return (
    <>
      <DoListAdd list={infos} title={"主播"} inputProps={inputProps} sx={sxWidth300}/>
    </>
  )
})

export default Live