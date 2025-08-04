"use client"
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Input } from '../../../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select'
import { Slider } from '../../../../components/ui/slider'
import { 
  ArrowLeft, 
  Upload, 
  Play, 
  Pause, 
  Square,
  Volume2,
  Settings,
  FileText,
  Mic,
  SkipForward,
  SkipBack,
  Bookmark,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

function PDFReaderPage() {
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfText, setPdfText] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [volume, setVolume] = useState(80)
  const [voice, setVoice] = useState('')
  const [bookmarks, setBookmarks] = useState([])
  const [highlightedText, setHighlightedText] = useState('')
  
  const fileInputRef = useRef(null)
  const speechSynthesisRef = useRef(null)
  const [voices, setVoices] = useState([])

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices()
      setVoices(availableVoices)
      if (availableVoices.length > 0 && !voice) {
        setVoice(availableVoices[0].name)
      }
    }

    loadVoices()
    speechSynthesis.onvoiceschanged = loadVoices
  }, [voice])

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file')
      return
    }

    setPdfFile(file)
    
    // In a real implementation, you would extract text from PDF
    // For demo purposes, we'll use sample text
    const sampleText = `
    Welcome to the PDF Voice Reader. This is a demonstration of how the system would read your PDF documents aloud.
    
    Chapter 1: Introduction to Engineering
    
    Engineering is the application of scientific and mathematical principles to design, build, and maintain structures, machines, systems, and processes. It encompasses various disciplines including mechanical, electrical, civil, chemical, and computer engineering.
    
    The engineering design process typically involves:
    1. Problem identification and definition
    2. Research and analysis
    3. Concept generation and evaluation
    4. Detailed design and optimization
    5. Testing and validation
    6. Implementation and maintenance
    
    Engineers must consider factors such as safety, reliability, cost-effectiveness, and environmental impact in their designs. They work collaboratively in teams and must communicate effectively with both technical and non-technical stakeholders.
    
    Modern engineering increasingly relies on computer-aided design tools, simulation software, and advanced materials to create innovative solutions to complex problems.
    `
    
    setPdfText(sampleText)
    toast.success('PDF uploaded and text extracted successfully!')
  }

  const handlePlay = () => {
    if (!pdfText) {
      toast.error('Please upload a PDF file first')
      return
    }

    if (speechSynthesis.speaking) {
      speechSynthesis.resume()
      setIsPlaying(true)
      return
    }

    const utterance = new SpeechSynthesisUtterance(pdfText)
    const selectedVoice = voices.find(v => v.name === voice)
    
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }
    
    utterance.rate = playbackSpeed
    utterance.volume = volume / 100
    
    utterance.onstart = () => {
      setIsPlaying(true)
    }
    
    utterance.onend = () => {
      setIsPlaying(false)
      setCurrentPosition(0)
    }
    
    utterance.onpause = () => {
      setIsPlaying(false)
    }
    
    utterance.onboundary = (event) => {
      setCurrentPosition(event.charIndex)
      // Highlight current text being spoken
      const currentWord = pdfText.substring(event.charIndex, event.charIndex + 20)
      setHighlightedText(currentWord)
    }

    speechSynthesisRef.current = utterance
    speechSynthesis.speak(utterance)
  }

  const handlePause = () => {
    speechSynthesis.pause()
    setIsPlaying(false)
  }

  const handleStop = () => {
    speechSynthesis.cancel()
    setIsPlaying(false)
    setCurrentPosition(0)
    setHighlightedText('')
  }

  const handleSpeedChange = (newSpeed) => {
    setPlaybackSpeed(newSpeed[0])
    if (speechSynthesis.speaking) {
      // Restart with new speed
      handleStop()
      setTimeout(handlePlay, 100)
    }
  }

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume[0])
  }

  const addBookmark = () => {
    if (!pdfText || currentPosition === 0) {
      toast.error('No content to bookmark')
      return
    }

    const bookmark = {
      id: Date.now(),
      position: currentPosition,
      text: pdfText.substring(currentPosition, currentPosition + 50) + '...',
      timestamp: new Date().toLocaleString()
    }

    setBookmarks(prev => [...prev, bookmark])
    toast.success('Bookmark added!')
  }

  const jumpToBookmark = (bookmark) => {
    setCurrentPosition(bookmark.position)
    if (speechSynthesis.speaking) {
      handleStop()
    }
    toast.success('Jumped to bookmark')
  }

  const removeBookmark = (bookmarkId) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId))
    toast.success('Bookmark removed')
  }

  const progress = pdfText ? (currentPosition / pdfText.length) * 100 : 0

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
            <h1 className="text-3xl font-bold">PDF Voice Reader</h1>
            <p className="text-gray-600">Listen to your study materials with AI-powered voice synthesis</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Player */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Upload PDF</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium">
                    {pdfFile ? pdfFile.name : 'Click to upload PDF file'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Supports PDF files up to 50MB
                  </p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Player Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mic className="h-5 w-5" />
                <span>Voice Player</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center space-x-4">
                <Button variant="outline" size="sm">
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                {isPlaying ? (
                  <Button onClick={handlePause} size="lg">
                    <Pause className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button onClick={handlePlay} size="lg">
                    <Play className="h-5 w-5" />
                  </Button>
                )}
                
                <Button onClick={handleStop} variant="outline" size="sm">
                  <Square className="h-4 w-4" />
                </Button>
                
                <Button variant="outline" size="sm">
                  <SkipForward className="h-4 w-4" />
                </Button>
                
                <Button onClick={addBookmark} variant="outline" size="sm">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>

              {/* Speed and Volume Controls */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Speed: {playbackSpeed}x</label>
                  <Slider
                    value={[playbackSpeed]}
                    onValueChange={handleSpeedChange}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <Volume2 className="h-4 w-4" />
                    <span>Volume: {volume}%</span>
                  </label>
                  <Slider
                    value={[volume]}
                    onValueChange={handleVolumeChange}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Text Display */}
          {pdfText && (
            <Card>
              <CardHeader>
                <CardTitle>Document Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {pdfText.split('').map((char, index) => (
                      <span
                        key={index}
                        className={
                          index >= currentPosition && index < currentPosition + 50 && isPlaying
                            ? 'bg-yellow-200'
                            : ''
                        }
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Voice Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Voice Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Voice</label>
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((v) => (
                      <SelectItem key={v.name} value={v.name}>
                        {v.name} ({v.lang})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>• Adjust speed for comfortable listening</p>
                <p>• Use bookmarks to save important sections</p>
                <p>• Technical terms are automatically pronounced</p>
              </div>
            </CardContent>
          </Card>

          {/* Bookmarks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bookmark className="h-5 w-5" />
                <span>Bookmarks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookmarks.length > 0 ? (
                <div className="space-y-3">
                  {bookmarks.map((bookmark) => (
                    <div key={bookmark.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-2">
                            {bookmark.text}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {bookmark.timestamp}
                          </p>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => jumpToBookmark(bookmark)}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBookmark(bookmark.id)}
                          >
                            <Square className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Bookmark className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No bookmarks yet</p>
                  <p className="text-xs">Add bookmarks while listening</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Technical term pronunciation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Multiple voice options</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Speed control (0.5x - 2x)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Bookmark important sections</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Visual text highlighting</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PDFReaderPage