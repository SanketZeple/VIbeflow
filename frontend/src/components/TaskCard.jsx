import React from 'react'
import { Clock, MoreHorizontal, UserCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const TaskCard = ({ task, users = [] }) => {
  
  const getUserInitials = (userId) => {
    if (!userId) return 'U'
    const user = users.find(u => u.id === userId)
    return user ? user.email.charAt(0).toUpperCase() : userId.toString().charAt(0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date()

  return (
    <motion.div 
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative bg-[#22272B] hover:bg-[#2A3038] border border-white/[0.06] hover:border-accent/40 rounded-[16px] p-[24px] shadow-sm hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)] transition-colors duration-300 cursor-grab active:cursor-grabbing flex flex-col gap-[20px] overflow-hidden"
    >
      
      {/* Glow effect on hover */}
      <div className="absolute top-0 right-0 w-[180px] h-[180px] bg-accent/20 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[120px] h-[120px] bg-purple-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

      {/* Top Header: ID & Actions */}
      <div className="flex justify-between items-center relative z-10 w-full">
        <div className="flex items-center gap-[12px]">

          <span className="text-[14px] font-bold text-text-muted uppercase tracking-wider">VF-{task.id}</span>
        </div>
        
        {/* Options Menu */}
        <button className="text-text-muted hover:text-white p-[6px] -mr-[6px] rounded-[8px] hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <MoreHorizontal className="w-[20px] h-[20px]" />
        </button>
      </div>
      
      {/* Task Title */}
      <h3 className="font-bold text-text-primary text-[18px] leading-[1.4] group-hover:text-white transition-colors relative z-10 line-clamp-3 w-full">
        {task.title}
      </h3>
      
      {/* Bottom Footer: Meta & Avatar */}
      <div className="flex items-center justify-between border-t border-white/[0.08] pt-[20px] mt-auto relative z-10 w-full">
        
        {/* Left Side: Meta info (Date, Comments) */}
        <div className="flex items-center gap-[16px] text-text-muted">
          {task.due_date && (
            <div className={`flex items-center gap-[8px] text-[13px] font-bold px-[10px] py-[6px] rounded-[8px] transition-colors ${
              isOverdue ? 'bg-danger/10 text-danger border border-danger/20 shadow-[0_0_12px_rgba(248,113,104,0.15)]' : 'bg-white/[0.04] text-text-secondary border border-white/[0.1]'
            }`}>
              <Clock className={`w-[16px] h-[16px] ${isOverdue ? 'animate-pulse' : ''}`} />
              <span>{formatDate(task.due_date)}</span>
            </div>
          )}


        </div>
        
        {/* Right Side: Assignee Avatar */}
        <div className="flex justify-end">
          {task.assignee_id ? (
            <div className="relative group/avatar cursor-pointer">
              <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-tr from-accent to-purple-600 flex items-center justify-center shadow-[0_6px_16px_rgba(87,157,255,0.4)] border-[3px] border-[#22272B] group-hover/avatar:scale-110 transition-transform duration-200">
                <span className="text-[13px] font-bold text-white shadow-sm">
                  {getUserInitials(task.assignee_id)}
                </span>
              </div>
              
              {/* Online status indicator */}
              <div className="absolute -right-[2px] -bottom-[2px] w-[12px] h-[12px] bg-success rounded-full border-[2px] border-[#22272B]"></div>
            </div>
          ) : (
            <div className="w-[36px] h-[36px] rounded-full bg-[#1A1D21] border-[2px] border-dashed border-white/20 flex items-center justify-center group-hover:border-accent/40 transition-colors cursor-pointer">
               <UserCircle className="w-[20px] h-[20px] text-text-muted opacity-50" />
            </div>
          )}
        </div>
      </div>

    </motion.div>
  )
}

export default TaskCard