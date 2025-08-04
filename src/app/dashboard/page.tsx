'use client'

import { useState } from 'react'
import { Brain, Calendar, MessageCircle, Video, Users, Settings, Bell, Search, Filter, Menu, X } from 'lucide-react'

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('overview')
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const navItems = [
        { id: 'overview', label: 'Overview', icon: Calendar },
        { id: 'sessions', label: 'Sessions', icon: Video },
        { id: 'messages', label: 'Messages', icon: MessageCircle },
        { id: 'therapists', label: 'Find Therapists', icon: Users },
        { id: 'groups', label: 'Support Groups', icon: Users },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            {/* Navigation */}
            <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                aria-label="Toggle sidebar"
                            >
                                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                            <Brain className="w-8 h-8 text-blue-400" />
                            <span className="text-lg lg:text-xl font-bold glow-text">MindBridge</span>
                        </div>
                        <div className="flex items-center space-x-2 lg:space-x-4">
                            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
                            </button>
                            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex relative">
                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black/50 z-30"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900/95 lg:bg-slate-900/30 backdrop-blur-lg lg:backdrop-blur-none min-h-screen p-4 lg:p-6 transition-transform duration-300 ease-in-out`}>
                    <nav className="space-y-2 mt-4 lg:mt-0">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id)
                                    setSidebarOpen(false) // Close mobile sidebar
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-4 lg:p-8">
                    {activeTab === 'overview' && (
                        <div className="space-y-6 lg:space-y-8">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold mb-2">Welcome back, Sarah!</h1>
                                <p className="text-gray-300 text-sm lg:text-base">Here's your mental health journey overview</p>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                                {[
                                    { title: 'Sessions Completed', value: '12', change: '+2 this week' },
                                    { title: 'Mood Score', value: '7.2/10', change: '+0.5 this week' },
                                    { title: 'Goals Achieved', value: '4/6', change: '2 pending' },
                                ].map((stat, index) => (
                                    <div key={index} className="glass-effect p-4 lg:p-6 rounded-xl">
                                        <h3 className="text-sm font-medium text-gray-300 mb-2">{stat.title}</h3>
                                        <div className="text-xl lg:text-2xl font-bold mb-1 glow-text">{stat.value}</div>
                                        <div className="text-xs lg:text-sm text-blue-400">{stat.change}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Upcoming Sessions */}
                            <div className="glass-effect p-4 lg:p-6 rounded-xl">
                                <h2 className="text-lg lg:text-xl font-bold mb-4">Upcoming Sessions</h2>
                                <div className="space-y-4">
                                    {[
                                        {
                                            therapist: 'Dr. Adaora Okafor',
                                            date: 'Today, 2:00 PM',
                                            type: 'Video Session',
                                            status: 'confirmed'
                                        },
                                        {
                                            therapist: 'Dr. Emeka Johnson',
                                            date: 'Tomorrow, 10:00 AM',
                                            type: 'In-Person',
                                            status: 'pending'
                                        }
                                    ].map((session, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 lg:p-4 bg-slate-800/50 rounded-lg space-y-2 sm:space-y-0">
                                            <div>
                                                <div className="font-semibold text-sm lg:text-base">{session.therapist}</div>
                                                <div className="text-xs lg:text-sm text-gray-300">{session.date} • {session.type}</div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${session.status === 'confirmed'
                                                ? 'bg-green-900/50 text-green-300'
                                                : 'bg-yellow-900/50 text-yellow-300'
                                                }`}>
                                                {session.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'therapists' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h1 className="text-3xl font-bold">Find Therapists</h1>
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search therapists..."
                                            className="pl-11 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <button className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-700/50 transition-colors">
                                        <Filter className="w-5 h-5" />
                                        <span>Filter</span>
                                    </button>
                                </div>
                            </div>

                            {/* Therapist Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    {
                                        name: 'Dr. Adaora Okafor',
                                        specialization: 'Anxiety & Depression',
                                        location: 'Lagos, Nigeria',
                                        rating: 4.9,
                                        sessions: 150,
                                        price: '₦15,000',
                                        available: 'Today 2:00 PM'
                                    },
                                    {
                                        name: 'Dr. Emeka Johnson',
                                        specialization: 'Trauma & PTSD',
                                        location: 'Abuja, Nigeria',
                                        rating: 4.8,
                                        sessions: 200,
                                        price: '₦18,000',
                                        available: 'Tomorrow 10:00 AM'
                                    },
                                    {
                                        name: 'Dr. Fatima Hassan',
                                        specialization: 'Relationship Counseling',
                                        location: 'Kano, Nigeria',
                                        rating: 4.7,
                                        sessions: 120,
                                        price: '₦12,000',
                                        available: 'Next week'
                                    }
                                ].map((therapist, index) => (
                                    <div key={index} className="glass-effect p-6 rounded-xl hover:bg-white/20 transition-colors">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-bold mb-1">{therapist.name}</h3>
                                            <p className="text-blue-400 text-sm">{therapist.specialization}</p>
                                            <p className="text-gray-300 text-sm">{therapist.location}</p>
                                        </div>

                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="text-sm">
                                                    <span className="text-yellow-400">★</span> {therapist.rating}
                                                </div>
                                                <div className="text-sm text-gray-300">
                                                    {therapist.sessions} sessions
                                                </div>
                                            </div>
                                            <div className="text-lg font-bold text-green-400">
                                                {therapist.price}
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <p className="text-sm text-gray-300">Next available: {therapist.available}</p>
                                        </div>

                                        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-lg transition-colors">
                                            Book Session
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <div className="space-y-6">
                            <h1 className="text-3xl font-bold">Messages</h1>
                            <div className="glass-effect p-6 rounded-xl">
                                <div className="text-center py-12">
                                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                                    <p className="text-gray-300">Start a conversation with your therapist</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
