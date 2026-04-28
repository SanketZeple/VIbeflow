import React from 'react'
import { Clock, MoreHorizontal, UserCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { getUserColor, getUserInitials } from '../utils/userColors'

const TaskCard = ({ task, users = [] }) => {
  
  const getAvatarData = (userId) => {
    const user = users.find(u => u.id === userId)
    return {
      initials: getUserInitials(user || { email: userId?.toString() }),
      color: getUserColor(userId)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date()

  return (
    <motion.div 
      className="group relative bg-[#1A1D21] hover:bg-[#22272B] border border-white/[0.08] hover:border-white/20 rounded-[12px] p-[20px] shadow-sm transition-all duration-300 cursor-grab active:cursor-grabbing flex flex-col gap-[16px] overflow-hidden"
    >
      
      {/* Simplified hover effect */}
      <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

      {/* Top Header: ID & Actions */}
      <div className="flex justify-between items-center relative z-10 w-full">
        <div className="flex items-center gap-[12px]">

          <span className="text-[14px] font-bold text-text-muted uppercase tracking-wider">VF-{task.id}</span>
          {task.priority && (
            <span className={`px-[8px] py-[2px] rounded-[6px] text-[10px] font-extrabold uppercase tracking-wider border ${
              task.priority === 'Urgent' ? 'bg-danger/10 text-danger border-danger/20' :
              task.priority === 'High' ? 'bg-warning/10 text-warning border-warning/20' :
              task.priority === 'Medium' ? 'bg-accent/10 text-accent border-accent/20' :
              'bg-white/5 text-text-muted border-white/10'
            }`}>
              {task.priority}
            </span>
          )}
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
            <div className={`flex items-center gap-[6px] text-[12px] font-bold px-[8px] py-[4px] rounded-[6px] transition-colors ${
              isOverdue ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-[#282D33] text-text-secondary border border-border/50'
            }`}>
              <Clock className="w-[14px] h-[14px]" />
              <span>{formatDate(task.due_date)}</span>
            </div>
          )}


        </div>
        
        {/* Right Side: Assignee Avatar */}
        <div className="flex justify-end">
          {task.assignee_id ? (
            <div className="relative group/avatar cursor-pointer">
              {(() => {
                const { initials, color } = getAvatarData(task.assignee_id);
                return (
                  <div className={`w-[28px] h-[28px] rounded-full ${color} flex items-center justify-center border border-white/5 transition-transform duration-200`}>
                    <span className="text-[10px] font-bold text-white uppercase">
                      {initials}
                    </span>
                  </div>
                );
              })()}
              
              {/* Online status indicator */}
              <div className="absolute -right-[1px] -bottom-[1px] w-[10px] h-[10px] bg-success rounded-full border-[2px] border-[#1A1D21]"></div>
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