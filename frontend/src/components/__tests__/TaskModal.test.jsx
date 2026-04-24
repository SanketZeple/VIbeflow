import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TaskModal from '../TaskModal'

// Mock the boardService module with inline vi.fn()
vi.mock('../../services/board', () => ({
  // Default export (boardService object)
  default: {
    createWorklog: vi.fn(),
    getWorklogs: vi.fn(),
    getAssignmentHistory: vi.fn(),
    getBoard: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    getUsers: vi.fn(),
    getTimeReport: vi.fn(),
  },
  // Named export for compatibility
  boardService: {
    createWorklog: vi.fn(),
    getWorklogs: vi.fn(),
    getAssignmentHistory: vi.fn(),
    getBoard: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    getUsers: vi.fn(),
    getTimeReport: vi.fn(),
  },
}))

// Import the mocked module after mocking
import boardService from '../../services/board'

describe('TaskModal - Time Logging Logic', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    assignee_id: null,
  }
  const mockUsers = []
  const mockOnClose = vi.fn()
  const mockOnUpdate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('validates hours input must be positive', async () => {
    render(
      <TaskModal
        task={mockTask}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
        users={mockUsers}
      />
    )

    // Find hours input and set invalid value
    const hoursInput = screen.getByPlaceholderText('e.g. 2.5')
    fireEvent.change(hoursInput, { target: { value: '0' } })

    const addButton = screen.getByText('Add Worklog')
    fireEvent.click(addButton)

    // Expect error message
    await waitFor(() => {
      expect(screen.getByText('Hours must be a positive number')).toBeInTheDocument()
    })
    expect(boardService.createWorklog).not.toHaveBeenCalled()
  })

  it('creates a worklog with valid hours and description', async () => {
    const mockWorklog = { id: 1, hours: 2.5, description: 'Implemented feature' }
    boardService.createWorklog.mockResolvedValue(mockWorklog)
    boardService.getWorklogs.mockResolvedValue([mockWorklog])

    render(
      <TaskModal
        task={mockTask}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
        users={mockUsers}
      />
    )

    // Fill hours
    const hoursInput = screen.getByPlaceholderText('e.g. 2.5')
    fireEvent.change(hoursInput, { target: { value: '2.5' } })

    // Fill description
    const descInput = screen.getByPlaceholderText('What did you work on?')
    fireEvent.change(descInput, { target: { value: 'Implemented feature' } })

    // Click add
    const addButton = screen.getByText('Add Worklog')
    fireEvent.click(addButton)

    // Verify service called with correct data
    await waitFor(() => {
      expect(boardService.createWorklog).toHaveBeenCalledWith(1, {
        hours: 2.5,
        description: 'Implemented feature',
      })
    })

    // Verify getWorklogs is called to refresh list
    await waitFor(() => {
      expect(boardService.getWorklogs).toHaveBeenCalledWith(1)
    })
  })

  it('shows error when worklog creation fails', async () => {
    boardService.createWorklog.mockRejectedValue(new Error('Network error'))

    render(
      <TaskModal
        task={mockTask}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
        users={mockUsers}
      />
    )

    const hoursInput = screen.getByPlaceholderText('e.g. 2.5')
    fireEvent.change(hoursInput, { target: { value: '3' } })
    const addButton = screen.getByText('Add Worklog')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText(/Failed to create worklog/)).toBeInTheDocument()
    })
  })
})