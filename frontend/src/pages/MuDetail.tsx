import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { muApi, MuMember } from '../api/client'
import CurrencyValue from '../components/CurrencyValue'

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded ${color}`}>{label}</span>
  )
}

function MemberRow({ member }: { member: MuMember }) {
  return (
    <tr className={member.inactive ? 'bg-red-900/20' : ''}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {member.avatarUrl && <img src={member.avatarUrl} alt="" className="w-8 h-8 rounded-full" />}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{member.username ?? member.userId}</span>
              {member.isOwner && <Badge label="Owner" color="bg-yellow-600 text-yellow-100" />}
              {member.isCommander && !member.isOwner && <Badge label="Commander" color="bg-blue-600 text-blue-100" />}
            </div>
            {member.lastLoginAgo && (
              <span className={`text-xs ${member.inactive ? 'text-red-400 font-semibold' : 'text-gray-500'}`}>
                last login: {member.lastLoginAgo}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-gray-300 text-center">{member.level ?? '-'}</td>
      <td className="px-4 py-3 text-gray-300 text-center">{member.militaryRank ?? '-'}</td>
      <td className="px-4 py-3 text-gray-300 text-right">{member.totalDamage?.toLocaleString() ?? '-'}</td>
      <td className="px-4 py-3 text-gray-300 text-center">{member.attack ?? '-'}</td>
      <td className="px-4 py-3 text-gray-300 text-right">{member.donation > 0 ? <CurrencyValue value={member.donation} decimals={0} /> : '-'}</td>
    </tr>
  )
}

export default function MuDetail() {
  const { muId } = useParams<{ muId: string }>()

  const { data: mu, isLoading } = useQuery({
    queryKey: ['muDetail', muId],
    queryFn: () => muApi.getDetail(muId!),
    enabled: !!muId,
  })

  if (isLoading) return <div className="text-center py-8 text-gray-300">Loading...</div>
  if (!mu) return <div className="text-center py-8 text-red-400">MU not found.</div>

  const inactiveCount = mu.members.filter(m => m.inactive).length

  return (
    <div>
      <Link to="/mu" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">← Back to MUs</Link>

      <div className="flex items-center gap-4 mb-6">
        {mu.avatarUrl && <img src={mu.avatarUrl} alt={mu.name} className="w-16 h-16 rounded-full" />}
        <div>
          <h2 className="text-2xl font-bold text-white">{mu.name}</h2>
          <p className="text-gray-400">{mu.memberCount}/25 members</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400">HQ Level</p>
          <p className="text-2xl font-bold text-white">{mu.upgrades.headquarters}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400">Dormitories Level</p>
          <p className="text-2xl font-bold text-white">{mu.upgrades.dormitories}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400">Members</p>
          <p className="text-2xl font-bold text-white">{mu.memberCount}/25</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400">Inactive (48h+)</p>
          <p className={`text-2xl font-bold ${inactiveCount > 0 ? 'text-red-400' : 'text-green-400'}`}>{inactiveCount}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Member</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-400">Level</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-400">Mil. Rank</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">Total Damage</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-400">Attack</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">Donations (30d)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {mu.members.map(member => (
              <MemberRow key={member.userId} member={member} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
