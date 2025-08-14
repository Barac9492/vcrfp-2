import RFPDashboard from './components/RFPDashboard'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              정부 출자사업 RFP 대응 플랫폼
            </h1>
            <div className="text-sm text-gray-500">
              VCRFP Platform v1.0
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RFPDashboard />
      </main>
    </div>
  )
}

export default App
