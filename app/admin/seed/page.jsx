"use client"
import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'

export default function SeedPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleSeed = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/seed-notes', {
        method: 'POST'
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Database Seeding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Click the button below to seed the notes database with sample data.</p>
          
          <Button 
            onClick={handleSeed} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Seeding...' : 'Seed Notes Database'}
          </Button>

          {result && (
            <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h3 className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? '✅ Success!' : '❌ Error'}
              </h3>
              <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                {result.message || result.error}
              </p>
              {result.results && (
                <div className="mt-2 space-y-1">
                  {result.results.map((item, index) => (
                    <div key={index} className="text-sm">
                      <span className={item.success ? 'text-green-600' : 'text-red-600'}>
                        {item.success ? '✅' : '❌'} {item.title}: {item.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}