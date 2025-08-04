"use client"
import React, { useState, useEffect } from 'react'
import { ArrowLeft, Search, Filter, Eye, Share2, Trash2, Calendar, Code, Lock, Globe, Copy } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import { toast } from 'sonner'

function CodeManagement() {
  const [sharedCodes, setSharedCodes] = useState([])
  const [filteredCodes, setFilteredCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [deletingCode, setDeletingCode] = useState({})
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      loadSharedCodes()
    }
  }, [user])

  useEffect(() => {
    filterCodes()
  }, [sharedCodes, searchTerm, selectedLanguage, selectedCategory])

  const loadSharedCodes = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/user/shared-codes')
      
      if (response.data.success) {
        setSharedCodes(response.data.sharedCodes)
      } else {
        toast.error('Failed to load shared codes')
      }
    } catch (error) {
      console.error('Failed to load shared codes:', error)
      toast.error('Failed to load shared codes')
    } finally {
      setLoading(false)
    }
  }

  const filterCodes = () => {
    let filtered = sharedCodes

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(code => 
        code.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.language.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Language filter
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(code => code.language === selectedLanguage)
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(code => code.category === selectedCategory)
    }

    setFilteredCodes(filtered)
  }

  const handleView = (code) => {
    window.open(code.shareUrl, '_blank')
  }

  const handleCopyLink = async (code) => {
    try {
      const fullUrl = `${window.location.origin}${code.shareUrl}`
      await navigator.clipboard.writeText(fullUrl)
      toast.success('Share link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleDelete = async (code) => {
    if (!confirm(`Are you sure you want to delete "${code.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingCode(prev => ({ ...prev, [code.id]: true }))
      
      const response = await axios.delete(`/api/user/shared-codes?shareId=${code.shareId}`)
      
      if (response.data.success) {
        toast.success('Shared code deleted successfully')
        setSharedCodes(prev => prev.filter(c => c.id !== code.id))
      } else {
        toast.error('Failed to delete shared code')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete shared code')
    } finally {
      setDeletingCode(prev => ({ ...prev, [code.id]: false }))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getVisibilityIcon = (code) => {
    if (code.isPasswordProtected) {
      return <Lock className="h-4 w-4 text-orange-500" />
    }
    return code.isPublic ? 
      <Globe className="h-4 w-4 text-green-500" /> : 
      <Lock className="h-4 w-4 text-red-500" />
  }

  const getVisibilityText = (code) => {
    if (code.isPasswordProtected) return 'Password Protected'
    return code.isPublic ? 'Public' : 'Private'
  }

  // Get unique values for filters
  const availableLanguages = [...new Set(sharedCodes.map(c => c.language))]
  const availableCategories = [...new Set(sharedCodes.map(c => c.category).filter(Boolean))]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading your shared codes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/workspace">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">My Shared Codes</h1>
            <p className="text-gray-600">
              Manage and track your shared code snippets ({sharedCodes.length} total)
            </p>
          </div>
        </div>
        <Link href="/workspace/code-editor">
          <Button>
            <Code className="h-4 w-4 mr-2" />
            Create New Code
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {availableLanguages.map(language => (
                  <SelectItem key={language} value={language}>{language}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('')
              setSelectedLanguage('all')
              setSelectedCategory('all')
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCodes.map((code) => (
          <Card key={code.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{code.title}</CardTitle>
                  {code.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {code.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline">{code.language}</Badge>
                    {code.category && (
                      <Badge variant="secondary">{code.category}</Badge>
                    )}
                  </div>
                </div>
                <Code className="h-8 w-8 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  {getVisibilityIcon(code)}
                  <span>{getVisibilityText(code)}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(code.createdAt)}</span>
                </div>
              </div>

              {code.tags && code.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {code.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {code.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{code.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleView(code)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleCopyLink(code)}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>

              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => handleDelete(code)}
                className="w-full"
                disabled={deletingCode[code.id]}
              >
                {deletingCode[code.id] ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCodes.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Share2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {sharedCodes.length === 0 ? 'No Shared Codes Yet' : 'No Codes Found'}
              </h3>
              <p className="text-gray-500 mb-4">
                {sharedCodes.length === 0 
                  ? 'Start sharing your code snippets with others!'
                  : 'Try adjusting your filters to see more results.'
                }
              </p>
              {sharedCodes.length === 0 ? (
                <Link href="/workspace/code-editor">
                  <Button>
                    <Code className="h-4 w-4 mr-2" />
                    Create Your First Code
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" onClick={() => {
                  setSearchTerm('')
                  setSelectedLanguage('all')
                  setSelectedCategory('all')
                }}>
                  Clear All Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CodeManagement