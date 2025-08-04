'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Brain, User, UserCheck, Mail, Lock, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function RegisterPage() {
    const [userType, setUserType] = useState<'patient' | 'therapist'>('patient')
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        state: '',
        city: '',
        // Therapist specific fields
        license: '',
        specialization: '',
        experience: ''
    })

    const nigerianStates = [
        "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
        "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
        "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
        "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
        "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // Handle registration logic here
        console.log('Registration data:', { userType, ...formData })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center space-x-2 mb-6">
                        <Brain className="w-8 h-8 text-blue-400" />
                        <span className="text-2xl font-bold glow-text">MindBridge</span>
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Join Our Community</h1>
                    <p className="text-gray-300">Create your account to get started</p>
                </div>

                {/* User Type Selection */}
                <div className="flex bg-slate-800/50 rounded-lg p-1 mb-8">
                    <button
                        onClick={() => setUserType('patient')}
                        className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-md transition-all ${userType === 'patient'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <User className="w-5 h-5" />
                        <span>I need support</span>
                    </button>
                    <button
                        onClick={() => setUserType('therapist')}
                        className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-md transition-all ${userType === 'therapist'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <UserCheck className="w-5 h-5" />
                        <span>I'm a therapist</span>
                    </button>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="glass-effect p-8 rounded-xl space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">First Name</label>
                            <Input
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="bg-slate-800/50 border-slate-700 text-white"
                                placeholder="Enter your first name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Last Name</label>
                            <Input
                                type="text"
                                required
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="bg-slate-800/50 border-slate-700 text-white"
                                placeholder="Enter your last name"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="bg-slate-800/50 border-slate-700 text-white pl-11"
                                placeholder="your@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="bg-slate-800/50 border-slate-700 text-white pl-11"
                                placeholder="+234 xxx xxx xxxx"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">State</label>
                            <select
                                required
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                className="w-full h-10 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select your state</option>
                                {nigerianStates.map((state) => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">City</label>
                            <Input
                                type="text"
                                required
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="bg-slate-800/50 border-slate-700 text-white"
                                placeholder="Enter your city"
                            />
                        </div>
                    </div>

                    {/* Therapist specific fields */}
                    {userType === 'therapist' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-2">License Number</label>
                                <Input
                                    type="text"
                                    required
                                    value={formData.license}
                                    onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                                    className="bg-slate-800/50 border-slate-700 text-white"
                                    placeholder="Enter your professional license number"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Specialization</label>
                                    <select
                                        required
                                        value={formData.specialization}
                                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                        className="w-full h-10 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select specialization</option>
                                        <option value="anxiety">Anxiety Disorders</option>
                                        <option value="depression">Depression</option>
                                        <option value="trauma">Trauma & PTSD</option>
                                        <option value="relationships">Relationship Counseling</option>
                                        <option value="addiction">Addiction Recovery</option>
                                        <option value="family">Family Therapy</option>
                                        <option value="cognitive">Cognitive Behavioral Therapy</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Years of Experience</label>
                                    <Input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                        className="bg-slate-800/50 border-slate-700 text-white"
                                        placeholder="Years"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <Input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="bg-slate-800/50 border-slate-700 text-white pl-11"
                                    placeholder="Create a strong password"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <Input
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="bg-slate-800/50 border-slate-700 text-white pl-11"
                                    placeholder="Confirm your password"
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold"
                    >
                        Create Account
                    </Button>

                    <div className="text-center">
                        <p className="text-gray-300">
                            Already have an account?{' '}
                            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
