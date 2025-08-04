"use client"
import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { 
  MessageSquare, 
  Send, 
  User, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

function CommentSystem({ shareId, allowComments = true }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState({
    commenterName: '',
    commenterEmail: '',
    comment: ''
  });

  useEffect(() => {
    if (allowComments) {
      loadComments();
    }
  }, [shareId, allowComments]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/public/code/${shareId}/comment`);
      
      if (response.data.success) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error('Load comments error:', error);
      if (error.response?.status !== 403) {
        toast.error('Failed to load comments');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewComment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.commenterName.trim() || !newComment.comment.trim()) {
      toast.error('Name and comment are required');
      return;
    }

    if (newComment.comment.length > 1000) {
      toast.error('Comment must be less than 1000 characters');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`/api/public/code/${shareId}/comment`, {
        commenterName: newComment.commenterName.trim(),
        commenterEmail: newComment.commenterEmail.trim() || null,
        comment: newComment.comment.trim()
      });

      if (response.data.success) {
        toast.success('Comment submitted successfully! It will be visible after approval.');
        setNewComment({
          commenterName: '',
          commenterEmail: '',
          comment: ''
        });
        // Don't reload comments immediately since they need approval
      }
    } catch (error) {
      console.error('Submit comment error:', error);
      toast.error(error.response?.data?.error || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!allowComments) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Comments are disabled for this shared code.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Leave a Comment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="commenterName" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <Input
                  id="commenterName"
                  placeholder="Your name"
                  value={newComment.commenterName}
                  onChange={(e) => handleInputChange('commenterName', e.target.value)}
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <label htmlFor="commenterEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email (optional)
                </label>
                <Input
                  id="commenterEmail"
                  type="email"
                  placeholder="your.email@example.com"
                  value={newComment.commenterEmail}
                  onChange={(e) => handleInputChange('commenterEmail', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                Comment *
              </label>
              <Textarea
                id="comment"
                placeholder="Share your thoughts about this code..."
                value={newComment.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                maxLength={1000}
                rows={4}
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {newComment.comment.length}/1000 characters
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <AlertCircle className="h-4 w-4" />
                <span>Comments are moderated and will appear after approval</span>
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Comment
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Comments ({comments.length})</span>
            <Button variant="outline" size="sm" onClick={loadComments} disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                'Refresh'
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Comments Yet</h3>
              <p className="text-gray-500">Be the first to leave a comment on this code!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {comment.commenterName}
                        </h4>
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Approved</span>
                        </Badge>
                      </div>
                      <p className="text-gray-700 text-sm mb-2 whitespace-pre-wrap">
                        {comment.comment}
                      </p>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default CommentSystem;