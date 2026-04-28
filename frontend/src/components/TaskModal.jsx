import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, MessageSquare, Paperclip, Activity, User, Save, Plus, ChevronDown, Calendar } from 'lucide-react'
import boardService from '../services/board'
import useAuth from '../hooks/useAuth'
import { getUserColor, getUserInitials } from '../utils/userColors'

const TaskModal = ({ task, isOpen, onClose, onUpdate, users = [] }) => {
  const [assigneeId, setAssigneeId] = useState(task?.assignee_id || null)
  const [priority, setPriority] = useState(task?.priority || 'Medium')
  const [dueDate, setDueDate] = useState(task?.due_date ? task.due_date.split('T')[0] : '')
  const [loading, setLoading] = useState(false)
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false)
  const { user: currentUser } = useAuth()

  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState(null)
  const [saveError, setSaveError] = useState(null)
  
  // Worklog states
  const [worklogs, setWorklogs] = useState([])
  const [worklogsLoading, setWorklogsLoading] = useState(false)
  const [worklogsError, setWorklogsError] = useState(null)
  const [newWorklogHours, setNewWorklogHours] = useState('')
  const [newWorklogDescription, setNewWorklogDescription] = useState('')
  const [creatingWorklog, setCreatingWorklog] = useState(false)
  const [worklogError, setWorklogError] = useState(null)

  // Helper to get user email by ID
  const getUserEmail = (userId) => {
    if (!userId) return 'Unassigned'
    const user = users.find(u => u.id === userId)
    if (!user) return `User ${userId}`
    const isMe = user.id === currentUser?.id
    const displayName = user.full_name || user.email.split('@')[0]
    return isMe ? `${displayName} (You)` : displayName
  }

  // Helper to get user data
  const getAvatarData = (userId) => {
    if (!userId) return { initials: '?', color: 'bg-[#42526E]' }
    const user = users.find(u => u.id === userId)
    return {
      initials: getUserInitials(user || { email: userId.toString() }),
      color: getUserColor(userId)
    }
  }

  useEffect(() => {
    if (task && isOpen) {
      setAssigneeId(task.assignee_id)
      setPriority(task.priority || 'Medium')
      setDueDate(task.due_date ? task.due_date.split('T')[0] : '')
      fetchAssignmentHistory()
      fetchWorklogs()
    }

  }, [task, isOpen])

  const fetchAssignmentHistory = async () => {
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      const history = await boardService.getAssignmentHistory(task.id)
      setHistory(history)
    } catch (err) {
      console.error('Failed to fetch assignment history:', err)
      setHistoryError('Failed to load assignment history')
    } finally {
      setHistoryLoading(false)
    }
  }

  const fetchWorklogs = async () => {
    setWorklogsLoading(true)
    setWorklogsError(null)
    try {
      const worklogs = await boardService.getWorklogs(task.id)
      setWorklogs(worklogs)
    } catch (err) {
      console.error('Failed to fetch worklogs:', err)
      setWorklogsError('Failed to load worklogs')
    } finally {
      setWorklogsLoading(false)
    }
  }

  const handleCreateWorklog = async () => {
    if (!newWorklogHours || parseFloat(newWorklogHours) <= 0) {
      setWorklogError('Hours must be a positive number')
      return
    }
    setCreatingWorklog(true)
    setWorklogError(null)
    try {
      const worklogData = {
        hours: parseFloat(newWorklogHours),
        description: newWorklogDescription || undefined
      }
      await boardService.createWorklog(task.id, worklogData)
      await fetchWorklogs()
      setNewWorklogHours('')
      setNewWorklogDescription('')
    } catch (err) {
      console.error('Failed to create worklog:', err)
      setWorklogError(err.message || 'Failed to create worklog')
    } finally {
      setCreatingWorklog(false)
    }
  }

  // Auto-save logic
  const handleUpdateField = async (fieldName, value) => {
    if (!task) return
    setLoading(true)
    setSaveError(null)
    try {
      const updatedTask = await boardService.updateTask(task.id, {
        [fieldName]: value,
      })
      onUpdate?.(updatedTask)
      if (fieldName === 'assignee_id') {
        fetchAssignmentHistory()
      }
    } catch (err) {
      console.error(`Failed to update ${fieldName}:`, err)
      setSaveError(err.message || `Failed to save ${fieldName}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePriorityChange = (newPriority) => {
    setPriority(newPriority)
    handleUpdateField('priority', newPriority)
  }

  const handleAssigneeChange = (newAssigneeId) => {
    setAssigneeId(newAssigneeId)
    handleUpdateField('assignee_id', newAssigneeId)
  }
  
  const handleDueDateChange = (newDueDate) => {
    if (!newDueDate) {
      setDueDate('')
      handleUpdateField('due_date', null)
      return
    }

    const localTodayStr = new Date().toLocaleDateString('en-CA'); // Gets YYYY-MM-DD
    const dateOnlyStr = newDueDate.split('T')[0];

    if (dateOnlyStr < localTodayStr) {
      setSaveError('Due date cannot be in the past')
      return
    }

    setDueDate(newDueDate)
    handleUpdateField('due_date', new Date(newDueDate).toISOString())
  }

  if (!isOpen || !task) return null

  const formatDate = (dateString, withTime = false) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      ...(withTime && { hour: '2-digit', minute: '2-digit' })
    })
  }
  
  const getPriorityColor = (p) => {
    switch (p) {
      case 'Urgent': return 'bg-danger/10 text-danger border-danger/20'
      case 'High': return 'bg-warning/10 text-warning border-warning/20'
      case 'Medium': return 'bg-accent/10 text-accent border-accent/20'
      case 'Low': return 'bg-white/5 text-text-muted border-white/10'
      default: return 'bg-accent/10 text-accent border-accent/20'
    }
  }


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto px-[16px] sm:px-[24px]">
          {/* Dynamic blurred backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0A0D10]/80 backdrop-blur-xl transition-opacity"
            onClick={onClose} 
          />
          
          <div className="min-h-screen flex justify-center py-[100px]">
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-[#1D2125]/95 backdrop-blur-2xl w-full max-w-2xl lg:max-w-3xl h-[85vh] max-h-[85vh] min-h-[400px] grid grid-rows-[auto_1fr_auto] relative z-[101] shadow-[0_24px_80px_rgba(0,0,0,0.8)] overflow-hidden rounded-[20px] border border-white/[0.08]"
            >
            {/* Ambient glows */}


            {/* Header */}
            <div className="px-[24px] py-[20px] border-b border-white/[0.06] bg-[#1A1D21]/90 backdrop-blur-xl z-20 flex justify-between items-start relative">
              <div className="relative z-10 w-full pr-[32px]">
                <div className="flex flex-wrap items-center gap-[12px] mb-[12px]">
                  <span className="px-[12px] py-[4px] bg-accent/10 border border-accent/20 text-accent text-[12px] font-extrabold rounded-[8px] tracking-widest uppercase">
                    TASK-{task.id}
                  </span>
                  <span className="text-[14px] font-medium text-text-muted flex items-center gap-[6px]">
                    <Clock className="w-[14px] h-[14px]" />
                    {formatDate(task.created_at)}
                  </span>
                  {/* Overlap Fix: Moved Time Spent here */}
                  <span className="px-[12px] py-[4px] bg-success/10 border border-success/20 text-success text-[12px] font-extrabold rounded-[8px] tracking-widest uppercase flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    {worklogs.reduce((sum, wl) => sum + wl.hours, 0).toFixed(1)}h Spent
                  </span>
                </div>
                <h2 className="text-[24px] font-bold text-white leading-[1.3] tracking-tight mb-[8px]">
                  {task.title}
                </h2>
                <div className="text-[14px] font-medium text-text-secondary flex items-center gap-[6px]">
                  Created by 
                  <span className="text-white bg-white/5 border border-white/10 px-[10px] py-[4px] rounded-[16px] flex items-center gap-[6px]">
                    <User className="w-[14px] h-[14px]" />
                    {getUserEmail(task.created_by)}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="absolute top-[24px] right-[24px] p-[8px] text-text-muted hover:text-white hover:bg-white/[0.08] hover:rotate-90 rounded-[12px] transition-all duration-300 z-20 bg-white/[0.02] border border-white/[0.05]"
              >
                <X className="w-[20px] h-[20px]" />
              </button>

              {/* Overlap fix: Removed the large Time Spent box that was hitting the X icon */}
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto overflow-x-hidden p-[20px] sm:p-[24px] flex flex-col gap-[24px] relative z-10">
              
              {/* Properties Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-[16px] p-[16px] hover:bg-white/[0.03] transition-colors">
                  <label className="flex items-center gap-[8px] text-[13px] font-extrabold text-text-muted uppercase tracking-widest mb-[12px]">
                    <Activity className="w-[16px] h-[16px]" />
                    Status
                  </label>
                  <div className="inline-flex items-center px-[16px] py-[8px] bg-accent/10 border border-accent/20 shadow-[0_0_12px_rgba(87,157,255,0.1)] rounded-[10px] text-accent text-[15px] font-bold">
                    <div className="w-[8px] h-[8px] rounded-full bg-accent mr-[10px] animate-pulse"></div>
                    {task.column_name || (task.column_id ? `Column ${task.column_id}` : 'Unknown')}
                  </div>
                </div>
                
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-[16px] p-[16px] hover:bg-white/[0.03] transition-colors">
                  <label className="flex items-center gap-[10px] text-[13px] font-extrabold text-text-muted uppercase tracking-widest mb-[12px]">
                    <ChevronDown className="w-5 h-5 text-accent" strokeWidth={2.5} />
                    Priority
                  </label>
                  <div className="relative group">
                    <select
                      value={priority}
                      onChange={(e) => handlePriorityChange(e.target.value)}
                      className={`w-full appearance-none bg-[#15181C] border border-white/[0.08] rounded-[12px] pl-[16px] pr-[40px] py-[12px] text-[15px] font-bold focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent shadow-inner transition-all cursor-pointer hover:bg-[#1A1D21] ${getPriorityColor(priority).split(' ')[1]}`}
                    >
                      <option value="Low" className="bg-[#1A1D21]">Low</option>
                      <option value="Medium" className="bg-[#1A1D21]">Medium</option>
                      <option value="High" className="bg-[#1A1D21]">High</option>
                      <option value="Urgent" className="bg-[#1A1D21]">Urgent</option>
                    </select>
                    <div className="absolute right-[16px] top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-hover:text-white transition-colors">
                      <ChevronDown className="w-[20px] h-[20px]" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.05] rounded-[16px] p-[16px] hover:bg-white/[0.03] transition-colors">
                  <label className="flex items-center gap-[10px] text-[13px] font-extrabold text-text-muted uppercase tracking-widest mb-[12px]">
                    <User className="w-5 h-5 text-accent" strokeWidth={2.5} />
                    Assignee
                  </label>
                  <div className="relative" id="assignee-dropdown">
                    <button
                      onClick={() => setAssigneeDropdownOpen(!assigneeDropdownOpen)}
                      className="w-full bg-[#15181C] border border-white/[0.08] rounded-[12px] pl-[56px] pr-[40px] py-[12px] text-[15px] font-medium text-white flex items-center justify-between hover:bg-[#1A1D21] transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
                    >
                        <span className="flex-1 text-left">
                          {assigneeId ? getUserEmail(assigneeId) : 'Unassigned'}
                        </span>
                        <ChevronDown className={`w-5 h-5 text-text-muted shrink-0 transition-transform duration-300 ${assigneeDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`absolute left-[12px] top-1/2 -translate-y-1/2 flex items-center justify-center w-[32px] h-[32px] rounded-full ${getAvatarData(assigneeId).color} border border-white/10 text-white text-[12px] font-bold pointer-events-none uppercase`}>
                      {getAvatarData(assigneeId).initials}
                    </div>

                    <AnimatePresence>
                      {assigneeDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute left-0 right-0 top-full mt-2 bg-[#1A1D21] border border-white/[0.08] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] z-50 overflow-hidden min-w-[280px]"
                        >
                          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            <div
                              onClick={() => {
                                handleAssigneeChange(null)
                                setAssigneeDropdownOpen(false)
                              }}
                              className="px-5 py-4 hover:bg-white/5 cursor-pointer flex items-center gap-4 transition-all"
                            >
                              <div className="w-10 h-10 rounded-xl bg-[#363B42] flex items-center justify-center text-white text-lg font-bold border border-white/5">
                                ?
                              </div>
                              <span className="text-[15px] text-text-secondary font-medium">Unassigned</span>
                            </div>
                            {users.map(userItem => (
                              <div
                                key={userItem.id}
                                onClick={() => {
                                  handleAssigneeChange(userItem.id)
                                  setAssigneeDropdownOpen(false)
                                }}
                                className="px-5 py-4 hover:bg-white/5 cursor-pointer flex items-center gap-4 transition-all border-t border-white/[0.03]"
                              >
                                <div className={`w-10 h-10 rounded-xl ${getUserColor(userItem.id)} flex items-center justify-center text-white text-[13px] font-black uppercase border border-white/10 shadow-lg`}>
                                  {getUserInitials(userItem)}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="text-[15px] text-white font-bold truncate">
                                    {userItem.full_name || userItem.email.split('@')[0]}
                                    {userItem.id === currentUser?.id && <span className="ml-2 text-accent text-[11px] font-black uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded-md">You</span>}
                                  </span>
                                  <span className="text-[12px] text-text-muted truncate mt-0.5">{userItem.email}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.05] rounded-[16px] p-[16px] hover:bg-white/[0.03] transition-colors">
                  <label className="flex items-center gap-[10px] text-[13px] font-extrabold text-text-muted uppercase tracking-widest mb-[12px]">
                    <Calendar className="w-5 h-5 text-accent" strokeWidth={2.5} />
                    Due Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => handleDueDateChange(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-[#15181C] border border-white/[0.08] rounded-[12px] px-[16px] py-[12px] text-[15px] text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent shadow-inner [color-scheme:dark] transition-all"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>



              {/* Time Tracking Section */}
              <div className="bg-black/20 border border-white/[0.04] rounded-[20px]">
                <div className="px-[24px] py-[16px] border-b border-white/[0.05] bg-white/[0.02]">
                  <h3 className="text-[16px] font-bold text-white flex items-center gap-[10px]">
                    <Clock className="w-[20px] h-[20px] text-accent" />
                    Time Tracking
                  </h3>
                </div>
                
                <div className="p-[24px]">
                  {/* Log Work Form */}
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-[16px] p-[20px] mb-[24px]">
                    <h4 className="text-[14px] font-bold text-text-primary mb-[16px] flex items-center gap-[8px]">
                       <Plus className="w-[16px] h-[16px]" />
                       Log New Work
                    </h4>
                    {worklogError && (
                      <div className="mb-[16px] p-[12px] bg-danger/10 border border-danger/20 text-danger rounded-[10px] text-[14px] flex items-center gap-[8px]">
                        <X className="w-[16px] h-[16px] shrink-0" />
                        {worklogError}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-[16px] items-end">
                      <div className="md:col-span-3">
                        <label className="block text-[12px] font-bold text-text-secondary mb-[8px] uppercase tracking-wider">Hours</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.01"
                          value={newWorklogHours}
                          onChange={(e) => setNewWorklogHours(e.target.value)}
                          className="w-full bg-[#15181C] border border-white/[0.08] rounded-[10px] px-[16px] py-[12px] text-[15px] font-bold text-white focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder-text-muted/40 shadow-inner"
                          placeholder="e.g. 2.5"
                        />
                      </div>
                      <div className="md:col-span-6">
                        <label className="block text-[12px] font-bold text-text-secondary mb-[8px] uppercase tracking-wider">Description (Optional)</label>
                        <input
                          type="text"
                          value={newWorklogDescription}
                          onChange={(e) => setNewWorklogDescription(e.target.value)}
                          className="w-full bg-[#15181C] border border-white/[0.08] rounded-[10px] px-[16px] py-[12px] text-[15px] text-text-primary focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder-text-muted/40 shadow-inner"
                          placeholder="What did you work on?"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <button
                          onClick={handleCreateWorklog}
                          disabled={creatingWorklog || !newWorklogHours || parseFloat(newWorklogHours) <= 0}
                          className="w-full py-[12px] bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white text-[15px] font-bold rounded-[10px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-[8px] group"
                        >
                          {creatingWorklog ? (
                            <svg className="animate-spin h-[18px] w-[18px] text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <>
                              <Clock className="w-[18px] h-[18px] text-accent group-hover:scale-110 transition-transform" />
                              Log Time
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Worklogs List */}
                  <div className="flex flex-col gap-[12px]">
                    {worklogsLoading ? (
                      <div className="py-[24px] text-center text-[15px] font-medium text-text-muted animate-pulse border border-white/[0.02] bg-white/[0.01] rounded-[12px]">Loading worklogs...</div>
                    ) : worklogsError ? (
                      <div className="py-[16px] text-danger text-[15px] font-medium">{worklogsError}</div>
                    ) : worklogs.length > 0 ? (
                      worklogs.map((worklog) => (
                        <div key={worklog.id} className="group flex items-start gap-[16px] p-[16px] rounded-[12px] bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all">
                          <div className={`w-[36px] h-[36px] rounded-full ${getAvatarData(worklog.user_id).color} border border-white/10 flex items-center justify-center shadow-sm shrink-0`}>
                            <span className="text-[12px] font-bold text-white uppercase">
                               {getAvatarData(worklog.user_id).initials}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-[8px]">
                              <span className="text-[15px] font-bold text-text-primary">
                                {getUserEmail(worklog.user_id)}
                              </span>
                              <span className="text-[13px] font-medium text-text-muted">
                                {formatDate(worklog.logged_at, true)}
                              </span>
                            </div>
                            <div className="mt-[6px] flex items-center gap-[12px]">
                              <span className="inline-flex items-center px-[10px] py-[4px] rounded-[6px] text-[13px] font-extrabold bg-accent/15 text-accent border border-accent/30 shadow-[0_0_8px_rgba(87,157,255,0.1)]">
                                {worklog.hours}h logged
                              </span>
                              {worklog.description && (
                                <span className="text-[14px] text-text-secondary truncate">
                                  {worklog.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-[32px] text-center text-[14px] font-medium text-text-muted border border-dashed border-white/[0.08] bg-white/[0.01] rounded-[16px]">
                        No time logged on this task yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Activity/History Section */}
              <div className="bg-black/20 border border-white/[0.04] rounded-[20px]">
                <div className="px-[24px] py-[16px] border-b border-white/[0.05] bg-white/[0.02]">
                  <h3 className="text-[16px] font-bold text-white flex items-center gap-[10px]">
                    <Activity className="w-[20px] h-[20px] text-purple-400" />
                    Recent Activity
                  </h3>
                </div>
                <div className="p-[24px]">
                  {historyLoading ? (
                    <div className="py-[24px] text-center text-[15px] font-medium text-text-muted animate-pulse">Loading history...</div>
                  ) : historyError ? (
                    <div className="py-[16px] text-danger text-[15px]">{historyError}</div>
                  ) : history.length > 0 ? (
                    <div className="relative pl-[24px] py-[10px] space-y-[24px] border-l-[2px] border-white/[0.06] ml-[12px]">
                      {history.map((record, index) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          key={record.id} 
                          className="relative pl-[24px]"
                        >
                          {/* Glowing Timeline dot */}
                          <div className="absolute -left-[28px] top-[6px] w-[10px] h-[10px] rounded-full bg-accent border-[2px] border-[#1D2125]"></div>
                          <div className="text-[15px] text-text-secondary leading-snug">
                            <span className="font-bold text-white">{record.changed_by_name || getUserEmail(record.changed_by)}</span> changed assignee from{' '}
                            <span className="font-bold text-white px-[6px] py-[2px] bg-white/[0.05] rounded-[4px] border border-white/[0.05]">{record.old_assignee_name || getUserEmail(record.old_assignee_id)}</span> to{' '}
                            <span className="font-bold text-accent px-[6px] py-[2px] bg-accent/10 rounded-[4px] border border-accent/20">{record.new_assignee_name || getUserEmail(record.new_assignee_id)}</span>
                          </div>
                          <div className="text-[13px] font-medium text-text-muted mt-[6px] flex items-center gap-[6px]">
                            <Clock className="w-[12px] h-[12px]" />
                            {formatDate(record.changed_at, true)}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-[32px] text-center text-[14px] font-medium text-text-muted border border-dashed border-white/[0.08] bg-white/[0.01] rounded-[16px]">
                      No recent activity recorded.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Footer - Removed for Auto-save */}
            <div className="px-[24px] py-[16px] border-t border-white/[0.06] bg-[#1A1D21]/95 flex items-center justify-between z-20">
              <div className="flex items-center gap-2">
                {loading ? (
                  <span className="flex items-center gap-2 text-[13px] text-accent animate-pulse font-bold">
                    <Save className="w-4 h-4 animate-spin" />
                    Saving changes...
                  </span>
                ) : saveError ? (
                  <span className="text-danger text-[13px] font-bold">{saveError}</span>
                ) : (
                  <span className="text-success text-[13px] font-bold flex items-center gap-2 opacity-60">
                    <Activity className="w-4 h-4" />
                    System synchronized • All changes saved
                  </span>
                )}
              </div>
              {/* Manual Close Removed as requested for Auto-save layout */}
            </div>
          </motion.div>
        </div>
      </div>
    )}
  </AnimatePresence>
)
}

export default TaskModal