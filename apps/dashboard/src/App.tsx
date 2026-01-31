import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Pipelines } from './pages/Pipelines'
import { Errors } from './pages/Errors'
import { Contacts } from './pages/Contacts'
import { CodeReview } from './pages/CodeReview'
import { SDKPlayground } from './pages/SDKPlayground'
import { Documentation } from './pages/Documentation'
import { Projects } from './pages/Projects'
import { CICDPhilosophy } from './pages/CICDPhilosophy'
import { Architecture } from './pages/Architecture'
import { Chatbot } from './components/Chatbot'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="pipelines" element={<Pipelines />} />
          <Route path="cicd-philosophy" element={<CICDPhilosophy />} />
          <Route path="architecture" element={<Architecture />} />
          <Route path="errors" element={<Errors />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="code-review" element={<CodeReview />} />
          <Route path="sdk" element={<SDKPlayground />} />
          <Route path="documentation" element={<Documentation />} />
          <Route path="projects" element={<Projects />} />
        </Route>
      </Routes>
      <Chatbot />
    </>
  )
}

export default App
