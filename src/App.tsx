import { useState } from 'react'
import ProfessionalLanding from './components/ProfessionalLanding'
import DataVault from './components/DataVault'
import QualityControlDashboard from './components/QualityControlDashboard'
import './App.css'

type AppView = 'landing' | 'vault' | 'quality'

function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing')

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <ProfessionalLanding />
      case 'vault':
        return <DataVault />
      case 'quality':
        return <QualityControlDashboard />
      default:
        return <ProfessionalLanding />
    }
  }

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">K</span>
                </div>
                <span className="font-bold text-slate-800">KIF RFP 플랫폼</span>
              </div>
              
              <div className="hidden md:flex space-x-1">
                <button
                  onClick={() => setCurrentView('landing')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentView === 'landing'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  🏠 홈
                </button>
                <button
                  onClick={() => setCurrentView('vault')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentView === 'vault'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  💾 데이터 저장소
                </button>
                <button
                  onClick={() => setCurrentView('quality')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentView === 'quality'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  ✅ 품질 관리
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-slate-500">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>시스템 정상</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {renderView()}
      </main>
    </div>
  )
}

export default App
