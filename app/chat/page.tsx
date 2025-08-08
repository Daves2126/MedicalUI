'use client'

import { useAuth } from '@/contexts/auth-context'
import FallbackChat from '@/components/chat/fallback-chat'

// Import the original chat components
import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Stethoscope, Send, User, Bot, ArrowLeft, Plus, Settings, Square, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { UserProfile } from '@/components/auth/user-profile'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export default function ChatPage() {
  try {
    const { user, error } = useAuth()
    
    // If there's a Firebase configuration error, show fallback
    if (error) {
      return <FallbackChat />
    }

    return <AuthenticatedChat />
  } catch (error) {
    // If useAuth throws an error, show fallback
    return <FallbackChat />
  }
}

function AuthenticatedChat() {
  const { user } = useAuth()
  // Custom chat implementation
  const [messages, setMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string}>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)

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
    const currentInput = input
    setInput('')
    setIsLoading(true)

    try {
      // Get JWT token from Firebase user
      const token = await user?.getIdToken()
      
      if (!token) {
        throw new Error('No authentication token available')
      }

      const response = await fetch('http://localhost:5043/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: currentInput,
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Since the API returns text/plain, we'll simulate streaming
      const responseText = await response.text()
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: ''
      }

      setMessages(prev => [...prev, assistantMessage])

      // Simulate progressive typing effect
      const words = responseText.split(' ')
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i] + (i < words.length - 1 ? ' ' : '')
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: msg.content + word }
              : msg
          )
        )
        
        // Variable delay to simulate natural typing
        const delay = Math.random() * 50 + 30 // 30-80ms delay
        await new Promise(resolve => setTimeout(resolve, delay))
      }

    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error connecting to the medical assistant service. Please try again later.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const stop = () => {
    setIsLoading(false)
  }

  const clearChat = async () => {
    try {
      // Get JWT token from Firebase user
      const token = await user?.getIdToken()
      
      if (token) {
        // Call DELETE endpoint to clear chat on server
        await fetch('http://localhost:5043/chat', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.error('Error clearing chat on server:', error)
      // Continue with local clear even if server call fails
    } finally {
      // Clear local messages regardless of server response
      setMessages([])
      setInput('')
      setShowClearDialog(false)
    }
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
    <ProtectedRoute>
      <div className="fixed inset-0 bg-gray-50 overflow-hidden">
        {/* Fixed Sidebar */}
        <div className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 flex flex-col z-10">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Stethoscope className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">MedChat AI</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={newChat} className="flex-1" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
              <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="px-3">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Conversation</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to clear this conversation? This action cannot be undone and will permanently delete all messages in this chat.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={clearChat} className="bg-red-600 hover:bg-red-700">
                      Clear Chat
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Empty space where model selection and chat history were */}
          <div className="flex-1"></div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
              <UserProfile />
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="ml-64 flex flex-col h-full">
          {/* Fixed Chat Header */}
          <div className="fixed top-0 left-64 right-0 bg-white border-b border-gray-200 p-4 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Medical Assistant</h1>
                <p className="text-sm text-gray-600">
                  AI-powered medical information assistant • 
                  <span className="text-green-600 ml-1">Online</span>
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

          {/* Scrollable Messages Area */}
          <div 
            className="pt-20 pb-32 overflow-y-auto"
            style={{ height: '100vh' }}
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center min-h-full p-4">
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
                      <Badge variant="secondary">Reliable</Badge>
                      <Badge variant="secondary">24/7 Available</Badge>
                      <Badge variant="secondary">Privacy First</Badge>
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
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {message.role === 'user' ? (
                          user?.photoURL ? (
                            <img 
                              src={user.photoURL || "/placeholder.svg"} 
                              alt={user.displayName || 'User'} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5" />
                          )
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

          {/* Fixed Input Area */}
          <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 p-4 z-10">
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
    </ProtectedRoute>
  )
}
