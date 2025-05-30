"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface ClientLandingPageProps {
  userId?: string | null;
}

export default function ClientLandingPage({ userId }: ClientLandingPageProps) {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    { icon: "📦", title: "Inventory Tracking", description: "Real-time inventory monitoring" },
    { icon: "🏢", title: "Warehouse Management", description: "Organize multiple warehouses" },
    { icon: "📊", title: "Analytics & Reports", description: "Detailed insights and analytics" },
    { icon: "🔄", title: "Stock Transfers", description: "Seamless stock movement tracking" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-0 right-4 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-bounce"></div>
        <div className="absolute -bottom-8 left-20 w-88 h-88 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-ping"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-bounce opacity-60"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-pulse opacity-50"></div>
        <div className="absolute bottom-1/4 left-3/4 w-2 h-2 bg-pink-400 rounded-full animate-ping opacity-40"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        <main className="flex flex-col items-center gap-12 max-w-6xl mx-auto text-center">
          {/* Enhanced Logo Section with Advanced Animations */}
          <div className="flex flex-col items-center gap-8">
            <div className="relative group">
              <div className="absolute -inset-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full opacity-30 group-hover:opacity-60 blur-lg transition-all duration-500 animate-pulse"></div>
              <div className="absolute -inset-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-20 group-hover:opacity-40 blur transition-all duration-300"></div>
              <div className="relative transform transition-all duration-500 hover:scale-110 hover:rotate-3">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                <Image
                  src="/logo.jpg"
                  alt="Inventory Management System Logo"
                  width={140}
                  height={140}
                  className="relative rounded-3xl shadow-2xl ring-4 ring-white/60 dark:ring-slate-800/60 group-hover:ring-8 group-hover:ring-blue-400/30 transition-all duration-300"
                  priority
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient-x relative">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent blur-sm opacity-50"></span>
                <span className="relative">Inventory Management</span>
              </h1>
              <h2 className="text-4xl md:text-5xl font-semibold text-slate-800 dark:text-slate-200 relative">
                <span className="absolute inset-0 text-slate-400 dark:text-slate-600 blur-sm">System</span>
                <span className="relative">System</span>
              </h2>
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed backdrop-blur-sm bg-white/10 dark:bg-slate-800/20 rounded-2xl p-6 border border-white/20 dark:border-slate-700/30">
                A comprehensive solution for managing warehouses, inventory, products, and more with modern technology.
              </p>
            </div>
          </div>          {/* Enhanced Interactive Feature Showcase */}
          <div className="mt-12 w-full max-w-4xl">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40 dark:border-slate-700/40 hover:shadow-3xl transition-all duration-500">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-center md:text-left">
                    <div className="text-6xl mb-6 animate-bounce">{features[currentFeature].icon}</div>                    <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {features[currentFeature].title}
                    </h3>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                      {features[currentFeature].description}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    {features.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentFeature(index)}
                        className={`relative w-4 h-4 rounded-full transition-all duration-300 hover:scale-125 ${
                          index === currentFeature 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-150 shadow-lg' 
                            : 'bg-slate-300 dark:bg-slate-600 hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-400'
                        }`}
                      >
                        {index === currentFeature && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 w-full max-w-4xl">
            <div className="group p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20 dark:border-slate-700/50">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 mb-2">Warehouse Management</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Organize and track multiple warehouses efficiently</p>
            </div>
            
            <div className="group p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20 dark:border-slate-700/50">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 mb-2">Real-time Tracking</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Monitor inventory levels and movements instantly</p>
            </div>
            
            <div className="group p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20 dark:border-slate-700/50">
              <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 mb-2">Analytics & Reports</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Generate insights with detailed reporting tools</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-6 items-center flex-col sm:flex-row mt-12">
            {userId ? (
              <Link
                className="group relative inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
                href="/dashboard"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center gap-2">
                  Go to Dashboard
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            ) : (
              <Link
                className="group relative inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
                href="/sign-in"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center gap-2">
                  Get Started
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            )}
          </div>

          {/* Developer Credit with Interactive Elements */}
          <div className="mt-20 flex flex-col items-center gap-6">
            <div className="group flex items-center gap-4 px-8 py-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-full shadow-lg border border-white/30 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                Developed by Ahmed Sudairy
              </span>
            </div>
            
            {/* GitHub Badge with Hover Effects */}
            <a
              href="https://github.com/AhmedAlsudairy"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-6 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-full hover:bg-slate-800 dark:hover:bg-slate-600 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
            >
              <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Visit GitHub Profile</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}
