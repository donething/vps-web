import React from 'react'
import {Link} from "react-router-dom"
import {Button, Stack} from "@mui/material"
import {request} from "do-utils"
import {JResult} from "./comm/typedef"
import Settings, {LS_ACCESS_Enable_KEY, LS_ACCESS_KEY} from "./funcs/settings"
import {useSharedSnackbar} from "do-comps"

const TAG = "[App]"

// 首页
function App() {
  const [access, setAccess] = React.useState<boolean | undefined>(undefined)

  const {showSb} = useSharedSnackbar()

  const init = React.useCallback(async () => {
    if (localStorage.getItem(LS_ACCESS_Enable_KEY)) {
      setAccess(true)
      return
    }

    const resp = await request("/api/access/judge", `access=${localStorage.getItem(LS_ACCESS_KEY) || ""}`)
    const json: JResult<any> = await resp.json()
    if (json.code !== 0) {
      console.log(TAG, json.msg)
      showSb({open: true, severity: "warning", message: json.msg})
      return
    }

    setAccess(json.code === 0)
    localStorage.setItem(LS_ACCESS_Enable_KEY, "true")
  }, [showSb])

  React.useEffect(() => {
    init()
  }, [init])

  if (!access) {
    return <Settings/>
  }

  return (
    <Stack alignItems={"center"} gap={4}
           sx={{width: "100%", height: "100%", bgcolor: "background.paper", paddingTop: 10}}>
      <Link to={"music"}><Button size={"large"}>Music</Button></Link>
      <Link to={"fserver"}><Button size={"large"}>FServer</Button></Link>
      <Link to={"tgbot"}><Button size={"large"}>TGBot</Button></Link>
      {/*<Link to={"tasks"}><Button size={"large"}>Tasks</Button></Link>*/}
      {/*<Link to={"router"}><Button size={"large"}>Router</Button></Link>*/}
      <Link to={"settings"}><Button size={"large"}>Settings</Button></Link>
    </Stack>
  )
}

export default App
