"use client"
import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  Search, 
  Filter, 
  Copy, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  Code, 
  Share2,
  ExternalLink,
  MoreHorizontal,
  Plus,
  RefreshCw,
  BarChart3
} from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import Link from 'next/link'
import ShareAnalytics from './ShareAnalytics'

const LANGUAGES = [
  'all', 'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp', 
  'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'dart', 'html', 'css', 
  'scss', 'json', 'xml', 'yaml', 'sql', 'shell', 'dockerfile', 'markdown'
];

const CATEGORIES = [
  'all', 'web-development', 'mobile-development', 'data-science', 'machine-learning',
  'algorithms', 'backend', 'frontend', 'devops', 'database', 'api', 'tutorial',
  'snippet', 'project', 'homework', 'other'
];

function CodeManagement() {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedShares, setSelectedShares] = useState(new Set());
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedShareForAnalytics, setSelectedShareForAnalytics] = useState(null);

  useEffect(() => {
    loadShares();
  }, [currentPage, searchTerm, selectedLanguage, selectedCategory]);

  const loadShares = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedLanguage !== 'all') params.append('language', selectedLanguage);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);

      const response = await axios.get(`/api/code/my-shares?${params}`);
      
      if (response.data.success) {
        setShares(response.data.shares);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCount(response.data.pagination.totalCount);
      }
    } catch (error) {
      console.error('Load shares error:', error);
      toast.error('Failed to load shared codes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleLanguageFilter = (language) => {
    setSelectedLanguage(language);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleCopyLink = async (shareUrl) => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleDeleteShare = async (shareId, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`/api/code/share/${shareId}`);
      toast.success('Shared code deleted successfully');
      loadShares(); // Reload the list
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete shared code');
    }
  };

  const handleSelectShare = (shareId) => {
    const newSelected = new Set(selectedShares);
    if (newSelected.has(shareId)) {
      newSelected.delete(shareId);
    } else {
      newSelected.add(shareId);
    }
    setSelectedShares(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedShares.size === shares.length) {
      setSelectedShares(new Set());
    } else {
      setSelectedShares(new Set(shares.map(share => share.shareId)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedShares.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedShares.size} selected items? This action cannot be undone.`)) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedShares).map(shareId =>
        axios.delete(`/api/code/share/${shareId}`)
      );
      
      await Promise.all(deletePromises);
      toast.success(`${selectedShares.size} shared codes deleted successfully`);
      setSelectedShares(new Set());
      loadShares();
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete some shared codes');
    }
  };

  const handleShowAnalytics = (share) => {
    setSelectedShareForAnalytics(share);
    setShowAnalytics(true);
  };

  const handleCloseAnalytics = () => {
    setShowAnalytics(false);
    setSelectedShareForAnalytics(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatViewCount = (count) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  const getStatusBadge = (share) => {
    if (share.isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (share.isPasswordProtected) {
      return <Badge variant="secondary">Protected</Badge>;
    }
    if (!share.isPublic) {
      return <Badge variant="outline">Unlisted</Badge>;
    }
    return <Badge variant="default">Public</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Shared Codes</h1>
          <p className="text-gray-600">
            Manage and track your shared code snippets ({totalCount} total)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadShares} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/workspace/code-editor">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Code
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedLanguage} onValueChange={handleLanguageFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {LANGUAGES.slice(1).map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.slice(1).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedShares.size > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedShares.size} item{selectedShares.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedShares(new Set())}>
                  Clear Selection
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shares List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your shared codes...</p>
              </div>
            </CardContent>
          </Card>
        ) : shares.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Code className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Shared Codes</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedLanguage !== 'all' || selectedCategory !== 'all'
                    ? 'No codes match your current filters.'
                    : 'You haven\'t shared any code yet. Create your first shared code!'}
                </p>
                <Link href="/workspace/code-editor">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Share Your First Code
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          shares.map((share) => (
            <Card key={share.shareId} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedShares.has(share.shareId)}
                      onChange={() => handleSelectShare(share.shareId)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold truncate">{share.title}</h3>
                        {getStatusBadge(share)}
                        <Badge variant="outline">{share.language}</Badge>
                      </div>
                      
                      {share.description && (
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {share.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{formatViewCount(share.viewCount)} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Created {formatDate(share.createdAt)}</span>
                        </div>
                        {share.lastViewedAt && (
                          <div className="flex items-center space-x-1">
                            <span>Last viewed {formatDate(share.lastViewedAt)}</span>
                          </div>
                        )}
                      </div>

                      {share.tags && share.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {share.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {share.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{share.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(share.shareUrl)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    <Link href={share.shareUrl} target="_blank">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShowAnalytics(share)}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {/* TODO: Implement edit functionality */}}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteShare(share.shareId, share.title)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Select All Checkbox */}
      {shares.length > 0 && (
        <div className="fixed bottom-4 right-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="bg-white shadow-lg"
          >
            {selectedShares.size === shares.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && selectedShareForAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <ShareAnalytics
                shareId={selectedShareForAnalytics.shareId}
                shareTitle={selectedShareForAnalytics.title}
                onClose={handleCloseAnalytics}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CodeManagement;