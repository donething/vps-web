import React, {useEffect} from 'react'
import {Link} from "react-router-dom"
import {Button, Stack} from "@mui/material"

// 首页
function App() {
  useEffect(() => {
    document.title = "首页"
  })

  return (
    <Stack alignItems={"center"} gap={4}
           sx={{width: "100%", height: "100%", bgcolor: "background.paper", paddingTop: 10}}>
      <Link to={"music"}><Button size={"large"}>Music</Button></Link>
      <Link to={"fserver"}><Button size={"large"}>FServer</Button></Link>
      <Link to={"tasks"}><Button size={"large"}>Tasks</Button></Link>
      <Link to={"settings"}><Button size={"large"}>Settings</Button></Link>
    </Stack>
  )
}

export default App
