"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  Eye, 
  Calendar, 
  Globe, 
  ExternalLink, 
  TrendingUp, 
  Users, 
  BarChart3,
  Download,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

function ShareAnalytics({ shareId, shareTitle, onClose }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    if (shareId) {
      loadAnalytics();
    }
  }, [shareId, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/code/share/${shareId}/analytics?days=${timeRange}`);
      
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Load analytics error:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    if (!analytics) return;

    const data = {
      shareId,
      shareTitle,
      timeRange: `${timeRange} days`,
      exportedAt: new Date().toISOString(),
      summary: analytics.summary,
      viewsByDate: analytics.viewsByDate,
      topCountries: analytics.topCountries,
      topReferrers: analytics.topReferrers,
      recentViews: analytics.recentViews
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${shareId}-${timeRange}days.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Analytics data exported successfully');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics</h2>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics</h2>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Analytics Data</h3>
              <p className="text-gray-500">Unable to load analytics for this shared code.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-gray-600">{shareTitle}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{analytics.summary.totalViews}</p>
                <p className="text-sm text-gray-600">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{analytics.summary.viewsInPeriod}</p>
                <p className="text-sm text-gray-600">Views in {timeRange} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{analytics.summary.uniqueCountries}</p>
                <p className="text-sm text-gray-600">Countries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{analytics.summary.averageViewsPerDay}</p>
                <p className="text-sm text-gray-600">Avg. Views/Day</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Views Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Views Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.viewsByDate.slice(-14).map((day, index) => (
              <div key={day.date} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{formatDate(day.date)}</span>
                <div className="flex items-center space-x-2">
                  <div 
                    className="bg-blue-500 h-2 rounded"
                    style={{ 
                      width: `${Math.max(day.views * 20, 4)}px`,
                      maxWidth: '200px'
                    }}
                  ></div>
                  <span className="text-sm font-medium w-8 text-right">{day.views}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Countries and Referrers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topCountries.length > 0 ? (
              <div className="space-y-3">
                {analytics.topCountries.map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">#{index + 1}</span>
                      <span className="text-sm">{country.country || 'Unknown'}</span>
                    </div>
                    <Badge variant="secondary">{country.views} views</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No country data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topReferrers.length > 0 ? (
              <div className="space-y-3">
                {analytics.topReferrers.map((referrer, index) => (
                  <div key={referrer.referrer} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">#{index + 1}</span>
                      <span className="text-sm">{referrer.referrer}</span>
                    </div>
                    <Badge variant="secondary">{referrer.views} views</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No referrer data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Views */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Views</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.recentViews.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentViews.map((view, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{formatDateTime(view.viewedAt)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {view.country && (
                      <Badge variant="outline" className="text-xs">{view.country}</Badge>
                    )}
                    <Badge variant="outline" className="text-xs">{view.referrer}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent views</p>
          )}
        </CardContent>
      </Card>

      {/* Summary Info */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Created:</span>
              <span className="ml-2 font-medium">
                {formatDateTime(analytics.summary.createdAt)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Last Viewed:</span>
              <span className="ml-2 font-medium">
                {analytics.summary.lastViewedAt 
                  ? formatDateTime(analytics.summary.lastViewedAt)
                  : 'Never'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ShareAnalytics;