import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import TaskModal from '../TaskModal'

// Mock the boardService module with inline vi.fn()
vi.mock('../../services/board', () => ({
  // Default export (boardService object)
  default: {
    getAssignmentHistory: vi.fn(),
    getWorklogs: vi.fn(),
    createWorklog: vi.fn(),
    getBoard: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    getUsers: vi.fn(),
    getTimeReport: vi.fn(),
  },
  // Named export for compatibility
  boardService: {
    getAssignmentHistory: vi.fn(),
    getWorklogs: vi.fn(),
    createWorklog: vi.fn(),
    getBoard: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    getUsers: vi.fn(),
    getTimeReport: vi.fn(),
  },
}))

// Import the mocked module after mocking
import boardService from '../../services/board'

describe('TaskModal - Assignment History Creation', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    assignee_id: null,
  }
  const mockUsers = [
    { id: 1, email: 'user1@example.com' },
    { id: 2, email: 'user2@example.com' },
  ]
  const mockOnClose = vi.fn()
  const mockOnUpdate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches assignment history when modal opens', async () => {
    const mockHistory = [
      {
        id: 1,
        task_id: 1,
        old_assignee_id: null,
        new_assignee_id: 1,
        changed_by_id: 2,
        changed_at: '2024-01-01T12:00:00Z',
      },
    ]
    boardService.getAssignmentHistory.mockResolvedValue(mockHistory)
    boardService.getWorklogs.mockResolvedValue([])

    render(
      <TaskModal
        task={mockTask}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
        users={mockUsers}
      />
    )

    await waitFor(() => {
      expect(boardService.getAssignmentHistory).toHaveBeenCalledWith(1)
    })

    // Expect history items to be displayed
    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument()
    })
  })

  it('displays error when assignment history fetch fails', async () => {
    boardService.getAssignmentHistory.mockRejectedValue(new Error('Network error'))
    boardService.getWorklogs.mockResolvedValue([])

    render(
      <TaskModal
        task={mockTask}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
        users={mockUsers}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Failed to load assignment history')).toBeInTheDocument()
    })
  })

  it('shows "Unassigned" for null assignee in history', async () => {
    const mockHistory = [
      {
        id: 1,
        task_id: 1,
        old_assignee_id: null,
        new_assignee_id: 1,
        changed_by_id: 2,
        changed_at: '2024-01-01T12:00:00Z',
      },
      {
        id: 2,
        task_id: 1,
        old_assignee_id: 1,
        new_assignee_id: null,
        changed_by_id: 2,
        changed_at: '2024-01-01T13:00:00Z',
      },
    ]
    boardService.getAssignmentHistory.mockResolvedValue(mockHistory)
    boardService.getWorklogs.mockResolvedValue([])

    render(
      <TaskModal
        task={mockTask}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
        users={mockUsers}
      />
    )

    await waitFor(() => {
      // Should contain "Unassigned" text
      expect(screen.getAllByText('Unassigned').length).toBeGreaterThan(0)
    })
  })
})