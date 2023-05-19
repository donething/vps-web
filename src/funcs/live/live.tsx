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
import {IconButton, Typography} from "@mui/material"
import Stack from "@mui/material/Stack"
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined'
import {getJSON} from "../../comm/comm"
import {AnchorInfo, Plat, Sorts} from "./anchors"
import {useBetween} from "use-between"
import {insertOrdered} from "do-utils"

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
  const obj = await getJSON<AnchorInfo>("/api/live/anchor/operate", data, showSb)
  if (!obj) {
    return
  }

  setInfos(oldArray => [...oldArray, obj.data])
}

// 删除项目
const handleDel = async (info: AnchorInfo,
                         showSb: (ps: DoSnackbarProps) => void,
                         setInfos: React.Dispatch<React.SetStateAction<AnchorInfo[]>>) => {
  await delRevoke(`主播【${info.name}】(${info.id})`, info, async () => {
    const data = `plat=${info.plat}&id=${info.id}&operate=del`
    const obj = await getJSON<null>("/api/live/anchor/operate", data, showSb)

    if (obj?.code !== 0) {
      return Error(obj?.msg)
    }

    setInfos(prev => {
      const anchors = [...prev]
      const index = anchors.findIndex(item => item.id === info.id && item.plat === info.plat)
      if (index == -1) {
        console.log("删除主播失败，没有找到索引")
        return prev
      }

      anchors.splice(index, 1)
      return anchors
    })
    return undefined
  }, async info => {
    await handleAdd(info.id, info.plat, setInfos, showSb)
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
        !!props.status && <Typography title={props.status} className={"line-1"} marginTop={1} marginBottom={1}
                                      fontSize={"small"} component="span">{props.status}</Typography>
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
    id: `${info.plat}_${info.id}`,
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
  // 主播的信息
  const {infos, setInfos} = useSharedValues()
  // 显示消息
  const {showSb} = useSharedSnackbar()
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

  const init = React.useCallback(async () => {
    // 获取主播列表及其信息
    let obj = await getJSON<AnchorInfo[]>("/api/live/anchor/getinfo", undefined, showSb)
    if (!obj) {
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
    let obj = await getJSON<{ [key: string]: string }>("/api/live/anchor/capture/status",
      undefined, showSb)
    if (!obj) {
      return
    }

    setInfos(prev => {
      const items = [...prev]
      for (let item of items) {
        const status = obj?.data[item.plat + "_" + item.id]
        if (!status) {
          continue
        }

        item.status = status
      }
      return items
    })

  }, [showSb, setInfos])

  useEffect(() => {
    // 初始化
    init()
  }, [init])

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
      <DoListAdd list={compInfos} title={"主播"} inputProps={inputProps} sx={sxWidth300}/>
    </>
  )
})

export default Live