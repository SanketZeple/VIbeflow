import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, MessageSquare, Paperclip, Activity, User, Save, Plus, ChevronDown } from 'lucide-react'
import boardService from '../services/board'

const TaskModal = ({ task, isOpen, onClose, onUpdate, users = [] }) => {
  const [assigneeId, setAssigneeId] = useState(task?.assignee_id || null)
  const [loading, setLoading] = useState(false)
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
    return user ? user.email.split('@')[0] : `User ${userId}`
  }

  // Helper to get user initial
  const getUserInitial = (userId) => {
    if (!userId) return '?'
    const user = users.find(u => u.id === userId)
    return user && user.email ? user.email.charAt(0).toUpperCase() : 'U'
  }

  useEffect(() => {
    if (task && isOpen) {
      setAssigneeId(task.assignee_id)
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

  const handleSave = async () => {
    if (!task) return
    setLoading(true)
    setSaveError(null)
    try {
      const updatedTask = await boardService.updateTask(task.id, {
        assignee_id: assigneeId,
      })
      onUpdate?.(updatedTask)
      onClose()
    } catch (err) {
      console.error('Failed to update task:', err)
      setSaveError(err.message || 'Failed to save changes')
    } finally {
      setLoading(false)
    }
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
            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-accent/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen z-0"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen z-0"></div>

            {/* Header */}
            <div className="px-[24px] py-[20px] border-b border-white/[0.06] bg-[#1A1D21]/90 backdrop-blur-xl z-20 flex justify-between items-start relative">
              <div className="relative z-10 w-full pr-[32px]">
                <div className="flex items-center gap-[12px] mb-[12px]">
                  <span className="px-[12px] py-[4px] bg-accent/10 border border-accent/20 text-accent text-[12px] font-extrabold rounded-[8px] tracking-widest uppercase">
                    TASK-{task.id}
                  </span>
                  <span className="text-[14px] font-medium text-text-muted flex items-center gap-[6px]">
                    <Clock className="w-[14px] h-[14px]" />
                    {formatDate(task.created_at)}
                  </span>
                </div>
                <h2 className="text-[24px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-text-secondary leading-[1.3] tracking-tight mb-[8px]">
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
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto overflow-x-hidden p-[20px] sm:p-[24px] flex flex-col gap-[24px] relative z-10">
              
              {/* Properties Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
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
                  <label className="flex items-center gap-[8px] text-[13px] font-extrabold text-text-muted uppercase tracking-widest mb-[12px]">
                    <User className="w-[16px] h-[16px]" />
                    Assignee
                  </label>
                  <div className="relative group">
                    <select
                      value={assigneeId || ''}
                      onChange={(e) => setAssigneeId(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full appearance-none bg-[#15181C] border border-white/[0.08] rounded-[12px] pl-[56px] pr-[40px] py-[12px] text-[15px] font-medium text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent shadow-inner transition-all cursor-pointer hover:bg-[#1A1D21]"
                    >
                      <option value="" className="bg-[#1A1D21]">Unassigned</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id} className="bg-[#1A1D21]">
                          {user.email}
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-[12px] top-1/2 -translate-y-1/2 flex items-center justify-center w-[32px] h-[32px] rounded-full bg-gradient-to-tr from-accent to-purple-500 shadow-sm border border-white/20 text-white text-[14px] font-extrabold pointer-events-none">
                      {getUserInitial(assigneeId)}
                    </div>
                    <div className="absolute right-[16px] top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-hover:text-white transition-colors">
                      <ChevronDown className="w-[20px] h-[20px]" />
                    </div>
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
                          <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-accent/20 to-purple-600/20 border border-white/[0.1] flex items-center justify-center shadow-sm shrink-0">
                            <span className="text-[14px] font-bold text-white tracking-widest uppercase">
                               {getUserInitial(worklog.user_id)}
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
                          <div className="absolute -left-[30px] top-[4px] w-[14px] h-[14px] rounded-full bg-accent shadow-[0_0_10px_rgba(87,157,255,0.8)] border-[3px] border-[#1D2125]"></div>
                          <div className="text-[15px] text-text-secondary leading-snug">
                            <span className="font-bold text-white">{getUserEmail(record.changed_by)}</span> changed assignee from{' '}
                            <span className="font-bold text-white px-[6px] py-[2px] bg-white/[0.05] rounded-[4px] border border-white/[0.05]">{getUserEmail(record.old_assignee_id)}</span> to{' '}
                            <span className="font-bold text-accent px-[6px] py-[2px] bg-accent/10 rounded-[4px] border border-accent/20">{getUserEmail(record.new_assignee_id)}</span>
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

            {/* Footer - Sticky */}
            <div className="px-[24px] py-[20px] border-t border-white/[0.06] bg-[#1A1D21]/95 backdrop-blur-xl flex items-center justify-between z-20">
              <div>
                {saveError && (
                  <span className="text-danger text-[14px] font-medium bg-danger/10 px-[12px] py-[8px] rounded-[8px] border border-danger/20">{saveError}</span>
                )}
              </div>
              <div className="flex gap-[16px]">
                <button
                  onClick={onClose}
                  className="px-[24px] py-[12px] text-[15px] font-bold text-text-secondary hover:text-white hover:bg-white/[0.04] rounded-[12px] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-[32px] py-[12px] text-[15px] font-bold text-white bg-gradient-to-r from-accent to-purple-500 rounded-[12px] shadow-[0_8px_24px_rgba(87,157,255,0.4)] hover:shadow-[0_12px_32px_rgba(87,157,255,0.6)] transition-all hover:-translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-[8px] group"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-[18px] w-[18px] text-white" xml="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )}
  </AnimatePresence>
)
}

export default TaskModal