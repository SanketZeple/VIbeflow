import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import SortableTaskCard from './SortableTaskCard'

const Column = ({ column, onTaskClick, users }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: {
      type: 'column',
      column,
    },
  })

  // We assign a top-border color to signify column status instead of blocky backgrounds
  const getColumnStyle = (columnName) => {
    const styles = {
      'Backlog': 'border-t-[#3D474F] shadow-[#3D474F]/5',
      'Selected': 'border-t-accent shadow-accent/5',
      'In Progress': 'border-t-warning shadow-warning/5',
      'Review': 'border-t-purple-500 shadow-purple-500/5',
      'Testing': 'border-t-purple-500 shadow-purple-500/5',
      'Done': 'border-t-success shadow-success/5',
      'Deployed': 'border-t-success shadow-success/5',
      'Closed': 'border-t-[#3D474F] shadow-[#3D474F]/5'
    }
    return styles[columnName] || 'border-t-[#3D474F] shadow-[#3D474F]/5'
  }

  const getColumnIcon = (columnName) => {
    const icons = {
      'Backlog': '📋',
      'Selected': '🎯',
      'In Progress': '⚡',
      'Review': '👁️',
      'Testing': '🧪',
      'Done': '✅',
      'Deployed': '🚀',
      'Closed': '🔒'
    }
    return icons[columnName] || '📄'
  }

  const columnStyle = getColumnStyle(column.name);

  return (
    <div className="flex-shrink-0 w-80 group flex flex-col h-full max-h-screen pb-10">
      
      {/* Seamless Column Container with Glassmorphism */}
      <div 
        ref={setNodeRef}
        className={`flex flex-col h-full bg-[#161a1d]/90 backdrop-blur-md border border-white/[0.05] rounded-xl overflow-hidden transition-all duration-300 relative ${
          isOver 
            ? 'border-accent shadow-[0_0_20px_rgba(87,157,255,0.15)] ring-1 ring-accent/50' 
            : `hover:border-white/10 hover:shadow-lg ${columnStyle.split(' ')[1]}`
        }`}
      >
        {/* Colorful top border strip indicating status */}
        <div className={`absolute top-0 left-0 right-0 h-1 border-t-[3px] ${columnStyle.split(' ')[0]}`}></div>
        
        {/* Column Header */}
        <div className="p-4 pt-5 pb-3 bg-gradient-to-b from-white/[0.03] to-transparent shrink-0">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center space-x-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#22272B] border border-white/[0.04] shadow-sm text-sm">
                {getColumnIcon(column.name)}
              </div>
              <div>
                <h2 className="font-semibold text-text-primary text-[15px] tracking-tight">{column.name}</h2>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-[#22272B] text-text-secondary text-[11px] font-bold px-2 py-0.5 rounded-md border border-white/[0.05] shadow-sm">
                {column.tasks?.length || 0}
              </span>
              <button className="text-text-muted hover:text-white transition-colors opacity-0 group-hover:opacity-100 p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Column Body / Drop Zone */}
        <div className="p-3 flex-1 overflow-y-auto no-scrollbar relative">
          {column.tasks && column.tasks.length > 0 ? (
            <div className="space-y-3 pb-2">
              {column.tasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  onClick={onTaskClick}
                  users={users}
                />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-10 text-text-muted/50 group-hover:text-text-muted transition-colors">
              <div className="w-12 h-12 rounded-full border border-dashed border-white/10 flex items-center justify-center mb-3">
                <span className="text-xl opacity-40">{getColumnIcon(column.name)}</span>
              </div>
              <div className="text-[13px] font-medium tracking-wide">No tasks yet</div>
              <div className="text-[11px] mt-1 opacity-70">Drag tasks here</div>
              
              {/* Drop zone hint when empty */}
              {isOver && (
                <div className="mt-4 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-md text-xs text-accent animate-pulse font-medium shadow-[0_0_15px_rgba(87,157,255,0.1)]">
                  Drop here
                </div>
              )}
            </div>
          )}
          
          {/* Visual drop indicator when being dragged over */}
          {isOver && column.tasks && column.tasks.length > 0 && (
            <div className="absolute inset-x-3 bottom-0 h-1 bg-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(87,157,255,0.8)]"></div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Column