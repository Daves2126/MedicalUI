'use client'

import { useAuth } from '@/contexts/auth-context'
import { useEffect, useState } from 'react'
import FallbackLanding from '@/components/fallback-landing'

// Import the original landing page components
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Shield, Clock, Users, ArrowRight, Stethoscope, Brain, Heart, Chrome } from 'lucide-react'
import { LoginModal } from '@/components/auth/login-modal'
import { UserProfile } from '@/components/auth/user-profile'

export default function LandingPage() {
  const [firebaseError, setFirebaseError] = useState(false)
  
  try {
    const { user, error } = useAuth()
    
    // If there's a Firebase configuration error, show fallback
    if (error) {
      return <FallbackLanding />
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">MedChat AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/chat">
                <Button variant="outline">Try Chat</Button>
              </Link>
              {user ? (
                <UserProfile />
              ) : (
                <LoginModal>
                  <Button>
                    <Chrome className="mr-2 h-4 w-4" />
                    Sign In with Google
                  </Button>
                </LoginModal>
              )}
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
            AI-Powered Medical Assistant
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Your Intelligent Medical
            <span className="text-blue-600"> Information</span> Companion
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get instant, reliable medical information and guidance through our advanced AI chat agent. 
            Available 24/7 to help you understand symptoms, medications, and health conditions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Chatting Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            {!user ? (
              <LoginModal>
                <Button size="lg" variant="outline">
                  <Chrome className="mr-2 h-4 w-4" />
                  Sign In with Google
                </Button>
              </LoginModal>
            ) : (
              <Button size="lg" variant="outline">
                View Profile
              </Button>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose MedChat AI?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI-powered medical assistant provides accurate, up-to-date information 
              to help you make informed health decisions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <MessageCircle className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Instant Responses</CardTitle>
                <CardDescription>
                  Get immediate answers to your medical questions, available 24/7
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Reliable Information</CardTitle>
                <CardDescription>
                  Trained on verified medical literature and guidelines from trusted sources
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Brain className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Smart Analysis</CardTitle>
                <CardDescription>
                  Advanced AI understands context and provides personalized guidance
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Clock className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Always Available</CardTitle>
                <CardDescription>
                  No appointments needed - get help whenever you need it most
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Heart className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Compassionate Care</CardTitle>
                <CardDescription>
                  Designed with empathy to provide supportive and understanding responses
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>Privacy First</CardTitle>
                <CardDescription>
                  Your health information is kept private and secure at all times
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How MedChat AI Can Help You
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Symptom Understanding</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Describe your symptoms and get information about possible conditions, 
                    when to seek medical care, and self-care recommendations.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Symptom analysis and explanation</li>
                    <li>• Urgency assessment</li>
                    <li>• Home care suggestions</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Medication Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Learn about medications, their uses, side effects, interactions, 
                    and proper usage instructions.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Drug information and uses</li>
                    <li>• Side effects and warnings</li>
                    <li>• Interaction checking</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Health Education</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Get reliable information about medical conditions, treatments, 
                    and preventive care measures.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Disease information</li>
                    <li>• Treatment options</li>
                    <li>• Prevention strategies</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Wellness Guidance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Receive advice on maintaining good health, lifestyle modifications, 
                    and wellness practices.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Lifestyle recommendations</li>
                    <li>• Nutrition guidance</li>
                    <li>• Exercise suggestions</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of users who trust MedChat AI for reliable medical information 
              and guidance. Start your conversation today.
            </p>
            {!user ? (
              <LoginModal>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Chrome className="mr-2 h-5 w-5" />
                  Sign In with Google
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </LoginModal>
            ) : (
              <Link href="/chat">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Continue to Chat
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <Stethoscope className="h-6 w-6" />
                <span className="text-xl font-bold">MedChat AI</span>
              </div>
              <div className="text-sm text-gray-400">
                <p className="mb-2">
                  <strong>Disclaimer:</strong> This AI assistant provides general medical information only. 
                  Always consult healthcare professionals for medical advice.
                </p>
                <p>© 2024 MedChat AI. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  } catch (error) {
    // If useAuth throws an error, show fallback
    return <FallbackLanding />
  }
}
