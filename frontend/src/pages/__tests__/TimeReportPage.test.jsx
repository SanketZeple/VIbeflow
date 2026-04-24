import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import TimeReportPage from '../TimeReportPage'

// Mock the boardService module with inline vi.fn()
vi.mock('../../services/board', () => ({
  // Default export (boardService object)
  default: {
    getTimeReport: vi.fn(),
    createWorklog: vi.fn(),
    getWorklogs: vi.fn(),
    getAssignmentHistory: vi.fn(),
    getBoard: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    getUsers: vi.fn(),
  },
  // Named export for compatibility
  boardService: {
    getTimeReport: vi.fn(),
    createWorklog: vi.fn(),
    getWorklogs: vi.fn(),
    getAssignmentHistory: vi.fn(),
    getBoard: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    getUsers: vi.fn(),
  },
}))

// Import the mocked module after mocking
import boardService from '../../services/board'

describe('TimeReportPage - Time Report Calculation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays loading state initially', () => {
    boardService.getTimeReport.mockImplementation(() => new Promise(() => {})) // never resolves

    render(<TimeReportPage />)

    expect(screen.getByText('Synthesizing time data...')).toBeInTheDocument()
  })

  it('renders time report with per-task totals and grand total', async () => {
    const mockReport = {
      tasks: [
        {
          id: 1,
          title: 'Task A',
          status: 'In Progress',
          assignee_email: 'user1@example.com',
          total_hours: 5.5,
        },
        {
          id: 2,
          title: 'Task B',
          status: 'Done',
          assignee_email: 'user2@example.com',
          total_hours: 3.0,
        },
      ],
      grand_total: 8.5,
    }

    boardService.getTimeReport.mockResolvedValue(mockReport)

    render(<TimeReportPage />)

    await waitFor(() => {
      expect(screen.getByText('Task A')).toBeInTheDocument()
      expect(screen.getByText('Task B')).toBeInTheDocument()
    })

    // Check per-task hours
    expect(screen.getByText('5.5')).toBeInTheDocument()
    expect(screen.getByText('3.0')).toBeInTheDocument()

    // Check grand total
    expect(screen.getByText('8.5')).toBeInTheDocument()
  })

  it('shows error when report fetch fails', async () => {
    boardService.getTimeReport.mockRejectedValue(new Error('Network error'))

    render(<TimeReportPage />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load time report. Please try again.')).toBeInTheDocument()
    })

    // Retry button should be present
    const retryButton = screen.getByText('Try again')
    expect(retryButton).toBeInTheDocument()
  })

  it('retries fetching when retry button clicked', async () => {
    boardService.getTimeReport
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce({
        tasks: [],
        grand_total: 0,
      })

    render(<TimeReportPage />)

    await waitFor(() => {
      expect(screen.getByText('Try again')).toBeInTheDocument()
    })

    const retryButton = screen.getByText('Try again')
    fireEvent.click(retryButton)

    // Should call getTimeReport again
    await waitFor(() => {
      expect(boardService.getTimeReport).toHaveBeenCalledTimes(2)
    })
  })

  it('formats hours with one decimal place', async () => {
    const mockReport = {
      tasks: [
        {
          id: 1,
          title: 'Task',
          status: 'Backlog',
          assignee_email: 'user@example.com',
          total_hours: 7.123,
        },
      ],
      grand_total: 7.123,
    }

    boardService.getTimeReport.mockResolvedValue(mockReport)

    render(<TimeReportPage />)

    await waitFor(() => {
      // Should format to 7.1 (one decimal)
      expect(screen.getByText('7.1')).toBeInTheDocument()
    })
  })
})