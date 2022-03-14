import React, {useRef} from "react"
import {List, SxProps} from "@mui/material"

// 上下滑动到两端，可加载更多的列表组件
const ListInfinite = (props: {
  // 列表项
  content: JSX.Element,

  // 加载之前的更多
  onLoadPrev?: (event: React.UIEvent<HTMLElement>) => void,
  // 距离顶部多少像素时触发加载更多。默认 300 px
  toTop?: number,

  // 加载之后的更多
  onLoadNext?: (event: React.UIEvent<HTMLElement>) => void,
  // 距离底部多少像素时触发加载更多。默认 300 px
  toBottom?: number,

  // 一次滚动操作触发后，需等待多少毫秒可再次触发。默认 500 ms
  waitInterval?: number

  // 样式
  sx?: SxProps
  // 其它属性
  ps?: React.ReactPropTypes
}) => {
  // 避免多次误触发滚动，再一次滚动操作后，需要等待一会才能再次触发
  const waitingRef = useRef(false)

  return (
    <List id="do-list-infinite" sx={{...props.sx, overflowY: "auto"}} {...props.ps} onWheel={e => {
      // 判断是否处于等待间隔中，是就直接退出
      if (waitingRef.current) return

      // 不是，就可以执行滚动操作，并设置需等待状态及一会后自动释放
      waitingRef.current = true
      setTimeout(() => waitingRef.current = false, props.waitInterval || 500)

      // 判断并执行响应的加载操作
      let elem = (e.target as HTMLElement).closest("#do-list-infinite") as HTMLElement
      // 加载之前
      if (props.onLoadPrev && e.deltaY < 0 && elem.scrollTop <= (props.toTop || 300)) {
        props.onLoadPrev(e)
      }
      // 加载之后
      if (props.onLoadNext && e.deltaY > 0 &&
        elem.scrollHeight - elem.scrollTop - elem.clientHeight <= (props.toBottom || 300)) {
        props.onLoadNext(e)
      }
    }}>
      {props.content}
    </List>
  )
}

export default ListInfinite