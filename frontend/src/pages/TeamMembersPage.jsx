import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Mail, Calendar, Search, User, Globe, AtSign } from 'lucide-react'
import boardService from '../services/board'
import useAuth from '../hooks/useAuth'
import { getUserColor, getUserInitials } from '../utils/userColors'

const TeamMembersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { user: currentUser } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await boardService.getUsers()
      setUsers(data)
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setError('Failed to load team members')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users
    .filter(user => user.id !== currentUser?.id)
    .filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    )

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="p-10 max-w-7xl mx-auto min-h-screen bg-page-bg">
      {/* 1. Header with clear branding */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-[16px]">
          <div className="w-[56px] h-[56px] shrink-0 rounded-[12px] bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
            <Users className="w-[28px] h-[28px]" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-[32px] font-extrabold text-text-primary leading-tight tracking-tight mb-[4px]">Team Members</h1>
            <p className="text-[14px] font-bold text-text-secondary opacity-60">Workspace Directory</p>
          </div>
        </div>

        <div className="relative group w-full md:w-[400px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" size={20} strokeWidth={2.5} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1A1D21] border-2 border-border/60 hover:border-border rounded-2xl pl-14 pr-6 py-4 text-text-primary text-[16px] focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all placeholder:text-text-muted/40 shadow-xl"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-surface/50 border border-border/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-[#0F1113] border border-white/[0.05] rounded-[24px] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/[0.05]">
                  <th className="px-10 py-6 text-[11px] font-black text-text-muted uppercase tracking-[0.2em]">Full Identity</th>
                  <th className="px-10 py-6 text-[11px] font-black text-text-muted uppercase tracking-[0.2em]">Contact Gateway</th>
                  <th className="px-10 py-6 text-[11px] font-black text-text-muted uppercase tracking-[0.2em]">Enrolled Since</th>
                  <th className="px-10 py-6 text-[11px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="group hover:bg-white/[0.015] transition-all duration-300"
                  >
                    {/* Identity - Bold & Large */}
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 shrink-0 rounded-2xl ${getUserColor(user.id)} flex items-center justify-center border-2 border-white/10 shadow-xl group-hover:scale-105 transition-all duration-500`}>
                          <span className="text-[18px] font-black text-white uppercase tracking-tighter">{getUserInitials(user)}</span>
                        </div>
                        <span className="text-[19px] font-black text-text-primary group-hover:text-white transition-colors">
                          {user.full_name || user.email.split('@')[0]}
                        </span>
                      </div>
                    </td>

                    {/* Email - Large & Vivid Icon */}
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4 text-text-secondary group-hover:text-text-primary transition-colors">
                        <div className="w-9 h-9 bg-accent/5 border border-accent/20 rounded-xl flex items-center justify-center">
                          <Mail className="w-[18px] h-[18px] text-accent" strokeWidth={2.5} />
                        </div>
                        <span className="text-[16px] font-bold">{user.email}</span>
                      </div>
                    </td>

                    {/* Date - Large & Vivid Icon */}
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4 text-text-secondary group-hover:text-text-primary transition-colors">
                         <div className="w-9 h-9 bg-purple-500/5 border border-purple-500/20 rounded-xl flex items-center justify-center">
                           <Calendar className="w-[18px] h-[18px] text-purple-400" strokeWidth={2.5} />
                         </div>
                        <span className="text-[16px] font-bold">{formatDate(user.created_at)}</span>
                      </div>
                    </td>

                    <td className="px-10 py-6 text-right">
                       <div className="flex items-center justify-end">
                          <div className="px-5 py-2.5 bg-success/5 border-2 border-success/20 rounded-2xl text-success text-[13px] font-black uppercase tracking-widest group-hover:bg-success/15 transition-all">
                            Active
                          </div>
                       </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamMembersPage
