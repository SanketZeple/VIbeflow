import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Activity,
  Users,
  AlertCircle,
  FileText,
  Loader2,
  RefreshCcw,
  CheckCircle2,
  Clock4,
  LayoutDashboard
} from 'lucide-react'
import boardService from '../services/board'
import useAuth from '../hooks/useAuth'


const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', bounce: 0.4, duration: 0.8 }
  }
}

const TimeReportPage = () => {
  const [report, setReport] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user: currentUser } = useAuth()


  useEffect(() => {
    fetchTimeReport()
  }, [])

  const fetchTimeReport = async () => {
    try {
      setLoading(true)
      const [reportData, usersData] = await Promise.all([
        boardService.getTimeReport(),
        boardService.getUsers()
      ])
      setReport(reportData)
      setTeamMembers(usersData)
      setError(null)
    } catch (err) {

      console.error('Failed to load time report:', err)
      setError('Failed to load time report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatHours = (hours) => {
    return (hours || 0).toFixed(1)
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-page-bg pt-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto mb-4" />
          <p className="text-text-secondary font-medium tracking-wide">Synthesizing time data...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-page-bg pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-danger/10 border border-danger/20 rounded-xl p-6 shadow-sm"
          >
            <div className="flex">
              <AlertCircle className="w-6 h-6 text-danger shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-danger">Error loading time report</h3>
                <div className="mt-2 text-sm text-danger/80">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={fetchTimeReport}
                    className="inline-flex items-center px-4 py-2 text-sm leading-4 font-medium rounded text-white bg-danger hover:bg-danger/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger focus:ring-offset-page-bg transition-colors shadow-sm"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[calc(100vh-56px)] bg-page-bg pt-10 pb-20 px-4 sm:px-6 lg:px-8 overflow-x-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate="show"
          className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6"
        >
          <div>
            <div className="inline-flex items-center justify-center p-2 bg-accent/10 rounded-lg mb-3 border border-accent/20">
              <Clock className="w-6 h-6 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">Time Report</h1>
            <p className="mt-1 text-text-secondary text-base">
              Cumulative hours logged across all active tracking blocks.
            </p>
          </div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="mt-6 md:mt-0 inline-flex items-center px-5 py-3 rounded-xl bg-surface border border-border shadow-sm"
          >
            <div className="mr-4 p-2 bg-accent/10 rounded-full">
              <Activity className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-0.5">Grand Total</p>
              <div className="text-3xl font-bold text-text-primary flex items-baseline">
                {formatHours(report.grand_total)}
                <span className="text-base text-text-muted ml-1.5 font-medium">hrs</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
        >
          {[
            {
              title: "Total Hours Tracked",
              value: formatHours(report.grand_total),
              icon: Clock4,
              color: "text-accent",
              bg: "bg-accent-light",
            },
            {
              title: "Active Tasks",
              value: report.tasks.length,
              icon: FileText,
              color: "text-success",
              bg: "bg-success-bg",
            },
            {
              title: "Team Members",
              value: teamMembers.filter(u => u.email !== currentUser?.email).length,
              icon: Users,
              color: "text-warning",
              bg: "bg-warning-bg",
            }

          ].map((stat, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-surface p-6 rounded-xl border border-border shadow-sm hover:border-border-hover transition-colors relative overflow-hidden group"
            >
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-300">
                <stat.icon className="w-32 h-32" />
              </div>
              <div className="flex items-center relative z-10">
                <div className={`flex-shrink-0 h-12 w-12 ${stat.bg} rounded-xl flex items-center justify-center border border-white/5`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">{stat.title}</h3>
                  <p className={`text-3xl font-bold ${stat.color} mt-0.5 tracking-tight`}>{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Board Data Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-surface shadow-sm rounded-xl border border-border overflow-hidden"
        >
          <div className="border-b border-border bg-column-header px-6 py-4 flex items-center justify-between pointer-events-none">
            <h2 className="text-lg font-semibold text-text-primary flex items-center">
              <LayoutDashboard className="w-5 h-5 mr-2 text-text-muted" />
              Task Breakdown
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-[#181a1e]">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider w-2/5">
                    Task Identity
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Pipeline Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Assignee
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider w-1/4">
                    Logged Hours
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border/50">
                <AnimatePresence>
                  {report.tasks.length === 0 ? (
                    <motion.tr 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan="4" className="px-6 py-16 text-center text-text-muted">
                        <motion.div 
                          initial={{ scale: 0.8 }} 
                          animate={{ scale: 1 }} 
                          transition={{ type: "spring", bounce: 0.5 }}
                          className="flex flex-col items-center"
                        >
                          <div className="w-16 h-16 bg-column-header flex items-center justify-center rounded-full mb-4">
                            <Clock className="w-8 h-8 text-text-muted" />
                          </div>
                          <p className="text-lg font-medium text-text-primary">No temporal data available</p>
                          <p className="mt-1 text-sm text-text-secondary">Track hours on your board items to visualize them here.</p>
                        </motion.div>
                      </td>
                    </motion.tr>
                  ) : (
                    report.tasks.map((task, idx) => (
                      <motion.tr 
                        key={task.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-column-header/50 transition-colors group cursor-default"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center">
                              <span className="text-accent text-xs font-bold leading-none tracking-tighter">#{task.id}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">{task.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold border ${
                            task.status === 'Done' ? 'bg-success-bg text-success border-success/20' : 
                            task.status === 'In Progress' ? 'bg-warning-bg text-warning border-warning/20' : 
                            'bg-column-header text-text-secondary border-border'
                          }`}>
                            {task.status === 'Done' && <CheckCircle2 className="w-3 h-3 mr-1.5" />}
                            {task.status === 'In Progress' && <Activity className="w-3 h-3 mr-1.5" />}
                            {task.status !== 'Done' && task.status !== 'In Progress' && <div className="w-1.5 h-1.5 rounded-full bg-text-muted mr-2" />}
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {task.assignee_email ? (
                            <div className="flex items-center text-sm text-text-primary">
                              <div className="w-6 h-6 rounded-full bg-text-secondary/20 flex items-center justify-center text-xs font-medium mr-2">
                                {task.assignee_email.charAt(0).toUpperCase()}
                              </div>
                              {task.assignee_email}
                            </div>
                          ) : (
                            <span className="text-text-muted italic flex items-center text-sm">
                              <div className="w-6 h-6 rounded-full bg-border border border-dashed border-text-muted/50 mr-2" />
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col justify-center">
                            <div className="flex items-baseline mb-1.5">
                              <span className="text-sm font-bold text-text-primary mr-1">
                                {formatHours(task.total_hours)}
                              </span>
                              <span className="text-xs text-text-secondary">hrs</span>
                            </div>
                            <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(task.total_hours / 20 * 100, 100)}%` }}
                                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 + (idx * 0.05) }}
                                className={`h-1.5 rounded-full ${task.total_hours > 10 ? 'bg-warning' : 'bg-accent'}`} 
                              />
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Footer summary */}
          {report.tasks.length > 0 && (
            <div className="border-t border-border bg-[#181a1e] px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="text-xs text-text-secondary font-medium">
                  Showing <span className="text-text-primary">{report.tasks.length}</span> active tasks
                </div>
                <div className="text-sm font-semibold text-text-primary">
                  Aggregate: <span className="text-accent ml-1">{formatHours(report.grand_total)}h</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default TimeReportPage