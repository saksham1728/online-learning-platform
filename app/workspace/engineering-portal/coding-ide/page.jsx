"use client"
import React, { useState, useEffect } from 'react'
import { ArrowLeft, Play, Save, Download, Upload, Settings, Code, Terminal, FileText, Zap } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Badge } from '../../../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

function CodingIDE() {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const { user } = useUser()

  const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'cpp', label: 'C++', icon: '⚡' },
    { value: 'c', label: 'C', icon: '🔧' },
    { value: 'html', label: 'HTML', icon: '🌐' },
    { value: 'css', label: 'CSS', icon: '🎨' }
  ]

  const codeTemplates = {
    javascript: `// JavaScript Code
console.log("Hello, World!");

// Example: Calculate factorial
function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

console.log("Factorial of 5:", factorial(5));`,

    python: `# Python Code
print("Hello, World!")

# Example: Calculate factorial
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print("Factorial of 5:", factorial(5))`,

    java: `// Java Code
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

    cpp: `// C++ Code
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

    c: `// C Code
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

    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello World</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>Welcome to the Coding IDE!</p>
    
    <script>
        console.log("JavaScript is working!");
    </script>
</body>
</html>`,

    css: `/* CSS Code */
body {
    font-family: Arial, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin: 0;
    padding: 20px;
    color: white;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
}

h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}`
  }

  const sampleProblems = [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
    },
    {
      id: 2,
      title: "Reverse String",
      difficulty: "Easy",
      description: "Write a function that reverses a string."
    },
    {
      id: 3,
      title: "Binary Search",
      difficulty: "Medium",
      description: "Given a sorted array, search for a target value."
    }
  ]

  useEffect(() => {
    setCode(codeTemplates[selectedLanguage] || '')
  }, [selectedLanguage])

  const runCode = async () => {
    setIsRunning(true)
    setOutput('Running code...')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      let mockOutput = ''
      switch (selectedLanguage) {
        case 'javascript':
        case 'python':
          mockOutput = `Hello, World!\nFactorial of 5: 120`
          break
        case 'java':
        case 'cpp':
        case 'c':
          mockOutput = `Hello, World!\nFactorial of 5: 120`
          break
        case 'html':
          mockOutput = `HTML rendered successfully!`
          break
        case 'css':
          mockOutput = `CSS compiled successfully!`
          break
        default:
          mockOutput = `Code executed successfully!`
      }
      
      setOutput(mockOutput)
      toast.success('Code executed successfully!')
    } catch (error) {
      setOutput(`Error: ${error.message}`)
      toast.error('Code execution failed!')
    } finally {
      setIsRunning(false)
    }
  }

  const saveCode = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `code.${selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'javascript' ? 'js' : selectedLanguage}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Code saved successfully!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/workspace/engineering-portal/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Coding IDE</h1>
            <p className="text-gray-600">Online code editor with multi-language support</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => (
                <SelectItem key={lang.value} value={lang.value}>
                  <span className="flex items-center space-x-2">
                    <span>{lang.icon}</span>
                    <span>{lang.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* IDE Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Code Editor */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5" />
                  <span>Code Editor</span>
                  <Badge variant="outline">
                    {languages.find(l => l.value === selectedLanguage)?.label}
                  </Badge>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={saveCode}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={runCode}
                    disabled={isRunning}
                  >
                    {isRunning ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Code
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 p-4 font-mono text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write your code here..."
                style={{
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
                }}
              />
            </CardContent>
          </Card>

          {/* Output */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Terminal className="h-5 w-5" />
                <span>Output</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="w-full h-32 p-4 font-mono text-sm border rounded-lg bg-black text-green-400 overflow-auto"
              >
                {output || 'Output will appear here...'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Practice Problems */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Practice Problems</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sampleProblems.map(problem => (
                <div key={problem.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{problem.title}</h4>
                    <Badge 
                      variant={problem.difficulty === 'Easy' ? 'default' : problem.difficulty === 'Medium' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {problem.difficulty}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {problem.description}
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs"
                  >
                    Load Problem
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" variant="outline" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Download Code
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                New File
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CodingIDE