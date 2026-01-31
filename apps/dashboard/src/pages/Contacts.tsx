import { useState } from 'react'
import { 
  Search, 
  Plus,
  Mail,
  Phone,
  Building2,
  Tag
} from 'lucide-react'
import { cn } from '../lib/utils'

type ContactType = 'internal' | 'external' | 'vendor' | 'partner'

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  title?: string
  department?: string
  organization: string
  type: ContactType
  tags: string[]
}

const demoContacts: Contact[] = [
  {
    id: '1',
    name: 'John Martinez',
    email: 'john.martinez@company.com',
    phone: '+1 (555) 123-4567',
    title: 'Senior Engineer',
    department: 'Platform',
    organization: 'Engineering',
    type: 'internal',
    tags: ['platform', 'backend'],
  },
  {
    id: '2',
    name: 'Sarah Kim',
    email: 'sarah.kim@company.com',
    title: 'Tech Lead',
    department: 'Game Engine',
    organization: 'Engineering',
    type: 'internal',
    tags: ['game-engine', 'graphics'],
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.j@aws.com',
    phone: '+1 (555) 987-6543',
    title: 'Account Manager',
    organization: 'AWS',
    type: 'vendor',
    tags: ['cloud', 'infrastructure'],
  },
  {
    id: '4',
    name: 'Emily Chen',
    email: 'emily.chen@partnerstudio.com',
    title: 'Integration Lead',
    organization: 'Partner Studio',
    type: 'partner',
    tags: ['integration', 'sdk'],
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.w@company.com',
    title: 'DevOps Engineer',
    department: 'Infrastructure',
    organization: 'Engineering',
    type: 'internal',
    tags: ['devops', 'ci-cd'],
  },
  {
    id: '6',
    name: 'Lisa Thompson',
    email: 'lisa.t@external.com',
    title: 'Consultant',
    organization: 'External Consulting',
    type: 'external',
    tags: ['consulting', 'architecture'],
  },
]

const typeConfig: Record<ContactType, { label: string; color: string; bg: string }> = {
  internal: { label: 'Internal', color: 'text-blue-700', bg: 'bg-blue-100' },
  external: { label: 'External', color: 'text-gray-700', bg: 'bg-gray-100' },
  vendor: { label: 'Vendor', color: 'text-purple-700', bg: 'bg-purple-100' },
  partner: { label: 'Partner', color: 'text-green-700', bg: 'bg-green-100' },
}

export function Contacts() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ContactType | 'all'>('all')

  const filteredContacts = demoContacts.filter(c => {
    if (typeFilter !== 'all' && c.type !== typeFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.organization.toLowerCase().includes(q)
      )
    }
    return true
  })

  const stats = {
    internal: demoContacts.filter(c => c.type === 'internal').length,
    external: demoContacts.filter(c => c.type === 'external').length,
    vendor: demoContacts.filter(c => c.type === 'vendor').length,
    partner: demoContacts.filter(c => c.type === 'partner').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500">Address book for your organization</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(stats).map(([type, count]) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type as ContactType)}
            className={cn(
              "p-4 rounded-xl border transition-colors text-left",
              typeFilter === type 
                ? "border-primary bg-primary/5" 
                : "border-gray-200 bg-white hover:border-gray-300"
            )}
          >
            <div className="text-2xl font-bold text-gray-900">{count}</div>
            <div className="text-sm text-gray-500 capitalize">{type}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        {typeFilter !== 'all' && (
          <button
            onClick={() => setTypeFilter('all')}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Contact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => {
          const config = typeConfig[contact.type]
          return (
            <div 
              key={contact.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                  {contact.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  config.bg, config.color
                )}>
                  {config.label}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900">{contact.name}</h3>
              {contact.title && (
                <p className="text-sm text-gray-500">{contact.title}</p>
              )}

              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${contact.email}`} className="hover:text-primary truncate">
                    {contact.email}
                  </a>
                </div>
                {contact.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{contact.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span>{contact.organization}</span>
                  {contact.department && (
                    <span className="text-gray-400">• {contact.department}</span>
                  )}
                </div>
              </div>

              {contact.tags.length > 0 && (
                <div className="mt-3 flex items-center gap-1 flex-wrap">
                  <Tag className="w-3 h-3 text-gray-400" />
                  {contact.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
