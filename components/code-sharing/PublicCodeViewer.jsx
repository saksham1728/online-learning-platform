"use client"
import React, { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { 
  Copy, 
  Download, 
  Calendar, 
  Tag, 
  Share2, 
  Moon, 
  Sun,
  Lock,
  GitFork,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import CommentSystem from './CommentSystem'

function PublicCodeViewer({ shareId, embedded = false }) {
  const [codeData, setCodeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('vs-dark');
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  useEffect(() => {
    loadCodeData();
  }, [shareId]);

  const loadCodeData = async (passwordAttempt = null) => {
    try {
      setLoading(true);
      setError(null);

      const url = `/api/public/code/${shareId}${passwordAttempt ? `?password=${encodeURIComponent(passwordAttempt)}` : ''}`;
      
      const { data } = await axios.get(url);
      
      if (data.success) {
        setCodeData(data.code);
        setShowPasswordInput(false);
      } else {
        setError({ title: 'Error', message: data.message || data.error });
      }
      
    } catch (error) {
      console.error('Load code error:', error);
      
      if (error.response?.status === 401 && error.response?.data?.requiresPassword) {
        setShowPasswordInput(true);
        setError(null);
      } else if (error.response?.status === 404) {
        setError({
          title: 'Code Not Found',
          message: 'This shared code does not exist or has been removed.',
          icon: <AlertCircle className="h-16 w-16 text-gray-400" />
        });
      } else if (error.response?.status === 410) {
        setError({
          title: 'Code Expired',
          message: 'This shared code has expired and is no longer available.',
          icon: <Calendar className="h-16 w-16 text-gray-400" />
        });
      } else {
        setError({
          title: 'Error Loading Code',
          message: error.response?.data?.message || 'Something went wrong while loading the code.',
          icon: <AlertCircle className="h-16 w-16 text-red-400" />
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error('Please enter a password');
      return;
    }

    setVerifyingPassword(true);
    try {
      await loadCodeData(password);
      setPassword('');
    } catch (error) {
      toast.error('Invalid password');
    } finally {
      setVerifyingPassword(false);
    }
  };

  const handleCopyCode = async () => {
    if (!codeData?.code) return;
    
    try {
      await navigator.clipboard.writeText(codeData.code);
      toast.success('Code copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const handleDownloadCode = () => {
    if (!codeData?.code) return;

    const languageExtensions = {
      javascript: 'js', typescript: 'ts', python: 'py', java: 'java',
      cpp: 'cpp', c: 'c', csharp: 'cs', php: 'php', ruby: 'rb',
      go: 'go', rust: 'rs', swift: 'swift', kotlin: 'kt', dart: 'dart',
      html: 'html', css: 'css', scss: 'scss', json: 'json', xml: 'xml',
      yaml: 'yaml', sql: 'sql', shell: 'sh', dockerfile: 'dockerfile',
      markdown: 'md'
    };

    const extension = languageExtensions[codeData.language] || 'txt';
    const filename = `${codeData.title.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;
    
    const blob = new Blob([codeData.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Code downloaded as ${filename}`);
  };

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy share link');
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



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading shared code...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              {error.icon}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{error.title}</h3>
                <p className="text-gray-600">{error.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showPasswordInput) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>Password Protected</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <p className="text-gray-600 text-sm">
                This shared code is password protected. Please enter the password to view it.
              </p>
              <Input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={verifyingPassword}
              />
              <Button 
                type="submit" 
                className="w-full" 
                disabled={verifyingPassword || !password.trim()}
              >
                {verifyingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  'Access Code'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!codeData) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${embedded ? 'p-0' : 'p-4'}`}>
      <div className={`mx-auto ${embedded ? 'max-w-full' : 'max-w-6xl'}`}>
        {!embedded && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{codeData.title}</CardTitle>
                    {codeData.description && (
                      <p className="text-gray-600">{codeData.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
                    >
                      {theme === 'vs-dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShareLink}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Badge variant="secondary">{codeData.language}</Badge>
                  </div>
                  
                  {codeData.category && (
                    <div className="flex items-center space-x-1">
                      <Tag className="h-4 w-4" />
                      <span className="capitalize">{codeData.category.replace('-', ' ')}</span>
                    </div>
                  )}
                  

                  
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Created {formatDate(codeData.createdAt)}</span>
                  </div>
                </div>

                {codeData.tags && codeData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {codeData.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Code</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleCopyCode}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadCode}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                {codeData.allowForking && (
                  <Button variant="outline" size="sm">
                    <GitFork className="h-4 w-4 mr-2" />
                    Fork
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border rounded-lg overflow-hidden">
              <Editor
                height="600px"
                language={codeData.language}
                value={codeData.code}
                theme={theme}
                options={{
                  readOnly: true,
                  minimap: { enabled: true },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  contextmenu: false,
                  selectOnLineNumbers: true,
                  glyphMargin: false,
                  folding: true,
                  foldingHighlight: true,
                  showFoldingControls: 'mouseover',
                  matchBrackets: 'always'
                }}
              />
            </div>
          </CardContent>
        </Card>

        {!embedded && (
          <div className="mt-6">
            <CommentSystem 
              shareId={shareId} 
              allowComments={codeData.allowComments} 
            />
          </div>
        )}

        {!embedded && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Powered by{' '}
              <a href="/" className="text-blue-600 hover:underline">
                Code Sharing Portal
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicCodeViewer;