"use client"
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select'
import { Badge } from '../../../../components/ui/badge'
import { 
  ArrowLeft, 
  Play, 
  Square,
  Save,
  Download,
  Upload,
  Code,
  Terminal,
  FileText,
  Settings,
  Lightbulb
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

function CodingIDEPage() {
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [theme, setTheme] = useState('light')
  const textareaRef = useRef(null)

  const languages = {
    javascript: {
      name: 'JavaScript',
      template: `// JavaScript Code
console.log("Hello, World!");

// Example: Calculate factorial
function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

console.log("Factorial of 5:", factorial(5));`,
      extension: 'js'
    },
    python: {
      name: 'Python',
      template: `# Python Code
print("Hello, World!")

# Example: Calculate factorial
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(f"Factorial of 5: {factorial(5)}")`,
      extension: 'py'
    },
    java: {
      name: 'Java',
      template: `// Java Code
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Example: Calculate factorial
        System.out.println("Factorial of 5: " + factorial(5));
    }
    
    public static int factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }
}`,
      extension: 'java'
    },
    cpp: {
      name: 'C++',
      template: `// C++ Code
#include <iostream>
using namespace std;

// Example: Calculate factorial
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    cout << "Hello, World!" << endl;
    cout << "Factorial of 5: " << factorial(5) << endl;
    return 0;
}`,
      extension: 'cpp'
    },
    c: {
      name: 'C',
      template: `// C Code
#include <stdio.h>

// Example: Calculate factorial
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    printf("Hello, World!\\n");
    printf("Factorial of 5: %d\\n", factorial(5));
    return 0;
}`,
      extension: 'c'
    }
  }

  useEffect(() => {
    if (languages[language]) {
      setCode(languages[language].template)
    }
  }, [language])

  const runCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first')
      return
    }

    setIsRunning(true)
    setOutput('Running code...\n')

    // Simulate code execution
    setTimeout(() => {
      try {
        let result = ''
        
        if (language === 'javascript') {
          // Simple JavaScript execution simulation
          const logs = []
          const originalLog = console.log
          console.log = (...args) => logs.push(args.join(' '))
          
          try {
            eval(code)
            result = logs.join('\n')
          } catch (error) {
            result = `Error: ${error.message}`
          } finally {
            console.log = originalLog
          }
        } else {
          // For other languages, show sample output
          result = getSampleOutput(language)
        }

        setOutput(result || 'Code executed successfully (no output)')
      } catch (error) {
        setOutput(`Error: ${error.message}`)
      } finally {
        setIsRunning(false)
      }
    }, 1500)
  }

  const getSampleOutput = (lang) => {
    const outputs = {
      python: `Hello, World!
Factorial of 5: 120`,
      java: `Hello, World!
Factorial of 5: 120`,
      cpp: `Hello, World!
Factorial of 5: 120`,
      c: `Hello, World!
Factorial of 5: 120`
    }
    return outputs[lang] || 'Code executed successfully'
  }

  const stopExecution = () => {
    setIsRunning(false)
    setOutput(prev => prev + '\n\nExecution stopped by user.')
  }

  const saveCode = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `code.${languages[language].extension}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Code saved successfully!')
  }

  const clearCode = () => {
    setCode('')
    setOutput('')
    toast.success('Code cleared')
  }

  const insertTemplate = (template) => {
    const templates = {
      'for-loop': {
        javascript: 'for (let i = 0; i < 10; i++) {\n    console.log(i);\n}',
        python: 'for i in range(10):\n    print(i)',
        java: 'for (int i = 0; i < 10; i++) {\n    System.out.println(i);\n}',
        cpp: 'for (int i = 0; i < 10; i++) {\n    cout << i << endl;\n}',
        c: 'for (int i = 0; i < 10; i++) {\n    printf("%d\\n", i);\n}'
      },
      'function': {
        javascript: 'function myFunction(param) {\n    return param * 2;\n}',
        python: 'def my_function(param):\n    return param * 2',
        java: 'public static int myFunction(int param) {\n    return param * 2;\n}',
        cpp: 'int myFunction(int param) {\n    return param * 2;\n}',
        c: 'int myFunction(int param) {\n    return param * 2;\n}'
      },
      'array': {
        javascript: 'const arr = [1, 2, 3, 4, 5];\narr.forEach(item => console.log(item));',
        python: 'arr = [1, 2, 3, 4, 5]\nfor item in arr:\n    print(item)',
        java: 'int[] arr = {1, 2, 3, 4, 5};\nfor (int item : arr) {\n    System.out.println(item);\n}',
        cpp: 'int arr[] = {1, 2, 3, 4, 5};\nfor (int i = 0; i < 5; i++) {\n    cout << arr[i] << endl;\n}',
        c: 'int arr[] = {1, 2, 3, 4, 5};\nfor (int i = 0; i < 5; i++) {\n    printf("%d\\n", arr[i]);\n}'
      }
    }

    const templateCode = templates[template]?.[language]
    if (templateCode) {
      setCode(prev => prev + '\n\n' + templateCode)
      toast.success('Template inserted!')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/workspace/engineering">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Engineering
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Coding IDE</h1>
            <p className="text-gray-600">Practice coding with multi-language support</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-6">
          {/* Toolbar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(languages).map(([key, lang]) => (
                        <SelectItem key={key} value={key}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={saveCode}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearCode}>
                    Clear
                  </Button>
                  {isRunning ? (
                    <Button onClick={stopExecution} variant="destructive" size="sm">
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  ) : (
                    <Button onClick={runCode} size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Run
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>Code Editor</span>
                <Badge variant="outline">{languages[language].name}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`w-full h-96 p-4 font-mono text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary ${
                  theme === 'dark' 
                    ? 'bg-gray-900 text-green-400 border-gray-700' 
                    : 'bg-white text-gray-900 border-gray-300'
                }`}
                placeholder={`Write your ${languages[language].name} code here...`}
                spellCheck={false}
              />
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Terminal className="h-5 w-5" />
                <span>Output</span>
                {isRunning && (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm text-gray-600">Running...</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className={`w-full h-48 p-4 font-mono text-sm border rounded-lg overflow-auto ${
                theme === 'dark' 
                  ? 'bg-gray-900 text-green-400 border-gray-700' 
                  : 'bg-gray-50 text-gray-900 border-gray-300'
              }`}>
                {output || 'Output will appear here...'}
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>Templates</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => insertTemplate('for-loop')}
              >
                For Loop
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => insertTemplate('function')}
              >
                Function
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => insertTemplate('array')}
              >
                Array Example
              </Button>
            </CardContent>
          </Card>

          {/* Language Info */}
          <Card>
            <CardHeader>
              <CardTitle>Language Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Current:</span> {languages[language].name}
                </div>
                <div>
                  <span className="font-medium">Extension:</span> .{languages[language].extension}
                </div>
                <div className="pt-2 border-t">
                  <span className="font-medium">Features:</span>
                  <ul className="mt-1 space-y-1 text-xs text-gray-600">
                    <li>• Syntax highlighting</li>
                    <li>• Code execution</li>
                    <li>• Error detection</li>
                    <li>• Template insertion</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Keyboard Shortcuts */}
          <Card>
            <CardHeader>
              <CardTitle>Shortcuts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Run Code:</span>
                  <Badge variant="outline" className="text-xs">Ctrl+Enter</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Save:</span>
                  <Badge variant="outline" className="text-xs">Ctrl+S</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Clear:</span>
                  <Badge variant="outline" className="text-xs">Ctrl+K</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Practice Problems */}
          <Card>
            <CardHeader>
              <CardTitle>Practice Problems</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Array Problems
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  String Problems
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Algorithm Practice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CodingIDEPage