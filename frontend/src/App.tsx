import { Routes, Route, Link } from 'react-router-dom'
import GoodsOverview from './pages/GoodsOverview'
import ItemDetail from './pages/ItemDetail'
import CompaniesList from './pages/CompaniesList'
import CompanyDetail from './pages/CompanyDetail'
import WorkerDetail from './pages/WorkerDetail'
import MuList from './pages/MuList'
import MuDetail from './pages/MuDetail'

function App() {
  return (
    <div className="min-h-screen bg-gray-900" style={{ backgroundImage: 'linear-gradient(#111827, #111827)' }}>
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">WarEra Calculator</h1>
            <nav className="flex gap-4">
              <Link to="/" className="text-blue-400 hover:text-blue-300">Market</Link>
              <Link to="/companies" className="text-blue-400 hover:text-blue-300">Companies</Link>
              <Link to="/mu" className="text-blue-400 hover:text-blue-300">MU</Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4">
        <Routes>
          <Route path="/" element={<GoodsOverview />} />
          <Route path="/item/:code" element={<ItemDetail />} />
          <Route path="/companies" element={<CompaniesList />} />
          <Route path="/company/:id" element={<CompanyDetail />} />
          <Route path="/company/:companyId/worker/:workerId" element={<WorkerDetail />} />
          <Route path="/mu" element={<MuList />} />
          <Route path="/mu/:muId" element={<MuDetail />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
