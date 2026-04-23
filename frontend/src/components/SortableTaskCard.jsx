import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskCard from './TaskCard'

const SortableTaskCard = ({ task, onClick, users }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: `task-${task.id}`,
    data: {
      type: 'task',
      task,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'transform 0.1s ease, opacity 0.1s ease' : transition,
    opacity: isDragging ? 0.8 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    scale: isDragging ? 1.05 : 1,
    zIndex: isDragging ? 999 : 1,
    boxShadow: isDragging 
      ? '0 10px 25px -5px rgba(87, 157, 255, 0.3), 0 8px 10px -6px rgba(87, 157, 255, 0.2)' 
      : 'none',
  }

  const handleClick = (e) => {
    if (!isDragging) {
      onClick?.(task)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={`touch-none relative ${isDragging ? 'drag-active' : ''}`}
    >
      {/* Drag overlay effect */}
      {isDragging && (
        <div className="absolute inset-0 bg-accent/10 rounded border-2 border-accent border-dashed pointer-events-none"></div>
      )}
      
      {/* Drop indicator when being dragged over */}
      {isOver && !isDragging && (
        <div className="absolute inset-0 bg-accent/5 rounded border-2 border-accent border-dashed pointer-events-none"></div>
      )}
      
      <TaskCard task={task} users={users} />
      
      {/* Drag handle visual cue */}
      <div className="absolute top-1/2 -left-3 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-2 h-6 flex flex-col justify-between">
          <div className="w-full h-0.5 bg-border rounded-full"></div>
          <div className="w-full h-0.5 bg-border rounded-full"></div>
          <div className="w-full h-0.5 bg-border rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

export default SortableTaskCard