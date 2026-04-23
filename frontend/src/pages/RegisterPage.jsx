import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'
import api from '../services/api'
import useAuth from '../hooks/useAuth'
import ModernInput from '../components/ModernInput'
import ModernCheckbox from '../components/ModernCheckbox'
import { ShieldCheck, Target, Rocket, Sparkles, Check, CheckCircle2 } from 'lucide-react'

// Floating element component for the visual side
const FloatingElement = ({ children, delay, className }) => (
  <motion.div
    initial={{ y: 0, opacity: 0 }}
    animate={{ y: [-15, 15, -15], opacity: 1 }}
    transition={{ 
      y: { repeat: Infinity, duration: 8, ease: "easeInOut", delay },
      opacity: { duration: 1, delay: delay * 0.5 }
    }}
    className={`absolute ${className}`}
  >
    {children}
  </motion.div>
)

const RegisterPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
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

    if (password !== confirmPassword) {
      CustomSwal.fire({
        icon: 'error',
        title: 'Passwords Mismatch',
        text: 'The passwords you entered do not match.',
      })
      return
    }
    if (password.length < 8) {
      CustomSwal.fire({
        icon: 'warning',
        title: 'Weak Password',
        text: 'Password must be at least 8 characters long.',
      })
      return
    }
    if (!agreeToTerms) {
      CustomSwal.fire({
        icon: 'info',
        title: 'Terms Required',
        text: 'You must agree to the Terms of Service and Privacy Policy to continue.',
      })
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/auth/register', { email, password }, { hideLoader: true })
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
        timer: 2000,
        timerProgressBar: true,
        background: '#22272B',
        color: '#E3E3E3',
      });
      
      Toast.fire({
        icon: 'success',
        title: 'Account created successfully!'
      })

      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Registration failed. Email may already be registered.';
      CustomSwal.fire({
        icon: 'error',
        title: 'Registration Failed',
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

  // Password validation visualizer
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return (
    <div className="min-h-screen bg-page-bg flex flex-row-reverse overflow-hidden">
      
      {/* RIGHT COLUMN - AUTH FORM (Flipped for variation from Login) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        
        <div className="absolute inset-0 block lg:hidden bg-gradient-to-tr from-purple-600/5 to-accent/5 pointer-events-none"></div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-md relative z-10"
        >
          <motion.div variants={itemVariants} className="mb-8 text-center lg:text-left">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-purple-600 to-accent rounded-2xl shadow-lg shadow-purple-500/20 border border-white/10 mb-6 cursor-pointer"
            >
              <Rocket className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Join VibeFlow</h1>
            <p className="text-text-secondary text-lg">Create an account to supercharge your team's productivity.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-surface/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/[0.05]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={itemVariants}>
                <ModernInput
                  label="Work email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
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
                  placeholder="Create a strong password"
                  required
                  autoComplete="new-password"
                  minLength="8"
                  className="w-full"
                />
                
                {/* Password Strength Indicator */}
                <div className="mt-3 grid grid-cols-2 gap-y-2 gap-x-4">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors ${hasMinLength ? 'bg-success text-[#1C3329]' : 'bg-white/10 text-transparent'}`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className={`text-xs ${hasMinLength ? 'text-text-primary' : 'text-text-muted'}`}>8+ characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors ${hasUpper ? 'bg-success text-[#1C3329]' : 'bg-white/10 text-transparent'}`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className={`text-xs ${hasUpper ? 'text-text-primary' : 'text-text-muted'}`}>Uppercase</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors ${hasLower ? 'bg-success text-[#1C3329]' : 'bg-white/10 text-transparent'}`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className={`text-xs ${hasLower ? 'text-text-primary' : 'text-text-muted'}`}>Lowercase</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors ${hasNumber ? 'bg-success text-[#1C3329]' : 'bg-white/10 text-transparent'}`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className={`text-xs ${hasNumber ? 'text-text-primary' : 'text-text-muted'}`}>Number</span>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <ModernInput
                  label="Confirm password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re‑enter your password"
                  required
                  autoComplete="new-password"
                  minLength="8"
                  className="w-full"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <ModernCheckbox
                  id="terms"
                  label={
                    <span className="text-[13px] leading-tight">
                      I agree to the{' '}
                      <a href="#" className="flex-none text-purple-400 hover:text-purple-300 font-medium underline underline-offset-2 decoration-purple-400/30 hover:decoration-purple-400 transition-colors">Terms</a>{' '}
                      and{' '}
                      <a href="#" className="flex-none text-purple-400 hover:text-purple-300 font-medium underline underline-offset-2 decoration-purple-400/30 hover:decoration-purple-400 transition-colors">Privacy Policy</a>
                    </span>
                  }
                  checked={agreeToTerms}
                  onChange={setAgreeToTerms}
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-4 px-4 bg-gradient-to-r from-purple-600 to-accent hover:from-purple-500 hover:to-[#478AF0] disabled:opacity-70 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 overflow-hidden group"
                >
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
                  
                  {loading ? (
                    <span className="flex items-center justify-center relative z-10">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Create Account
                      <Sparkles className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                    </span>
                  )}
                </button>
              </motion.div>
            </form>

            <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-white/[0.06]">
              <p className="text-center text-text-muted text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
                  Sign in instead
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* LEFT COLUMN - VISUAL EFFECTS */}
      <div className="hidden lg:flex w-1/2 relative bg-[#15181C] items-center justify-center overflow-hidden border-r border-white/[0.02]">
        
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[140px] mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-2xl px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-5xl font-extrabold text-white mb-6 leading-tight">
              A better way to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-accent">ship faster.</span>
            </h2>
            <p className="text-xl text-text-secondary mb-12 max-w-lg leading-relaxed">
              Join thousands of teams who manage their workflows seamlessly with our modern Kanban experience.
            </p>

            <div className="space-y-6">
              {[
                { icon: Target, title: "Organize Everything", desc: "Keep all your tasks, documents, and discussions in one place." },
                { icon: ShieldCheck, title: "Enterprise Security", desc: "Bank-level encryption and granular permission controls." },
                { icon: CheckCircle2, title: "Boost Productivity", desc: "Automate repetitive work and focus on what matters." }
              ].map((feature, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (idx * 0.2), duration: 0.5 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{feature.title}</h3>
                    <p className="text-text-muted">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Floating background graphics */}
        <FloatingElement delay={0} className="top-[10%] right-[20%]">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent/20 to-transparent border border-accent/20 backdrop-blur-xl"></div>
        </FloatingElement>
        
        <FloatingElement delay={1} className="bottom-[10%] left-[20%]">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-600/20 to-transparent border border-purple-500/20 backdrop-blur-xl"></div>
        </FloatingElement>

      </div>
    </div>
  )
}

export default RegisterPage