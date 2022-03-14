import React from 'react'
import ReactDOM from 'react-dom'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import './comm/global.css'
import './index.css'
import reportWebVitals from './reportWebVitals'
import {HashRouter, Route, Routes} from "react-router-dom"
import App from "./App"
import Music from "./funcs/music"
import Settings from "./funcs/settings"
import FServer from "./funcs/fserver"
import {SnackbarComp} from "./components/snackbar"
import DialogComp from "./components/dialog"

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App/>}/>
        <Route path="/music" element={<Music/>}/>
        <Route path="/settings" element={<Settings/>}/>
        <Route path="/fserver" element={<FServer/>}/>
      </Routes>
    </HashRouter>

    <SnackbarComp/>
    <DialogComp/>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
