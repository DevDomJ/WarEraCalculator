import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { analyticsApi } from '../api/client'

interface Props {
  companyId: string
  expectedPP: number
}

export default function ProductionTracker({ companyId, expectedPP }: Props) {
  const [actualPP, setActualPP] = useState('')
  const queryClient = useQueryClient()

  const trackMutation = useMutation({
    mutationFn: () => analyticsApi.trackProduction(companyId, parseFloat(actualPP), expectedPP),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', companyId] })
      setActualPP('')
    },
  })

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4 text-white">Track Today's Production</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Expected PP Today</label>
          <input
            type="text"
            value={expectedPP.toFixed(2)}
            disabled
            className="w-full px-4 py-2 border border-gray-600 rounded bg-gray-700 text-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Actual PP Achieved</label>
          <input
            type="number"
            step="0.01"
            value={actualPP}
            onChange={(e) => setActualPP(e.target.value)}
            placeholder="Enter actual production points"
            className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded"
          />
        </div>

        <button
          onClick={() => trackMutation.mutate()}
          disabled={!actualPP || trackMutation.isPending}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-600"
        >
          {trackMutation.isPending ? 'Tracking...' : 'Track Production'}
        </button>

        {trackMutation.isSuccess && (
          <p className="text-green-400 text-sm">Production tracked successfully!</p>
        )}
      </div>
    </div>
  )
}
