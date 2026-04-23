import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Swal from 'sweetalert2'
import api from '../services/api'
import useAuth from '../hooks/useAuth'
import ModernInput from '../components/ModernInput'
import ModernCheckbox from '../components/ModernCheckbox'
import { LayoutDashboard, CheckCircle2, Clock, Users, Zap, TrendingUp } from 'lucide-react'

// Floating element component for the visual side
const FloatingElement = ({ children, delay, className }) => (
  <motion.div
    initial={{ y: 0, opacity: 0 }}
    animate={{ y: [-15, 15, -15], opacity: 1 }}
    transition={{ 
      y: { repeat: Infinity, duration: 6, ease: "easeInOut", delay },
      opacity: { duration: 1, delay: delay * 0.5 }
    }}
    className={`absolute ${className}`}
  >
    {children}
  </motion.div>
)

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  // SweetAlert setup for custom dark theme
  const CustomSwal = Swal.mixin({
    background: '#22272B', // Matches surface color
    color: '#E3E3E3',     // Matches text-primary
    customClass: {
      popup: 'border border-gray-700/50 rounded-2xl shadow-xl',
      title: 'text-xl font-bold',
      confirmButton: 'bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg font-medium transition-colors',
    },
    buttonsStyling: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      CustomSwal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please enter both email and password.',
      })
      return;
    }

    setLoading(true)

    try {
      const response = await api.post('/auth/login', { email, password }, { hideLoader: true })
      const { access_token } = response.data
      const userResponse = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` },
        hideLoader: true
      })
      login(access_token, userResponse.data)
      
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        background: '#22272B',
        color: '#E3E3E3',
      });
      
      Toast.fire({
        icon: 'success',
        title: 'Signed in successfully'
      })

      // Wait for auth state to update and then navigate
      setTimeout(() => {
        navigate('/')
      }, 100)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      CustomSwal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: errorMsg,
      })
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-page-bg flex overflow-hidden">
      
      {/* LEFT COLUMN - AUTH FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        
        {/* Subtle background glow for mobile */}
        <div className="absolute inset-0 block lg:hidden bg-gradient-to-br from-accent/5 to-purple-500/5 pointer-events-none"></div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-md relative z-10"
        >
          <motion.div variants={itemVariants} className="mb-10 text-center lg:text-left">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-accent to-purple-500 rounded-2xl shadow-lg shadow-accent/20 border border-white/10 mb-6 cursor-pointer"
            >
              <LayoutDashboard className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h1>
            <p className="text-text-secondary text-lg">Log in to VibeFlow to continue managing your workspace.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-surface/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/[0.05]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={itemVariants}>
                <ModernInput
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  autoComplete="email"
                  className="w-full"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <ModernInput
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  minLength="8"
                  className="w-full"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center justify-between pt-1">
                <ModernCheckbox
                  id="remember-me"
                  label={<span className="text-sm">Remember me</span>}
                  checked={rememberMe}
                  onChange={setRememberMe}
                />
                <a href="#" className="text-sm text-accent hover:text-white font-medium transition-colors">
                  Forgot password?
                </a>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-4 px-4 bg-gradient-to-r from-accent to-purple-600 hover:from-[#478AF0] hover:to-[#8B48E6] disabled:opacity-70 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-accent/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 overflow-hidden group"
                >
                  {/* Shine effect */}
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
                  
                  {loading ? (
                    <span className="flex items-center justify-center relative z-10">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating...
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Sign In
                      <TrendingUp className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                    </span>
                  )}
                </button>
              </motion.div>
            </form>

            <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-white/[0.06]">
              <p className="text-center text-text-muted text-sm">
                New to VibeFlow?{' '}
                <Link to="/register" className="text-accent hover:text-white font-bold transition-colors">
                  Create an account
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* RIGHT COLUMN - VISUAL EFFECTS */}
      <div className="hidden lg:flex w-1/2 relative bg-[#15181C] items-center justify-center overflow-hidden border-l border-white/[0.02]">
        
        {/* Dynamic Abstract Background Gadients */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent/20 rounded-full blur-[140px] mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

        {/* Central Graphic Composition */}
        <div className="relative z-10 w-full max-w-2xl aspect-square">
          
          {/* Main Mockup Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-2/3 bg-surface border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="h-14 border-b border-white/5 flex items-center px-6 gap-3">
              <div className="w-3 h-3 rounded-full bg-danger"></div>
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <div className="w-3 h-3 rounded-full bg-success"></div>
            </div>
            {/* Body Lines */}
            <div className="flex-1 p-6 space-y-4">
              <div className="flex gap-4">
                <div className="w-1/3 h-32 bg-white/5 rounded-xl border border-white/5"></div>
                <div className="w-1/3 h-48 bg-white/5 rounded-xl border border-white/5"></div>
                <div className="w-1/3 h-24 bg-white/5 rounded-xl border border-white/5"></div>
              </div>
            </div>
          </motion.div>

          {/* Floating Icons */}
          <FloatingElement delay={0} className="top-[15%] left-[15%]">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 backdrop-blur-xl border border-accent/20 shadow-[0_8px_32px_rgba(87,157,255,0.2)] text-accent">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          </FloatingElement>

          <FloatingElement delay={1} className="top-[25%] right-[10%]">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 backdrop-blur-xl border border-purple-500/20 shadow-[0_8px_32px_rgba(168,85,247,0.2)] text-purple-400">
              <Clock className="w-7 h-7" />
            </div>
          </FloatingElement>

          <FloatingElement delay={2} className="bottom-[20%] left-[10%]">
            <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-success/20 to-success/5 backdrop-blur-xl border border-success/20 shadow-[0_8px_32px_rgba(75,206,151,0.2)] text-success">
              <Zap className="w-10 h-10" />
            </div>
          </FloatingElement>

          <FloatingElement delay={0.5} className="bottom-[15%] right-[15%]">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400/20 to-blue-400/5 backdrop-blur-xl border border-blue-400/20 shadow-[0_8px_32px_rgba(96,165,250,0.2)] text-blue-400">
              <Users className="w-8 h-8" />
            </div>
          </FloatingElement>

        </div>

      </div>
    </div>
  )
}

export default LoginPage