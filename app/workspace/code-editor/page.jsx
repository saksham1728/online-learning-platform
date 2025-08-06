"use client"
import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import CodeEditor from '../../../components/code-sharing/CodeEditor'
import CodeShareModal from '../../../components/code-sharing/CodeShareModal'

function CodeEditorPage() {
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('javascript');

  const handleShare = () => {
    // Get current code from localStorage or editor
    const savedCode = localStorage.getItem('codeEditor_content');
    const savedLanguage = localStorage.getItem('codeEditor_language');
    
    setCurrentCode(savedCode || '');
    setCurrentLanguage(savedLanguage || 'javascript');
    setShowShareModal(true);
  };

  const handleShareSuccess = (shareData) => {
    console.log('Code shared successfully:', shareData);
    // Could redirect to management page or show success message
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 p-4 border-b bg-white">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          <Link href="/workspace">
            <Button variant="outline" size="sm" className="w-fit">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold">Code Editor</h1>
            <p className="text-gray-600 text-sm">Write, edit, and share your code</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/workspace/code-management" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto text-sm">
              My Shared Codes
            </Button>
          </Link>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <CodeEditor
          onShare={handleShare}
          height="100%"
          className="h-full"
        />
      </div>

      {/* Share Modal */}
      <CodeShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        code={currentCode}
        language={currentLanguage}
        onShare={handleShareSuccess}
      />
    </div>
  );
}

export default CodeEditorPage;