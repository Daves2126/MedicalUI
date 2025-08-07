'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Stethoscope, Send, User, Bot, ArrowLeft, Plus, Settings, Square } from 'lucide-react'
import Link from 'next/link'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function FallbackChat() {
  // Custom chat implementation for fallback
  const [messages, setMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string}>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Fallback to local API since authentication is not available
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: ''
      }

      setMessages(prev => [...prev, assistantMessage])

      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone

        if (value) {
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const data = JSON.parse(line.slice(2))
                if (data.content) {
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === assistantMessage.id 
                        ? { ...msg, content: msg.content + data.content }
                        : msg
                    )
                  )
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again later or sign in for full functionality.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const stop = () => {
    setIsLoading(false)
  }

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const suggestedPrompts = [
    {
      title: "Symptom Analysis",
      prompt: "I've been experiencing a persistent headache for the past 3 days, along with mild nausea. What could be causing this?",
      category: "symptoms"
    },
    {
      title: "Medication Information",
      prompt: "Can you explain how ibuprofen works and what are its common side effects?",
      category: "medication"
    },
    {
      title: "Preventive Care",
      prompt: "What are the recommended health screenings for someone in their 40s?",
      category: "prevention"
    },
    {
      title: "Nutrition Guidance",
      prompt: "What dietary changes can help manage high cholesterol naturally?",
      category: "nutrition"
    }
  ]

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleSuggestedPrompt = (prompt: string) => {
    handleInputChange({ target: { value: prompt } } as any)
    textareaRef.current?.focus()
  }

  const newChat = () => {
    setMessages([])
    setInput('')
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Stethoscope className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">MedChat AI</span>
          </div>
          <Button onClick={newChat} className="w-full" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Empty space */}
        <div className="flex-1"></div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <div className="text-xs text-gray-500">Demo Mode</div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Chat Header - Fixed */}
        <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Medical Assistant</h1>
              <p className="text-sm text-gray-600">
                Demo mode - Sign in for full functionality • 
                <span className="text-yellow-600 ml-1">Limited</span>
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Chat Settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Messages Area - ONLY THIS SCROLLS */}
        <div className="flex-1 overflow-y-auto bg-gray-50" style={{ height: 'calc(100vh - 140px)' }}>
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center p-4">
              <div className="max-w-3xl mx-auto text-center">
                {/* Welcome Message */}
                <div className="mb-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome to MedChat AI
                  </h2>
                  <p className="text-gray-600 mb-6">
                    I'm your AI medical assistant. I can help you understand symptoms, medications, 
                    health conditions, and provide general medical information. How can I assist you today?
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Badge variant="secondary">Demo Mode</Badge>
                    <Badge variant="secondary">Limited Features</Badge>
                    <Badge variant="secondary">Sign In for Full Access</Badge>
                  </div>
                </div>

                {/* Suggested Prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {suggestedPrompts.map((suggestion, index) => (
                    <Card 
                      key={index} 
                      className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
                      onClick={() => handleSuggestedPrompt(suggestion.prompt)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{suggestion.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {suggestion.prompt}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Disclaimer */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Important:</strong> This AI provides general medical information only. 
                    Always consult qualified healthcare professionals for medical advice, diagnosis, or treatment.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-4 ${
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="h-5 w-5" />
                      ) : (
                        <Bot className="h-5 w-5" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block rounded-lg px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200 shadow-sm'
                      }`}>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {message.content}
                          {/* Show typing cursor for assistant messages that are still loading */}
                          {message.role === 'assistant' && isLoading && index === messages.length - 1 && (
                            <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Input Area - Fixed */}
        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-end space-x-2">
                {/* Text Input */}
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me about symptoms, medications, or health conditions..."
                    className="min-h-[44px] max-h-32 resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    disabled={isLoading}
                    rows={1}
                  />
                </div>

                {/* Send/Stop Button */}
                {isLoading ? (
                  <Button 
                    type="button" 
                    onClick={stop}
                    variant="outline"
                    size="sm"
                    className="mb-2"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={!input.trim()}
                    size="sm"
                    className="mb-2"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>

            {/* Input Footer */}
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span>Press Enter to send, Shift+Enter for new line</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>{input.length}/2000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
