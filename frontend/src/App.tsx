import { Routes, Route, Link } from 'react-router-dom'
import GoodsOverview from './pages/GoodsOverview'
import ItemDetail from './pages/ItemDetail'
import CompaniesList from './pages/CompaniesList'
import CompanyDetail from './pages/CompanyDetail'
import WorkerDetail from './pages/WorkerDetail'
import MuList from './pages/MuList'
import MuDetail from './pages/MuDetail'
import BattleSimulator from './pages/BattleSimulator'

const USEFUL_LINKS: { name: string; url: string }[] = [
  { name: 'WarEra Simulator', url: 'https://war-era.vercel.app' },
  { name: 'Market Monitor', url: 'https://warera-market.info/monitor/' },
  { name: 'Wealth Rate', url: 'https://wealthrate.vercel.app' },
  { name: 'Factory Optimizer', url: 'https://3dcut.github.io/warera-company-calc/' },
  { name: 'WarEra', url: 'https://app.warera.io/world' },
  { name: 'WarEra Dev', url: 'https://dev.warera.io' },
  { name: 'Staatsradio', url: 'https://laut.fm/war-era-de' },
]

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900" style={{ backgroundImage: 'linear-gradient(#111827, #111827)' }}>
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">WarEra Calculator</h1>
            <nav className="flex gap-4">
              <Link to="/" className="text-blue-400 hover:text-blue-300">Market</Link>
              <Link to="/companies" className="text-blue-400 hover:text-blue-300">Companies</Link>
              <Link to="/mu" className="text-blue-400 hover:text-blue-300">MU</Link>
              <Link to="/battle-simulator" className="text-blue-400 hover:text-blue-300">Battle Sim</Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto py-6 px-4">
        <Routes>
          <Route path="/" element={<GoodsOverview />} />
          <Route path="/item/:code" element={<ItemDetail />} />
          <Route path="/companies" element={<CompaniesList />} />
          <Route path="/company/:id" element={<CompanyDetail />} />
          <Route path="/company/:companyId/worker/:workerId" element={<WorkerDetail />} />
          <Route path="/mu" element={<MuList />} />
          <Route path="/mu/:muId" element={<MuDetail />} />
          <Route path="/battle-simulator" element={<BattleSimulator />} />
        </Routes>
      </main>
      <footer className="bg-gray-800 border-t border-gray-700 mt-12 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Useful Links</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {USEFUL_LINKS.map(({ name, url }) => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300">
                {name}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
