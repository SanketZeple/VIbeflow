import api from './api'

export const boardService = {
  async getBoard() {
    try {
      const response = await api.get('/board/')
      return response.data
    } catch (error) {
      console.error('Failed to fetch board:', error)
      throw error
    }
  },

  async createTask(taskData) {
    try {
      console.log('Creating task with data:', taskData)
      const response = await api.post('/board/tasks', taskData)
      console.log('Task created:', response.data)
      return response.data
    } catch (error) {
      console.error('Failed to create task:', error)
      // Extract error message from response if available
      if (error.response && error.response.data && error.response.data.detail) {
        throw new Error(error.response.data.detail)
      }
      throw new Error('Failed to create task')
    }
  },

  async updateTask(taskId, updateData) {
    try {
      console.log('Updating task', taskId, 'with data:', updateData)
      const response = await api.patch(`/board/tasks/${taskId}`, updateData)
      console.log('Task updated:', response.data)
      return response.data
    } catch (error) {
      console.error('Failed to update task:', error)
      if (error.response && error.response.data && error.response.data.detail) {
        throw new Error(error.response.data.detail)
      }
      throw new Error('Failed to update task')
    }
  },

  async getUsers() {
    try {
      const response = await api.get('/board/users')
      return response.data
    } catch (error) {
      console.error('Failed to fetch users:', error)
      throw error
    }
  },

  async getAssignmentHistory(taskId) {
    try {
      const response = await api.get(`/board/tasks/${taskId}/assignment-history`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch assignment history:', error)
      throw error
    }
  },

  async createWorklog(taskId, worklogData) {
    try {
      console.log('Creating worklog for task', taskId, 'with data:', worklogData)
      const response = await api.post(`/board/tasks/${taskId}/worklogs`, worklogData)
      console.log('Worklog created:', response.data)
      return response.data
    } catch (error) {
      console.error('Failed to create worklog:', error)
      if (error.response && error.response.data && error.response.data.detail) {
        throw new Error(error.response.data.detail)
      }
      throw new Error('Failed to create worklog')
    }
  },

  async getWorklogs(taskId) {
    try {
      const response = await api.get(`/board/tasks/${taskId}/worklogs`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch worklogs:', error)
      throw error
    }
  },

  async getTimeReport() {
    try {
      const response = await api.get('/reports/time')
      return response.data
    } catch (error) {
      console.error('Failed to fetch time report:', error)
      throw error
    }
  }
}

export default boardService