import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ModernLanding from './components/ModernLanding'
import DataVault from './components/DataVault'
import QualityControlDashboard from './components/QualityControlDashboard'
import './App.css'

type AppView = 'landing' | 'vault' | 'quality'

function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing')
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Simulate loading for smooth entrance
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <ModernLanding />
      case 'vault':
        return <DataVault />
      case 'quality':
        return <QualityControlDashboard />
      default:
        return <ModernLanding />
    }
  }

  const navItems = [
    { id: 'landing', label: '홈', icon: '🏠', description: 'RFP 문서 업로드 및 분석' },
    { id: 'vault', label: '데이터 저장소', icon: '💾', description: '재사용 가능한 데이터 관리' },
    { id: 'quality', label: '품질 관리', icon: '✅', description: '검증 및 품질 점검' }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white"
        >
          <motion.div
            className="h-16 w-16 border-4 border-white/30 border-t-white rounded-full mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <h2 className="text-2xl font-bold mb-2">KIF RFP 플랫폼</h2>
          <p className="text-indigo-200">로딩 중...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Modern Navigation Bar */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50 shadow-lg shadow-black/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">K</span>
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  KIF RFP 플랫폼
                </h1>
                <p className="text-xs text-slate-500">정부 출자사업 전문 솔루션</p>
              </div>
            </motion.div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as AppView)}
                  className={`group relative px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    currentView === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
                      {item.description}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Status Indicator */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <motion.div 
                  className="h-3 w-3 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-slate-600 font-medium">시스템 정상</span>
              </div>
              <div className="h-6 w-px bg-slate-200"></div>
              <div className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">AI 준비완료</span>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/60 transition-colors"
            >
              <svg className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-lg border-t border-white/20"
            >
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id as AppView)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                      currentView === item.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'text-slate-600 hover:bg-white/60'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs opacity-75">{item.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main Content with Smooth Transitions */}
      <main className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 h-80 w-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  )
}

export default App
