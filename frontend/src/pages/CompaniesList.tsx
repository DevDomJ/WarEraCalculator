import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ITEM_NAMES } from '../utils/itemNames'

export default function CompaniesList() {
  const navigate = useNavigate()
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '')
  const [inputUserId, setInputUserId] = useState('')

  const { data: companies, isLoading, refetch } = useQuery({
    queryKey: ['companies', userId],
    queryFn: async () => {
      const data = await companyApi.getByUserId(userId)
      // Check if any company needs refresh (cache older than 5 minutes)
      const needsRefresh = data.some(c => {
        if (!c.lastFetched) return true
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
        return new Date(c.lastFetched).getTime() < fiveMinutesAgo
      })
      if (needsRefresh) {
        await companyApi.fetchByUserId(userId)
        return companyApi.getByUserId(userId)
      }
      return data
    },
    enabled: !!userId,
  })

  const fetchMutation = useMutation({
    mutationFn: (uid: string) => companyApi.fetchByUserId(uid),
    onSuccess: () => refetch(),
  })

  const handleSetUserId = () => {
    if (inputUserId) {
      localStorage.setItem('userId', inputUserId)
      setUserId(inputUserId)
      fetchMutation.mutate(inputUserId)
    }
  }

  if (!userId) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4 text-white">Enter User ID</h2>
          <input
            type="text"
            value={inputUserId}
            onChange={(e) => setInputUserId(e.target.value)}
            placeholder="Your User ID"
            className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded mb-4"
          />
          <button
            onClick={handleSetUserId}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Load Companies
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">My Companies</h2>
        <div className="flex gap-2">
          <button
            onClick={() => fetchMutation.mutate(userId)}
            disabled={fetchMutation.isPending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:bg-gray-600"
          >
            {fetchMutation.isPending ? 'Reloading...' : 'Reload'}
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('userId')
              setUserId('')
            }}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Change User
          </button>
        </div>
      </div>

      {isLoading && <div className="text-center py-8 text-gray-300">Loading...</div>}

      <div className="grid gap-4">
        {companies?.map(company => {
          const workers = company.workers || [];
          const wages = workers.map(w => w.wage);
          const minWage = wages.length > 0 ? Math.min(...wages) : 0;
          const maxWage = wages.length > 0 ? Math.max(...wages) : 0;
          const allSameWage = minWage === maxWage;
          
          return (
            <div
              key={company.companyId}
              onClick={() => navigate(`/company/${company.companyId}`)}
              className="bg-gray-800 rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img 
                    src={`/icons/${company.type}.png`} 
                    alt={ITEM_NAMES[company.type] || company.type} 
                    className="w-12 h-12"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white">{company.name}</h3>
                    <p className="text-gray-400">{ITEM_NAMES[company.type] || company.type} • {company.region}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Workers</p>
                  <p className="text-lg font-bold text-white">{workers.length}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-400">Wage/Worker</p>
                  <p className="font-semibold text-gray-200">
                    {workers.length === 0 ? 'No workers' : 
                     allSameWage ? `${minWage.toFixed(3)} €` : 
                     `${minWage.toFixed(3)} € - ${maxWage.toFixed(3)} €`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Current Production</p>
                  <p className="font-semibold text-gray-200">
                    {company.productionValue.toFixed(0)} / {company.maxProduction}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}
