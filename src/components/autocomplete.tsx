import {
  Autocomplete, IconButton,
  ListItem,
  ListItemText,
  TextField
} from "@mui/material"
import {HTMLAttributes} from "react"
import {HighlightOffOutlined} from "@mui/icons-material"

// 自动完成输入框组件
const AutocompleteComp = (props: {
  label: string
  options: Array<string>
  onEnter: (option: string) => void
  onDelOption?: (option: string) => void
  ps?: {}
}) => {
  return (
    <Autocomplete {...props.ps} size={"small"} disablePortal freeSolo options={props.options}
                  renderOption={(ps: HTMLAttributes<HTMLElement>, option: string) => {
                    return (
                      <ListItem {...ps} >
                        <ListItemText primary={option} onClick={() => props.onEnter(option)}/>
                        <IconButton onClick={e => {
                          e.stopPropagation()
                          props.onDelOption && props.onDelOption(option)
                        }}>
                          <HighlightOffOutlined/>
                        </IconButton>
                      </ListItem>
                    )
                  }} renderInput={params =>
      <TextField {...params} label={props.label} autoFocus
                 onKeyDown={e => {
                   let keyword = (e.target as HTMLInputElement).value.trim()
                   // 按回车键开始搜索
                   if (e.code.toLowerCase() === "enter") {
                     props.onEnter(keyword)
                   }
                 }}
      />}
    />
  )
}

export default AutocompleteComp