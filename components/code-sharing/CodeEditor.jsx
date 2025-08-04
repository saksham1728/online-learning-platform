"use client"
import React, { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Save, Share2, Moon, Sun, Download, Copy, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

const PROGRAMMING_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', extension: 'js' },
  { value: 'typescript', label: 'TypeScript', extension: 'ts' },
  { value: 'python', label: 'Python', extension: 'py' },
  { value: 'java', label: 'Java', extension: 'java' },
  { value: 'cpp', label: 'C++', extension: 'cpp' },
  { value: 'c', label: 'C', extension: 'c' },
  { value: 'csharp', label: 'C#', extension: 'cs' },
  { value: 'php', label: 'PHP', extension: 'php' },
  { value: 'ruby', label: 'Ruby', extension: 'rb' },
  { value: 'go', label: 'Go', extension: 'go' },
  { value: 'rust', label: 'Rust', extension: 'rs' },
  { value: 'swift', label: 'Swift', extension: 'swift' },
  { value: 'kotlin', label: 'Kotlin', extension: 'kt' },
  { value: 'dart', label: 'Dart', extension: 'dart' },
  { value: 'html', label: 'HTML', extension: 'html' },
  { value: 'css', label: 'CSS', extension: 'css' },
  { value: 'scss', label: 'SCSS', extension: 'scss' },
  { value: 'json', label: 'JSON', extension: 'json' },
  { value: 'xml', label: 'XML', extension: 'xml' },
  { value: 'yaml', label: 'YAML', extension: 'yaml' },
  { value: 'sql', label: 'SQL', extension: 'sql' },
  { value: 'shell', label: 'Shell', extension: 'sh' },
  { value: 'dockerfile', label: 'Dockerfile', extension: 'dockerfile' },
  { value: 'markdown', label: 'Markdown', extension: 'md' }
];

const DEFAULT_CODE_TEMPLATES = {
  javascript: `// Welcome to the Code Sharing Portal!
// Write your JavaScript code here

function greetUser(name) {
    return \`Hello, \${name}! Welcome to our platform.\`;
}

console.log(greetUser("Developer"));`,
  
  python: `# Welcome to the Code Sharing Portal!
# Write your Python code here

def greet_user(name):
    return f"Hello, {name}! Welcome to our platform."

if __name__ == "__main__":
    print(greet_user("Developer"))`,
  
  java: `// Welcome to the Code Sharing Portal!
// Write your Java code here

public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, Developer! Welcome to our platform.");
    }
    
    public static String greetUser(String name) {
        return "Hello, " + name + "! Welcome to our platform.";
    }
}`,
  
  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Sharing Portal</title>
</head>
<body>
    <h1>Welcome to the Code Sharing Portal!</h1>
    <p>Start writing your HTML code here.</p>
</body>
</html>`
};

function CodeEditor({ 
  initialValue = '', 
  initialLanguage = 'javascript',
  onShare,
  readOnly = false,
  showToolbar = true,
  height = '600px',
  className = ''
}) {
  const [code, setCode] = useState(initialValue);
  const [language, setLanguage] = useState(initialLanguage);
  const [theme, setTheme] = useState('vs-dark');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const editorRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  // Auto-save functionality
  useEffect(() => {
    if (!readOnly && code !== initialValue) {
      setIsAutoSaving(true);
      
      // Clear previous timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout for auto-save
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveToLocalStorage();
        setIsAutoSaving(false);
        setLastSaved(new Date());
      }, 2000); // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [code, readOnly, initialValue]);

  // Load from localStorage on mount
  useEffect(() => {
    if (!readOnly && !initialValue) {
      const savedCode = localStorage.getItem('codeEditor_content');
      const savedLanguage = localStorage.getItem('codeEditor_language');
      const savedTheme = localStorage.getItem('codeEditor_theme');

      if (savedCode) {
        setCode(savedCode);
      } else if (DEFAULT_CODE_TEMPLATES[language]) {
        setCode(DEFAULT_CODE_TEMPLATES[language]);
      }

      if (savedLanguage) {
        setLanguage(savedLanguage);
      }

      if (savedTheme) {
        setTheme(savedTheme);
      }
    }
  }, [readOnly, initialValue, language]);

  const saveToLocalStorage = () => {
    if (!readOnly) {
      localStorage.setItem('codeEditor_content', code);
      localStorage.setItem('codeEditor_language', language);
      localStorage.setItem('codeEditor_theme', theme);
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyS, () => {
      if (onShare) onShare();
    });
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    
    // Save the new language to localStorage immediately
    if (!readOnly) {
      localStorage.setItem('codeEditor_language', newLanguage);
    }
    
    // If code is empty or is a template, load new template
    if (!code || Object.values(DEFAULT_CODE_TEMPLATES).includes(code)) {
      if (DEFAULT_CODE_TEMPLATES[newLanguage]) {
        setCode(DEFAULT_CODE_TEMPLATES[newLanguage]);
      } else {
        // If no template exists for the language, clear the code
        setCode('');
      }
    }
  };

  const handleSave = () => {
    saveToLocalStorage();
    setLastSaved(new Date());
    toast.success('Code saved locally!');
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Code copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const handleDownloadCode = () => {
    const languageInfo = PROGRAMMING_LANGUAGES.find(lang => lang.value === language);
    const extension = languageInfo?.extension || 'txt';
    const filename = `code.${extension}`;
    
    const blob = new Blob([code], { type: 'text/plain' });
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

  const handleReset = () => {
    if (DEFAULT_CODE_TEMPLATES[language]) {
      setCode(DEFAULT_CODE_TEMPLATES[language]);
      toast.success('Code reset to template');
    } else {
      setCode('');
      toast.success('Code cleared');
    }
  };

  const formatLastSaved = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {showToolbar && (
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center space-x-4">
            <Select value={language} onValueChange={handleLanguageChange} disabled={readOnly}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROGRAMMING_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
            >
              {theme === 'vs-dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {!readOnly && (
              <>
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>

                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </>
            )}

            <Button variant="outline" size="sm" onClick={handleCopyCode}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>

            <Button variant="outline" size="sm" onClick={handleDownloadCode}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            {!readOnly && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                {isAutoSaving && <Badge variant="secondary">Saving...</Badge>}
                {lastSaved && (
                  <span>Last saved: {formatLastSaved(lastSaved)}</span>
                )}
              </div>
            )}

            {onShare && (
              <Button onClick={onShare} className="bg-blue-600 hover:bg-blue-700">
                <Share2 className="h-4 w-4 mr-2" />
                Share Code
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1">
        <Editor
          height={height}
          language={language}
          value={code}
          onChange={(value) => !readOnly && setCode(value || '')}
          onMount={handleEditorDidMount}
          theme={theme}
          options={{
            readOnly,
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            contextmenu: true,
            selectOnLineNumbers: true,
            glyphMargin: true,
            folding: true,
            foldingHighlight: true,
            showFoldingControls: 'always',
            matchBrackets: 'always',
            autoIndent: 'full',
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            snippetSuggestions: 'top'
          }}
        />
      </div>
    </div>
  );
}

export default CodeEditor;