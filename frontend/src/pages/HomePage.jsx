import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import useAuth from '../hooks/useAuth'
import boardService from '../services/board'
import Column from '../components/Column'
import CreateTaskModal from '../components/CreateTaskModal'
import TaskModal from '../components/TaskModal'
import TaskCard from '../components/TaskCard'
import { LayoutDashboard, User as UserIcon, Calendar, ClipboardList, Loader, CheckCircle, Search, Filter, ArrowDownUp, Plus } from 'lucide-react'

const HomePage = () => {
  const { user } = useAuth()
  const [board, setBoard] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [activeTask, setActiveTask] = useState(null)
  const [activeTaskData, setActiveTaskData] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOptions, setFilterOptions] = useState({
    assigneeId: null,
    columnId: null,
    dueDateRange: false, // boolean: show only upcoming tasks
  })
  const [sortOption, setSortOption] = useState({
    field: 'position', // 'position', 'due_date', 'title', 'created_at', 'assignee'
    direction: 'asc', // 'asc', 'desc'
  })
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    fetchBoard()
    fetchUsers()
  }, [])

  const fetchBoard = async () => {
    try {
      setLoading(true)
      const data = await boardService.getBoard()
      setBoard(data)
      setError(null)
    } catch (err) {
      console.error('Failed to load board:', err)
      setError('Failed to load board. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const users = await boardService.getUsers()
      setUsers(users)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }

  const handleDragStart = (event) => {
    const { active } = event
    setActiveTask(active.id)
    
    // Find the task being dragged
    if (board && board.columns) {
      let foundTask = null
      board.columns.forEach(col => {
        const task = col.tasks.find(t => t.id === parseInt(active.id.toString().replace('task-', '')))
        if (task) {
          foundTask = task
        }
      })
      setActiveTaskData(foundTask)
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveTask(null)
    setActiveTaskData(null)

    if (!over) return

    const activeId = active.id
    const overId = over.id

    // Find source task and column
    let sourceColumnId = null
    let sourceTask = null
    let sourcePosition = null

    // Find destination column
    let destColumnId = null
    let destPosition = null

    // Parse activeId and overId
    // activeId format: "task-{taskId}"
    // overId format: "column-{columnId}" or "task-{taskId}"
    const activeTaskId = parseInt(activeId.toString().replace('task-', ''))
    const isOverColumn = overId.toString().startsWith('column-')
    const isOverTask = overId.toString().startsWith('task-')

    // Find source task in board
    board.columns.forEach(col => {
      const taskIndex = col.tasks.findIndex(task => task.id === activeTaskId)
      if (taskIndex !== -1) {
        sourceColumnId = col.id
        sourceTask = col.tasks[taskIndex]
        sourcePosition = taskIndex // Use index instead of task.position
      }
    })

    if (!sourceTask) return

    if (isOverColumn) {
      // Dropped on a column
      destColumnId = parseInt(overId.toString().replace('column-', ''))
      // Position will be at the end of the column
      const destColumn = board.columns.find(col => col.id === destColumnId)
      destPosition = destColumn.tasks.length // append at end
    } else if (isOverTask) {
      // Dropped on another task
      const overTaskId = parseInt(overId.toString().replace('task-', ''))
      // Find which column the over task belongs to
      board.columns.forEach(col => {
        const taskIndex = col.tasks.findIndex(task => task.id === overTaskId)
        if (taskIndex !== -1) {
          destColumnId = col.id
          // Use the index as position (0-based)
          destPosition = taskIndex
        }
      })
    }

    if (destColumnId === null) return

    // Prepare update data
    const updateData = {}
    if (destColumnId !== sourceColumnId) {
      updateData.column_id = destColumnId
    }
    
    // Always update position when dropping on a task (even if same position)
    // This ensures reordering when dropping on another task at same position
    if (destPosition !== null) {
      // Check if we're dropping on a different task
      const overTaskId = isOverTask ? parseInt(overId.toString().replace('task-', '')) : null
      const isDifferentTask = isOverTask && overTaskId !== activeTaskId
      
      // Update position if:
      // 1. Position changed, OR
      // 2. We're dropping on a different task (reordering)
      if (destPosition !== sourcePosition || isDifferentTask) {
        updateData.position = destPosition
      }
    }

    // If nothing changed, do nothing
    if (Object.keys(updateData).length === 0) return

    try {
      // Call backend API
      const updatedTask = await boardService.updateTask(activeTaskId, updateData)
      
      // Update local state optimistically
      setBoard(prevBoard => {
        if (!prevBoard) return prevBoard
        
        const newColumns = prevBoard.columns.map(col => {
          if (col.id === sourceColumnId && col.id === destColumnId) {
            // Same column move: remove and reinsert at new position
            const newTasks = [...col.tasks]
            // Remove the task from its current position
            const taskIndex = newTasks.findIndex(t => t.id === activeTaskId)
            if (taskIndex !== -1) {
              newTasks.splice(taskIndex, 1)
            }
            // Insert at destination position (adjusted because we already removed)
            let insertPosition = destPosition
            if (destPosition > taskIndex) {
              insertPosition -= 1
            }
            // Ensure position is within bounds
            if (insertPosition < 0) insertPosition = 0
            if (insertPosition > newTasks.length) insertPosition = newTasks.length
            newTasks.splice(insertPosition, 0, updatedTask)
            return {
              ...col,
              tasks: newTasks
            }
          } else if (col.id === sourceColumnId) {
            // Remove from source column (moving to different column)
            return {
              ...col,
              tasks: col.tasks.filter(t => t.id !== activeTaskId)
            }
          } else if (col.id === destColumnId) {
            // Add to destination column (moving from different column)
            const newTasks = [...col.tasks]
            // Insert at destination position
            let insertPosition = destPosition
            // Ensure position is within bounds
            if (insertPosition < 0) insertPosition = 0
            if (insertPosition > newTasks.length) insertPosition = newTasks.length
            newTasks.splice(insertPosition, 0, updatedTask)
            return {
              ...col,
              tasks: newTasks
            }
          }
          return col
        })
        
        return { columns: newColumns }
      })
    } catch (err) {
      console.error('Failed to update task:', err)
      // Revert by refetching board
      fetchBoard()
    }
  }

  const handleTaskClick = (task) => {
    // Find column name for this task
    let columnName = 'Unknown'
    if (board && board.columns) {
      const column = board.columns.find(col => col.id === task.column_id)
      if (column) columnName = column.name
    }
    setSelectedTask({ ...task, column_name: columnName })
    setTaskModalOpen(true)
  }

  const handleCreateTask = async (taskData) => {
    // Transform keys: dueDate -> due_date for backend API
    const apiData = {
      title: taskData.title,
      due_date: taskData.dueDate || null,
    }
    const newTask = await boardService.createTask(apiData)
    // Update board state: add new task to Backlog column
    setBoard((prevBoard) => {
      if (!prevBoard) return prevBoard
      const updatedColumns = prevBoard.columns.map((col) => {
        if (col.name === 'Backlog') {
          return {
            ...col,
            tasks: [...col.tasks, newTask],
          }
        }
        return col
      })
      return { columns: updatedColumns }
    })
  }

  // Helper to filter, search, and sort columns
  const getProcessedColumns = (columns) => {
    if (!columns) return []
    // First filter columns by columnId if set
    let filteredColumns = columns
    if (filterOptions.columnId) {
      filteredColumns = filteredColumns.filter(col => col.id === filterOptions.columnId)
    }
    return filteredColumns.map(column => {
      let tasks = column.tasks || []
      // Apply search across multiple fields
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase()
        tasks = tasks.filter(task => {
          // Search in title
          if (task.title.toLowerCase().includes(query)) return true
          
          // Search in task ID
          if (task.id.toString().includes(query)) return true
          
          // Search in assignee email
          if (task.assignee_id) {
            const assignee = users.find(u => u.id === task.assignee_id)
            if (assignee && assignee.email.toLowerCase().includes(query)) return true
          }
          
          // Search in column name (via column object if available)
          if (column.name.toLowerCase().includes(query)) return true
          
          return false
        })
      }
      // Apply assignee filter
      if (filterOptions.assigneeId) {
        tasks = tasks.filter(task => task.assignee_id === filterOptions.assigneeId)
      }
      // Apply due date filter (simple: show tasks with due date in the future or within range)
      if (filterOptions.dueDateRange) {
        const now = new Date()
        tasks = tasks.filter(task => {
          if (!task.due_date) return false
          const dueDate = new Date(task.due_date)
          // Simple: show tasks due in the future
          return dueDate >= now
        })
      }
      // Apply sorting
      tasks = [...tasks].sort((a, b) => {
        let aVal, bVal
        
        if (sortOption.field === 'assignee') {
          // Map assignee_id to user email for sorting
          const getUserEmail = (id) => {
            const user = users.find(u => u.id === id)
            return user ? user.email.toLowerCase() : ''
          }
          aVal = getUserEmail(a.assignee_id)
          bVal = getUserEmail(b.assignee_id)
        } else if (sortOption.field === 'position') {
          aVal = a.position
          bVal = b.position
        } else {
          aVal = a[sortOption.field]
          bVal = b[sortOption.field]
        }
        
        // Handle nulls
        if (aVal == null) aVal = ''
        if (bVal == null) bVal = ''
        
        // Convert to string for comparison if not already
        if (typeof aVal === 'string') aVal = aVal.toLowerCase()
        if (typeof bVal === 'string') bVal = bVal.toLowerCase()
        
        // For dates, convert to timestamps
        if (sortOption.field === 'due_date' || sortOption.field === 'created_at') {
          aVal = aVal ? new Date(aVal).getTime() : 0
          bVal = bVal ? new Date(bVal).getTime() : 0
        }
        
        if (aVal < bVal) return sortOption.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortOption.direction === 'asc' ? 1 : -1
        return 0
      })
      
      return { ...column, tasks }
    })
  }

  const processedColumns = getProcessedColumns(board?.columns)

  if (loading) {
    return (
      <div className="w-full px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Shared Board</h1>
          <p className="text-text-secondary mt-2">Loading board data...</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Shared Board</h1>
          <p className="text-text-secondary mt-2">Error loading board</p>
        </div>
        <div className="bg-danger-bg border border-danger/20 rounded p-6 text-center">
          <div className="text-danger font-medium mb-2">{error}</div>
          <button
            onClick={fetchBoard}
            className="mt-4 px-4 py-2 bg-danger text-white rounded hover:bg-danger/90 transition"
          >
            Retry
          </button>
        </div>

        {/* Create Task Modal */}
        <CreateTaskModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreate={handleCreateTask}
        />

        {/* Task Detail Modal */}
        <TaskModal
          isOpen={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          task={selectedTask}
          onUpdate={fetchBoard} // Refresh board after update
          users={users}
        />
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  }
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <div className="w-full px-6 py-6 relative overflow-hidden min-h-screen bg-page-bg">
      {/* Cinematic background glow */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen z-0"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen z-0"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10"
      >
      {/* Modern Board Header */}
      <motion.div variants={itemVariants} className="mb-6 pb-6 border-b border-border/60">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-[16px]">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
              className="w-[64px] h-[64px] shrink-0 rounded-[16px] bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shadow-[0_8px_24px_rgba(87,157,255,0.2)] border border-white/10 cursor-pointer"
            >
              <LayoutDashboard className="w-[32px] h-[32px] text-white drop-shadow-md" strokeWidth={2} />
            </motion.div>
            <div>
              <h1 className="text-[32px] font-extrabold text-text-primary leading-tight tracking-tight mb-[4px]">Project Board</h1>
              <div className="flex items-center gap-[16px]">
                <span className="text-[14px] font-bold text-text-secondary flex items-center gap-[6px] bg-surface-hover px-[12px] py-[6px] rounded-[8px] border border-border/50">
                  <UserIcon className="w-[16px] h-[16px] text-accent" strokeWidth={2.5}/>
                  {user?.email?.split('@')[0] || 'User'}
                </span>
                <span className="text-[14px] font-bold text-text-secondary flex items-center gap-[6px] bg-surface-hover px-[12px] py-[6px] rounded-[8px] border border-border/50">
                  <Calendar className="w-[16px] h-[16px] text-purple-400" strokeWidth={2.5} />
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3 items-center">
            {/* Search input */}
            <div className="relative group">
              <Search size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="pl-10 pr-4 py-2 bg-[#282D33] border border-border/80 hover:border-border text-text-primary text-[14px] rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent w-64 transition-all shadow-sm placeholder:text-text-muted/70"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="px-4 py-2 bg-[#282D33] border border-border/80 hover:border-border text-text-primary rounded-lg hover:bg-[#323940] transition-all duration-200 flex items-center space-x-2 text-[14px] font-medium shadow-sm transition-colors"
              >
                <Filter size={16} className="text-text-muted" />
                <span>Filter</span>
              </button>
              {filterDropdownOpen && (
                <div className="absolute right-0 md:left-0 top-full mt-2 w-64 bg-surface border border-border rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] z-20 p-4 animate-fade-in">
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Assignee</label>
                    <select
                      className="w-full px-3 py-2 bg-[#1A1D21] border border-border/80 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none"
                      value={filterOptions.assigneeId || ''}
                      onChange={(e) => setFilterOptions({...filterOptions, assigneeId: e.target.value ? parseInt(e.target.value) : null})}
                    >
                      <option value="">All assignees</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.email}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Column</label>
                    <select
                      className="w-full px-3 py-2 bg-[#1A1D21] border border-border/80 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none"
                      value={filterOptions.columnId || ''}
                      onChange={(e) => setFilterOptions({...filterOptions, columnId: e.target.value ? parseInt(e.target.value) : null})}
                    >
                      <option value="">All columns</option>
                      {board?.columns?.map(col => (
                        <option key={col.id} value={col.id}>{col.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="flex items-center space-x-3 cursor-pointer group p-2 hover:bg-white/[0.03] rounded-lg transition-colors -mx-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded appearance-none border border-border bg-surface checked:bg-accent checked:border-accent flex-shrink-0 relative before:content-[''] before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjIwIDYgOSAxNyA0IDEyIj48L3BvbHlsaW5lPjwvc3ZnPg==')] before:bg-no-repeat before:bg-center before:bg-[length:12px] checked:before:opacity-100 before:opacity-0 cursor-pointer transition-all"
                        checked={filterOptions.dueDateRange}
                        onChange={(e) => setFilterOptions({...filterOptions, dueDateRange: e.target.checked})}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm text-text-primary leading-tight">Upcoming tasks only</span>
                        <span className="text-[11px] text-text-muted mt-0.5">Due dates in the future</span>
                      </div>
                    </label>
                  </div>
                  <button
                    className="w-full px-3 py-2 bg-[#2D333B] hover:bg-[#3D444D] text-white rounded-lg text-sm font-medium transition-colors border border-white/5"
                    onClick={() => setFilterDropdownOpen(false)}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="px-4 py-2 bg-[#282D33] border border-border/80 hover:border-border text-text-primary rounded-lg hover:bg-[#323940] transition-all duration-200 flex items-center space-x-2 text-[14px] font-medium shadow-sm transition-colors"
              >
                <ArrowDownUp size={16} className="text-text-muted" />
                <span>Sort</span>
              </button>
              {sortDropdownOpen && (
                <div className="absolute right-0 md:left-0 top-full mt-2 w-64 bg-surface border border-border rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] z-20 p-4 animate-fade-in">
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Sort by</label>
                    <select
                      className="w-full px-3 py-2 bg-[#1A1D21] border border-border/80 rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none"
                      value={sortOption.field}
                      onChange={(e) => setSortOption({...sortOption, field: e.target.value})}
                    >
                      <option value="position">Position</option>
                      <option value="due_date">Due Date</option>
                      <option value="title">Title</option>
                      <option value="created_at">Created Date</option>
                      <option value="assignee">Assignee</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Direction</label>
                    <div className="flex bg-[#1A1D21] border border-border/80 rounded-lg p-1">
                      <button
                        className={`flex-1 py-1.5 text-[13px] font-medium rounded-md transition-all ${sortOption.direction === 'asc' ? 'bg-[#323940] text-white shadow-sm' : 'text-text-muted hover:text-white hover:bg-white/[0.02]'}`}
                        onClick={() => setSortOption({...sortOption, direction: 'asc'})}
                      >Ascending</button>
                      <button
                        className={`flex-1 py-1.5 text-[13px] font-medium rounded-md transition-all ${sortOption.direction === 'desc' ? 'bg-[#323940] text-white shadow-sm' : 'text-text-muted hover:text-white hover:bg-white/[0.02]'}`}
                        onClick={() => setSortOption({...sortOption, direction: 'desc'})}
                      >Descending</button>
                    </div>
                  </div>
                  <button
                    className="w-full px-3 py-2 bg-[#2D333B] hover:bg-[#3D444D] text-white rounded-lg text-sm font-medium transition-colors border border-white/5"
                    onClick={() => setSortDropdownOpen(false)}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setModalOpen(true)
              }}
              className="ml-auto px-4 py-2 bg-gradient-to-r from-accent to-purple-500 text-white rounded-lg hover:opacity-90 transition-all duration-200 flex items-center space-x-2 shadow-md shadow-accent/20 hover:-translate-y-0.5 text-[14px] font-medium"
            >
              <Plus size={18} />
              <span>Create</span>
            </button>
          </div>
        </div>
        
        {/* Quick stats bar */}
        <div className="flex flex-wrap items-center gap-4 mt-6">
          {/* Stats Chip: Total Tasks */}
          <motion.div whileHover={{ y: -4 }} className="flex items-center bg-surface/80 backdrop-blur-md border border-border/50 rounded-2xl px-[24px] py-[16px] shadow-lg min-w-[200px] flex-auto group transition-all">
            <div className="w-[48px] h-[48px] shrink-0 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center mr-[16px] relative overflow-hidden group-hover:shadow-[0_0_15px_rgba(87,157,255,0.3)] transition-shadow">
              <ClipboardList size={22} className="text-accent shrink-0 relative z-10" />
            </div>
            <div>
              <p className="text-[12px] text-text-muted font-bold tracking-wider uppercase mb-1 drop-shadow-sm whitespace-nowrap">Total tasks</p>
              <p className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-text-primary leading-none text-2xl drop-shadow-sm">
                {board?.columns?.reduce((total, col) => total + (col.tasks?.length || 0), 0) || 0}
              </p>
            </div>
          </motion.div>
          
          {/* Stats Chip: In Progress */}
          <motion.div whileHover={{ y: -4 }} className="flex items-center bg-surface/80 backdrop-blur-md border border-border/50 rounded-2xl px-[24px] py-[16px] shadow-lg min-w-[200px] flex-auto group transition-all">
            <div className="w-[48px] h-[48px] shrink-0 rounded-full bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/20 flex items-center justify-center mr-[16px] relative overflow-hidden group-hover:shadow-[0_0_15px_rgba(245,205,71,0.3)] transition-shadow">
              <Loader size={22} className="text-warning shrink-0 relative z-10 group-hover:animate-spin" />
            </div>
            <div>
              <p className="text-[12px] text-text-muted font-bold tracking-wider uppercase mb-1 drop-shadow-sm whitespace-nowrap">In progress</p>
              <p className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-text-primary leading-none text-2xl drop-shadow-sm">
                {board?.columns?.filter(col => col.name === 'In Progress' || col.name === 'Review' || col.name === 'Testing').reduce((total, col) => total + (col.tasks?.length || 0), 0) || 0}
              </p>
            </div>
          </motion.div>
          
          {/* Stats Chip: Completed */}
          <motion.div whileHover={{ y: -4 }} className="flex items-center bg-surface/80 backdrop-blur-md border border-border/50 rounded-2xl px-[24px] py-[16px] shadow-lg min-w-[200px] flex-auto group transition-all">
            <div className="w-[48px] h-[48px] shrink-0 rounded-full bg-gradient-to-br from-success/20 to-success/5 border border-success/20 flex items-center justify-center mr-[16px] relative overflow-hidden group-hover:shadow-[0_0_15px_rgba(75,206,151,0.3)] transition-shadow">
              <CheckCircle size={22} className="text-success shrink-0 relative z-10 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <p className="text-[12px] text-text-muted font-bold tracking-wider uppercase mb-1 drop-shadow-sm whitespace-nowrap">Completed</p>
              <p className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-text-primary leading-none text-2xl drop-shadow-sm">
                {board?.columns?.filter(col => col.name === 'Done' || col.name === 'Deployed' || col.name === 'Closed').reduce((total, col) => total + (col.tasks?.length || 0), 0) || 0}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Board columns */}
      <motion.div variants={itemVariants} className="mt-8 z-10 relative">
      {processedColumns && processedColumns.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto pb-6">
            <div className="flex space-x-6 min-w-max">
              {processedColumns.map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  onTaskClick={handleTaskClick}
                  users={users}
                />
              ))}
            </div>
          </div>
          <DragOverlay dropAnimation={null}>
            {activeTaskData ? (
              <div className="rotate-3 shadow-2xl border-2 border-accent rounded-lg opacity-90">
                <TaskCard task={activeTaskData} users={users} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="bg-surface border border-border rounded p-12 text-center">
          <div className="text-text-muted text-4xl mb-4">📋</div>
          <h3 className="text-xl font-medium text-text-primary mb-2">No columns found</h3>
          <p className="text-text-secondary">The board configuration may be incomplete.</p>
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateTask}
      />

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        task={selectedTask}
        onUpdate={fetchBoard} // Refresh board after update
        users={users}
      />
      </motion.div>
      </motion.div>
    </div>
  )
}

export default HomePage