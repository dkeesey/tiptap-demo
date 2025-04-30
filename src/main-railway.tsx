import React from 'react'
import ReactDOM from 'react-dom/client'
import RailwayApp from './RailwayApp'
import './styles/index.css'
import './styles/ai-prompt.css'
import './styles/slash-commands.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RailwayApp />
  </React.StrictMode>,
)
