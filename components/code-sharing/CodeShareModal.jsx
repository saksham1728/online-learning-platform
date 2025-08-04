"use client"
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Share2, Copy, Eye, EyeOff, Calendar, Tag, Lock, MessageSquare, GitFork, Globe, Users, X } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

const CATEGORIES = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'machine-learning', label: 'Machine Learning' },
  { value: 'algorithms', label: 'Algorithms' },
  { value: 'backend', label: 'Backend' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'devops', label: 'DevOps' },
  { value: 'database', label: 'Database' },
  { value: 'api', label: 'API' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'snippet', label: 'Code Snippet' },
  { value: 'project', label: 'Full Project' },
  { value: 'homework', label: 'Homework/Assignment' },
  { value: 'other', label: 'Other' }
];

const EXPIRATION_OPTIONS = [
  { value: null, label: 'Never expires', description: 'Link will be active forever' },
  { value: 24, label: '24 hours', description: 'Link expires in 1 day' },
  { value: 168, label: '7 days', description: 'Link expires in 1 week' },
  { value: 720, label: '30 days', description: 'Link expires in 1 month' },
  { value: 2160, label: '90 days', description: 'Link expires in 3 months' }
];

function CodeShareModal({ 
  isOpen, 
  onClose, 
  code, 
  language, 
  onShare,
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'snippet',
    tags: [],
    isPublic: true,
    expirationHours: null,
    allowComments: true,
    allowForking: true,
    password: '',
    confirmPassword: ''
  });

  const [currentTag, setCurrentTag] = useState('');
  const [shareResult, setShareResult] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        category: 'snippet',
        tags: [],
        isPublic: true,
        expirationHours: null,
        allowComments: true,
        allowForking: true,
        password: '',
        confirmPassword: ''
      });
      setShareResult(null);
      setActiveTab('basic');
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const calculateExpirationDate = (hours) => {
    if (!hours) return null;
    const now = new Date();
    now.setHours(now.getHours() + hours);
    return now.toISOString();
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title for your code');
      return false;
    }

    if (formData.title.length > 200) {
      toast.error('Title must be less than 200 characters');
      return false;
    }

    if (formData.description && formData.description.length > 1000) {
      toast.error('Description must be less than 1000 characters');
      return false;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    if (formData.password && formData.password.length < 4) {
      toast.error('Password must be at least 4 characters long');
      return false;
    }

    return true;
  };

  const handleShare = async () => {
    if (!validateForm()) return;

    setIsSharing(true);
    try {
      const shareData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        code,
        language,
        category: formData.category,
        tags: formData.tags,
        isPublic: formData.isPublic,
        expiresAt: calculateExpirationDate(formData.expirationHours),
        allowComments: formData.allowComments,
        allowForking: formData.allowForking,
        password: formData.password || null
      };

      const response = await axios.post('/api/code/share', shareData);
      
      if (response.data.success) {
        setShareResult({
          shareId: response.data.shareId,
          shareUrl: response.data.shareUrl
        });
        setActiveTab('result');
        toast.success('Code shared successfully!');
        
        if (onShare) {
          onShare(response.data);
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error(error.response?.data?.error || 'Failed to share code');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareResult?.shareUrl) {
      try {
        await navigator.clipboard.writeText(shareResult.shareUrl);
        toast.success('Share link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const getExpirationLabel = () => {
    const option = EXPIRATION_OPTIONS.find(opt => opt.value === formData.expirationHours);
    return option ? option.label : 'Never expires';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Share Your Code</span>
          </DialogTitle>
          <DialogDescription>
            Configure how you want to share your {language} code with others
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="result" disabled={!shareResult}>Share Link</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Give your code a descriptive title..."
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                maxLength={200}
              />
              <div className="text-xs text-gray-500">
                {formData.title.length}/200 characters
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what your code does, how to use it, or any important notes..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                maxLength={1000}
                rows={3}
              />
              <div className="text-xs text-gray-500">
                {formData.description.length}/1000 characters
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                  <Badge variant="secondary">{language}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex space-x-2">
                <Input
                  id="tags"
                  placeholder="Add tags to help others find your code..."
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>Visibility</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Public Access</Label>
                    <p className="text-xs text-gray-500">
                      Anyone with the link can view your code
                    </p>
                  </div>
                  <Switch
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Expiration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={formData.expirationHours?.toString() || 'null'} 
                  onValueChange={(value) => handleInputChange('expirationHours', value === 'null' ? null : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPIRATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value || 'null'} value={option.value?.toString() || 'null'}>
                        <div>
                          <div>{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Password Protection</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password (optional)</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password to protect your code..."
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {formData.password && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm your password..."
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Interaction</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Allow Comments</span>
                    </Label>
                    <p className="text-xs text-gray-500">
                      Let others leave feedback on your code
                    </p>
                  </div>
                  <Switch
                    checked={formData.allowComments}
                    onCheckedChange={(checked) => handleInputChange('allowComments', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center space-x-2">
                      <GitFork className="h-4 w-4" />
                      <span>Allow Forking</span>
                    </Label>
                    <p className="text-xs text-gray-500">
                      Allow others to copy and modify your code
                    </p>
                  </div>
                  <Switch
                    checked={formData.allowForking}
                    onCheckedChange={(checked) => handleInputChange('allowForking', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="result" className="space-y-4">
            {shareResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-green-600">🎉 Code Shared Successfully!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Share Link</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={shareResult.shareUrl}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button onClick={handleCopyLink} variant="outline">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-gray-500">Share ID</Label>
                      <p className="font-mono">{shareResult.shareId}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Expires</Label>
                      <p>{getExpirationLabel()}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Your code is now accessible via the share link. Anyone with this link can view your code
                      {formData.password && ' after entering the password'}.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onClose}>
            {shareResult ? 'Close' : 'Cancel'}
          </Button>
          
          {!shareResult && (
            <Button 
              onClick={handleShare} 
              disabled={isSharing || !formData.title.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSharing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sharing...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Code
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CodeShareModal;