import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Calendar, X } from 'lucide-react'

const CreateTaskModal = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)


  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setTitle('')
      setDueDate('')
      setPriority('Medium')
      setError('')
    }

  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Title is required')
      return
    }
    if (trimmedTitle.length > 255) {
      setError('Title must be 255 characters or less')
      return
    }

    let dueDateObj = null
    if (dueDate) {
      const parsed = new Date(dueDate)
      if (isNaN(parsed.getTime())) {
        setError('Invalid due date')
        return
      }
      
      // Prevent past dates using local time string comparison
      const localTodayStr = new Date().toLocaleDateString('en-CA'); // Gets YYYY-MM-DD
      const dateOnlyStr = dueDate.split('T')[0];
      if (dateOnlyStr < localTodayStr) {
        setError('Due date cannot be in the past')
        return
      }
      
      dueDateObj = new Date(dueDate).toISOString()
    }

    setLoading(true)
    try {
      await onCreate({
        title: trimmedTitle,
        dueDate: dueDateObj,
        priority,
      })

      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-0">
          
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#090a0c]/80 backdrop-blur-sm z-40" 
            onClick={onClose} 
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative bg-[#161a1d]/95 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-full max-w-lg z-50 overflow-hidden"
          >
            {/* Decorative background glows */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen translate-x-1/3 translate-y-1/3"></div>

            {/* Header */}
            <div className="relative border-b border-white/[0.04] px-6 py-5 flex justify-between items-center bg-white/[0.01]">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple-600 shadow-lg border border-white/10">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Create New Task</h3>
                  <p className="text-text-muted text-[13px] mt-0.5">Add a new task to your project's backlog</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-text-muted hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-6 relative">
              {/* Title Input */}
              <div className="mb-5">
                <label htmlFor="title" className="block text-[13px] font-semibold tracking-wide text-text-secondary uppercase mb-2">
                  Task Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1A1D21] border border-border/80 hover:border-white/20 text-white text-[15px] rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-text-muted/50 shadow-inner"
                  placeholder="e.g. Implement user authentication flow"
                  autoFocus
                  disabled={loading}
                  maxLength={255}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-text-muted/70">Briefly summarize the objective</span>
                  <span className={`text-xs ${title.length >= 250 ? 'text-warning' : 'text-text-muted/50'}`}>
                    {title.length}/255
                  </span>
                </div>
              </div>

              {/* Due Date Input */}
              <div className="mb-6">
                <label htmlFor="dueDate" className="block text-[13px] font-semibold tracking-wide text-text-secondary uppercase mb-2">
                  Due Date <span className="text-text-muted/60 lowercase normal-case">(optional)</span>
                </label>
                <div className="relative inline-block w-full sm:w-auto">
                  <Calendar className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4 pointer-events-none" />
                  <input
                    type="date"
                    id="dueDate"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full sm:w-[220px] pl-10 pr-4 py-2.5 bg-[#1A1D21] border border-border/80 hover:border-white/20 text-white text-[14px] rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all shadow-inner [color-scheme:dark]"
                    disabled={loading}
                  />
                </div>
              </div>
              
              {/* Priority Dropdown */}
              <div className="mb-6">
                <label htmlFor="priority" className="block text-[13px] font-semibold tracking-wide text-text-secondary uppercase mb-2">
                  Priority
                </label>
                <div className="relative">
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-[#1A1D21] border border-border/80 hover:border-white/20 text-white text-[14px] rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all shadow-inner appearance-none cursor-pointer"
                    disabled={loading}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>


              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 overflow-hidden"
                  >
                    <div className="p-3 bg-danger/10 border border-danger/20 text-danger rounded-lg text-[13px] font-medium flex items-center">
                      <svg className="w-4 h-4 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-white/[0.03]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-text-secondary hover:text-white bg-[#22272B] hover:bg-[#2D333B] border border-white/5 rounded-xl font-medium transition-all text-[14px]"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="relative px-6 py-2.5 bg-gradient-to-r from-accent to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(87,157,255,0.3)] transition-all flex items-center overflow-hidden group text-[14px]"
                  disabled={loading}
                >
                  {/* Subtle shine effect */}
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
                  
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="relative z-10">Creating...</span>
                    </>
                  ) : (
                    <span className="relative z-10">Create Task</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default CreateTaskModal