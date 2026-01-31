import { Outlet, NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  GitBranch, 
  AlertCircle, 
  Users, 
  Code2, 
  Boxes,
  FileText,
  FolderGit2,
  Menu,
  X,
  Rocket,
  Globe2,
  Database
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '../lib/utils'

const navigation = [
  { name: 'Ecosystem Home', href: '/', icon: LayoutDashboard },
  { name: 'My Projects', href: '/projects', icon: FolderGit2 },
  { name: 'CI/CD Pipelines', href: '/pipelines', icon: GitBranch },
  { name: 'CI/CD Philosophy', href: '/cicd-philosophy', icon: Boxes },
  { name: 'Architecture', href: '/architecture', icon: Database },
  { name: 'Error Triage', href: '/errors', icon: AlertCircle },
  { name: 'Knowledge Base', href: '/documentation', icon: FileText },
  { name: 'Team Directory', href: '/contacts', icon: Users },
  { name: 'AI Code Review', href: '/code-review', icon: Code2 },
  { name: 'API Explorer', href: '/sdk', icon: Boxes },
]

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Globe2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-semibold text-gray-900">Ecosystem</span>
              <span className="text-xs text-gray-400 block -mt-0.5">Developer Platform</span>
            </div>
          </div>
          <button 
            className="lg:hidden p-1 rounded hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-white" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-medium text-indigo-600">Quick Onboarding</span>
          </div>
          <div className="text-xs text-gray-500">
            <div className="font-medium text-gray-700">Ecosystem SDK v1.0.0</div>
            <div>Reducing friction, accelerating delivery</div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6">
          <button 
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
