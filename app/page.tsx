'use client';

import { useState, useEffect } from 'react';
import SerialGenerator from './components/SerialGenerator';
import SerialVerifier from './components/SerialVerifier';
import Statistics from './components/Statistics';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'generate' | 'verify' | 'statistics'>('generate');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  const resetTutorial = () => {
    localStorage.removeItem('hasSeenTutorial');
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-indigo-600 to-purple-600 transform -skew-y-6 -translate-y-36 z-0 opacity-10"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary-400 rounded-full filter blur-3xl opacity-10 -translate-x-10 translate-y-10"></div>
      <div className="absolute top-40 right-10 w-40 h-40 bg-accent-400 rounded-full filter blur-3xl opacity-10"></div>
      
      {/* Help Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowHelpModal(true)}
          className="bg-primary-600 text-white rounded-full p-3 shadow-lg hover:bg-primary-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transform hover:scale-105"
          aria-label="Help"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
      
      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Help & Resources</h3>
              <button onClick={() => setShowHelpModal(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">Need help using the Serial Number Generator?</p>
              
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <h4 className="font-medium text-indigo-800 mb-2">Quick Guide</h4>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  <li>Enter a product name and quantity</li>
                  <li>Use advanced options to customize serial format</li>
                  <li>Generate and export your serial numbers</li>
                  <li>Verify serials with the verification tool</li>
                  <li>View statistics and analytics in the dashboard</li>
                </ul>
              </div>
              
              <button
                onClick={resetTutorial}
                className="w-full mt-4 px-4 py-3 border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <span className="flex items-center justify-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Restart Tutorial
                </span>
              </button>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  For additional support, contact our team at support@example.com
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-center mb-12 animate-slide-up">
            <p className="inline-block px-3 py-1 text-sm font-medium text-primary-700 bg-primary-100 rounded-full mb-3 shadow-sm">
              Professional Tool
            </p>
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl tracking-tight">
              <span className="block">Product Serial</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">Number Generator</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Generate secure serial numbers with QR codes for your products. Verify authenticity in seconds.
            </p>
            
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-md shadow">
                <a
                  href="#generator"
                  className="btn btn-primary"
                >
                  Get Started
                </a>
              </div>
              <div className="ml-3 inline-flex">
                <button
                  onClick={() => setShowHelpModal(true)}
                  className="px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>

          <div id="generator" className="glass-card shadow-elevated animate-fade-in">
            {/* Floating tab indicator for mobile */}
            <div className="sm:hidden sticky top-0 z-10 bg-white pt-4 px-4">
              <div className="relative">
                <div className="relative flex justify-center">
                  <div className="inline-flex shadow-sm rounded-full overflow-hidden">
                    <button
                      onClick={() => setActiveTab('generate')}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                        activeTab === 'generate'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      } transition-colors duration-200`}
                    >
                      <span>Generate</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('verify')}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                        activeTab === 'verify'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      } transition-colors duration-200`}
                    >
                      <span>Verify</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('statistics')}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                        activeTab === 'statistics'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      } transition-colors duration-200`}
                    >
                      <span>Statistics</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop tabs */}
            <div className="hidden sm:block border-b border-gray-200">
              <nav className="flex justify-center -mb-px" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('generate')}
                  className={`
                    w-1/3 py-4 px-6 text-center border-b-2 font-medium text-sm sm:text-base
                    transition-all duration-200 ease-in-out
                    ${activeTab === 'generate' ? 'tab-active' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Generate Serials</span>
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('verify')}
                  className={`
                    w-1/3 py-4 px-6 text-center border-b-2 font-medium text-sm sm:text-base
                    transition-all duration-200 ease-in-out
                    ${activeTab === 'verify' ? 'tab-active' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Verify Serial</span>
                  </span>
                </button>
                
                <button
                  onClick={() => setActiveTab('statistics')}
                  className={`
                    w-1/3 py-4 px-6 text-center border-b-2 font-medium text-sm sm:text-base
                    transition-all duration-200 ease-in-out
                    ${activeTab === 'statistics' ? 'tab-active' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Dashboard</span>
                  </span>
                </button>
              </nav>
            </div>

            <div className="p-4 sm:p-8">
              {activeTab === 'generate' && <SerialGenerator />}
              {activeTab === 'verify' && <SerialVerifier />}
              {activeTab === 'statistics' && <Statistics />}
            </div>
          </div>

          <footer className="mt-16 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Product Serial Generator. All rights reserved.</p>
            <div className="mt-2 flex justify-center space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">Contact</a>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
} 