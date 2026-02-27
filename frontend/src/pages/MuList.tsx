import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { muApi, MuSummary } from '../api/client'

function MuCard({ mu }: { mu: MuSummary }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(`/mu/${mu.id}`)}
      className="bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer flex items-center gap-4"
    >
      {mu.avatarUrl && <img src={mu.avatarUrl} alt={mu.name} className="w-12 h-12 rounded-full" />}
      <div className="flex-1">
        <h3 className="text-lg font-bold text-white">{mu.name}</h3>
        <p className="text-sm text-gray-400">{mu.memberCount}/25 members</p>
      </div>
    </div>
  )
}

export default function MuList() {
  const userId = localStorage.getItem('userId') || ''

  const { data, isLoading } = useQuery({
    queryKey: ['userMus', userId],
    queryFn: () => muApi.getUserMus(userId),
    enabled: !!userId,
  })

  if (!userId) {
    return (
      <div className="text-center py-8 text-gray-400">
        Set your User ID on the <a href="/companies" className="text-blue-400 hover:text-blue-300">Companies</a> page first.
      </div>
    )
  }

  if (isLoading) return <div className="text-center py-8 text-gray-300">Loading...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Military Units</h2>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-3">My MU</h3>
        {data?.memberOf ? (
          <MuCard mu={data.memberOf} />
        ) : (
          <p className="text-gray-500">Not a member of any MU.</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-300 mb-3">Owned MUs</h3>
        {data?.owned?.length ? (
          <div className="grid gap-3">
            {data.owned.map(mu => <MuCard key={mu.id} mu={mu} />)}
          </div>
        ) : (
          <p className="text-gray-500">No owned MUs.</p>
        )}
      </div>
    </div>
  )
}
