import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, UserCircle, Settings, LogOut, Hexagon, ChevronDown, User, Zap } from 'lucide-react'
import useAuth from '../hooks/useAuth'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()
  
  const [profileOpen, setProfileOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="bg-[#1D2125]/80 backdrop-blur-xl border-b border-white/[0.05] h-[72px] sticky top-0 z-50">
      <div className="w-full px-[28px] h-full flex items-center justify-between">
        
        {/* Left side: Logo & Navigation */}
        <div className="flex items-center gap-[32px]">
          <Link to="/" className="flex items-center gap-[16px] group">
            <motion.div 
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.3 }}
              className="w-[42px] h-[42px] bg-gradient-to-br from-purple-500 to-accent rounded-[14px] flex items-center justify-center shadow-[0_8px_24px_rgba(87,157,255,0.3)] border border-white/10 shrink-0"
            >
              <Hexagon className="w-[24px] h-[24px] text-white fill-white/20" />
            </motion.div>
            <div className="flex items-center">
              <span className="text-[26px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-text-secondary tracking-tight">VibeFlow</span>
              <span className="text-[11px] font-bold text-white bg-accent/20 border border-accent/30 px-[10px] py-[4px] rounded-[16px] ml-[12px] tracking-widest uppercase shadow-sm">Beta</span>
            </div>
          </Link>
        </div>

        {/* Right side: User/Auth */}
        <div className="flex items-center">
          {isAuthenticated ? (
            <div className="flex items-center gap-[24px]">
              
              {/* Notifications */}
              <button className="relative p-[10px] text-text-muted hover:text-white transition-colors group">
                <Bell className="w-[24px] h-[24px] group-hover:scale-110 transition-transform" />
                <span className="absolute top-[8px] right-[8px] w-[10px] h-[10px] bg-danger rounded-full shadow-[0_0_8px_rgba(248,113,104,0.6)] animate-pulse"></span>
              </button>

              <div className="w-[1px] h-[32px] bg-white/[0.08]"></div>

              {/* User dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`flex items-center gap-[16px] pl-[8px] pr-[16px] py-[8px] rounded-full border transition-all duration-300 ${profileOpen ? 'bg-white/5 border-white/10 shadow-sm' : 'bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/[0.05]'}`}
                >
                  <div className="w-[38px] h-[38px] shrink-0 bg-gradient-to-tr from-accent to-purple-600 rounded-full flex items-center justify-center shadow-inner border border-white/10">
                   <User className="w-[20px] h-[20px] text-white" />
                  </div>
                  <div className="hidden lg:block text-left max-w-[150px]">
                    <p className="text-[15px] font-bold text-text-primary leading-none truncate">{user?.email?.split('@')[0] || 'User'}</p>
                  </div>
                  <motion.div 
                    animate={{ rotate: profileOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 text-text-muted"
                  >
                    <ChevronDown className="w-[18px] h-[18px]" />
                  </motion.div>
                </button>

                {/* Dropdown menu */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-[16px] w-[260px] bg-[#22272B]/95 backdrop-blur-xl rounded-[16px] border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] py-[8px] z-50 origin-top-right overflow-hidden"
                    >
                      <div className="px-[24px] py-[16px] border-b border-white/5 bg-white/[0.01]">
                        <p className="text-[15px] font-bold text-white mb-[4px]">{user?.email?.split('@')[0] || 'User'}</p>
                        <p className="text-[13px] text-text-muted truncate">{user?.email}</p>
                      </div>
                      <div className="py-[8px]">
                        <Link
                          to="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center px-[24px] py-[14px] text-[15px] font-medium text-text-secondary hover:text-white hover:bg-white/5 transition-colors group"
                        >
                          <UserCircle className="w-[20px] h-[20px] mr-[16px] text-text-muted group-hover:text-accent transition-colors" />
                          Your profile
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center px-[24px] py-[14px] text-[15px] font-medium text-text-secondary hover:text-white hover:bg-white/5 transition-colors group"
                        >
                          <Settings className="w-[20px] h-[20px] mr-[16px] text-text-muted group-hover:text-purple-400 transition-colors" />
                          Settings
                        </Link>
                      </div>
                      <div className="border-t border-white/5 mt-[4px] pt-[8px] pb-[4px]">
                        <button
                          onClick={logout}
                          className="flex items-center w-full px-[24px] py-[14px] text-[15px] font-medium text-danger hover:bg-danger/10 transition-colors group"
                        >
                          <LogOut className="w-[20px] h-[20px] mr-[16px] text-danger/70 group-hover:text-danger transition-colors" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            !['/login', '/register'].includes(location.pathname) && (
              <div className="flex items-center gap-[16px]">
                <Link
                  to="/login"
                  className="px-[16px] py-[10px] text-[15px] font-bold text-text-secondary hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="relative px-[24px] py-[12px] text-[15px] font-bold text-white bg-gradient-to-r from-accent to-purple-500 rounded-[12px] shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-[2px] transition-all duration-300 overflow-hidden group"
                >
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
                  <span className="relative z-10 flex items-center gap-[8px]">
                    <span>Get started free</span>
                    <Zap className="w-[18px] h-[18px] opacity-70 group-hover:opacity-100" />
                  </span>
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar