import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, PieChart, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const Sidebar = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Project Board', icon: LayoutDashboard },
    { path: '/reports/time', label: 'Time Report', icon: PieChart },
  ]

  return (
    <div className="w-[280px] bg-[#15181C] border-r border-white/[0.05] h-full flex-col flex-shrink-0 transition-all duration-300 hidden md:flex relative overflow-hidden">
      
      {/* Decorative gradient blob */}
      <div className="absolute top-0 left-[-50%] w-[100%] h-[160px] bg-accent/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen z-0"></div>

      <div className="p-[24px] border-b border-white/[0.05] text-[12px] font-extrabold text-text-muted uppercase tracking-[0.2em] relative z-10">
        Workspace Navigation
      </div>
      
      <nav className="flex-1 overflow-y-auto py-[16px] relative z-10">
        <ul className="flex flex-col gap-[8px] px-[12px]">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <li key={item.path} className="relative">
                {isActive && (
                  <motion.div 
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-accent/10 border-l-[3px] border-accent rounded-r-[4px]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Link
                  to={item.path}
                  className={`flex items-center px-[20px] py-[16px] rounded-[10px] transition-colors duration-200 relative z-10 group ${
                    isActive
                      ? 'text-accent font-bold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.02]'
                  }`}
                >
                  <Icon className={`w-[20px] h-[20px] mr-[14px] transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="text-[14px] tracking-wide relative z-10 leading-none font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User profile block */}
      <div className="p-[20px] border-t border-white/[0.05] bg-black/20 backdrop-blur-md relative z-10 mt-auto">
        <div className="flex items-center gap-[16px] group cursor-pointer">
          <div className="w-[36px] h-[36px] rounded-[10px] bg-accent/10 flex items-center justify-center border border-accent/20 group-hover:bg-accent/20 transition-all shrink-0">
             <Zap className="w-[18px] h-[18px] text-accent" />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-text-primary group-hover:text-accent transition-colors">VibeFlow Team</span>
            <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider mt-[4px]">Free Plan</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar