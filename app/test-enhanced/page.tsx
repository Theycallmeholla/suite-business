'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function TestEnhancedPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testEnhancedFlow = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/sites/create-from-gbp-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: 'locations/15895741961692317638',
          isPlaceId: false,
          generateQuestionsOnly: true,
          industry: 'general'
        })
      })

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const testSimpleCreate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/sites/create-from-gbp-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: 'Cursive Media Test'
        })
      })

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Test Enhanced Flow</h1>
      
      <div className="space-y-4">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Test Enhanced Questions</h2>
          <Button onClick={testEnhancedFlow} disabled={loading}>
            {loading ? 'Testing...' : 'Test Enhanced Flow'}
          </Button>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Test Simple Create</h2>
          <Button onClick={testSimpleCreate} disabled={loading}>
            {loading ? 'Creating...' : 'Create Simple Site'}
          </Button>
        </Card>

        {error && (
          <Card className="p-4 bg-red-50">
            <h3 className="text-red-700 font-semibold">Error:</h3>
            <p className="text-red-600">{error}</p>
          </Card>
        )}

        {result && (
          <Card className="p-4">
            <h3 className="font-semibold">Result:</h3>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    </div>
  )
}
