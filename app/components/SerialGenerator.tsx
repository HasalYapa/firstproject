'use client';

import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { supabase } from '@/lib/supabase';
import { stringify } from 'csv-stringify/sync';

interface SerialNumber {
  id: string;
  productName: string;
  batchId: string;
  serialNumber: string;
  createdAt: string;
  qrCode: string;
}

interface AdvancedOptions {
  format: 'uuid' | 'alphanumeric' | 'numeric';
  prefix: string;
  suffix: string;
  length: number;
  includeSymbols: boolean;
}

export default function SerialGenerator() {
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [generatedSerials, setGeneratedSerials] = useState<SerialNumber[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(1);
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptions>({
    format: 'uuid',
    prefix: '',
    suffix: '',
    length: 12,
    includeSymbols: false
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Check if it's the first visit to show tutorial
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      localStorage.setItem('hasSeenTutorial', 'true');
    }
  }, []);

  // Generate custom serial number based on format
  const generateCustomSerial = (): string => {
    const { format, prefix, suffix, length, includeSymbols } = advancedOptions;
    
    let result = '';
    const alphaChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numericChars = '0123456789';
    const symbolChars = '!@#$%^&*-_+=';
    
    switch (format) {
      case 'uuid':
        result = uuidv4();
        break;
      case 'alphanumeric':
        const alphanumeric = alphaChars + alphaChars.toLowerCase() + numericChars;
        const allChars = includeSymbols ? alphanumeric + symbolChars : alphanumeric;
        for (let i = 0; i < length; i++) {
          result += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }
        break;
      case 'numeric':
        for (let i = 0; i < length; i++) {
          result += numericChars.charAt(Math.floor(Math.random() * numericChars.length));
        }
        break;
    }
    
    return `${prefix}${result}${suffix}`;
  };

  const generateSerials = async () => {
    setIsGenerating(true);
    setSuccessMessage('');
    const batchId = uuidv4();
    const newSerials: SerialNumber[] = [];

    try {
      for (let i = 0; i < quantity; i++) {
        const serialNumber = advancedOptions.format === 'uuid' && !advancedOptions.prefix && !advancedOptions.suffix 
          ? uuidv4() 
          : generateCustomSerial();
          
        const qrCodeData = `https://your-domain.com/verify/${serialNumber}`;
        const qrCode = await QRCode.toDataURL(qrCodeData);

        const serialData: SerialNumber = {
          id: uuidv4(),
          productName,
          batchId,
          serialNumber,
          createdAt: new Date().toISOString(),
          qrCode
        };

        const { error } = await supabase
          .from('serial_numbers')
          .insert(serialData);

        if (error) throw error;
        newSerials.push(serialData);
      }

      setGeneratedSerials(newSerials);
      
      // Show success message
      setSuccessMessage(`Successfully generated ${quantity} serial numbers!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      // Scroll to results
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
      
    } catch (error) {
      console.error('Error generating serials:', error);
      alert('Error generating serial numbers');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToCSV = () => {
    const csvData = stringify(generatedSerials.map(serial => ({
      Product: serial.productName,
      'Batch ID': serial.batchId,
      'Serial Number': serial.serialNumber,
      'Created At': serial.createdAt
    })), { header: true });

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serials-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    // Show toast notification
    setSuccessMessage('CSV file downloaded successfully!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  const nextTutorialStep = () => {
    if (tutorialStep < 4) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setShowTutorial(false);
    }
  };
  
  const closeTutorial = () => {
    setShowTutorial(false);
  };

  return (
    <div className="space-y-8">
      {/* Tutorial overlay */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Welcome to Serial Number Generator</h3>
              <button onClick={closeTutorial} className="text-gray-400 hover:text-gray-500 transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              {tutorialStep === 1 && (
                <div className="space-y-2 animate-fade-in">
                  <p className="text-gray-600">This tool helps you generate secure serial numbers for your products.</p>
                  <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                    <img src="https://placehold.co/600x200?text=Enter+product+details" alt="Enter product details" className="w-full rounded-lg mb-2" />
                    <p className="text-gray-600">Step 1: Enter a product name and quantity to generate.</p>
                  </div>
                </div>
              )}
              
              {tutorialStep === 2 && (
                <div className="space-y-2 animate-fade-in">
                  <p className="text-gray-600">You can customize how your serial numbers look.</p>
                  <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                    <img src="https://placehold.co/600x200?text=Advanced+Options" alt="Advanced options" className="w-full rounded-lg mb-2" />
                    <p className="text-gray-600">Step 2: Click "Advanced Options" to customize the format of your serial numbers.</p>
                  </div>
                </div>
              )}
              
              {tutorialStep === 3 && (
                <div className="space-y-2 animate-fade-in">
                  <p className="text-gray-600">Generate your serial numbers with a single click.</p>
                  <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                    <img src="https://placehold.co/600x200?text=Generate+Button" alt="Generate button" className="w-full rounded-lg mb-2" />
                    <p className="text-gray-600">Step 3: Click the "Generate Serial Numbers" button to create your unique identifiers.</p>
                  </div>
                </div>
              )}
              
              {tutorialStep === 4 && (
                <div className="space-y-2 animate-fade-in">
                  <p className="text-gray-600">Export your serial numbers for use in your products.</p>
                  <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                    <img src="https://placehold.co/600x200?text=Export+Results" alt="Export results" className="w-full rounded-lg mb-2" />
                    <p className="text-gray-600">Step 4: View your generated serials and export them to CSV if needed.</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <div 
                    key={step} 
                    className={`h-2 w-2 rounded-full transition-colors ${tutorialStep === step ? 'bg-primary-600' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
              <button 
                onClick={nextTutorialStep} 
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors shadow-sm"
              >
                {tutorialStep === 4 ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-down">
          <div className="bg-secondary-100 border-l-4 border-secondary-500 text-secondary-700 p-4 rounded shadow-elevated">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-secondary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <p>{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card p-6 shadow-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Generate New Serial Numbers
        </h2>
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label text-gray-700 mb-1">
              Product Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="input-field pl-10"
                placeholder="Enter product name"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label text-gray-700 mb-1">
              Quantity
            </label>
            <div className="flex rounded-lg shadow-sm overflow-hidden">
              <button 
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="relative inline-flex items-center px-4 py-3 border border-r-0 border-gray-300 bg-gray-50 text-primary-500 hover:bg-gray-100 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                </svg>
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                className="flex-1 min-w-0 block w-full px-4 py-3 border-y border-gray-300 bg-white focus:ring-primary-500 focus:border-primary-500 text-center"
                min="1"
              />
              <button 
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="relative inline-flex items-center px-4 py-3 border border-l-0 border-gray-300 bg-gray-50 text-primary-500 hover:bg-gray-100 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Number of serial numbers to generate.
            </p>
          </div>
          
          {/* Advanced Options Toggle */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="text-primary-600 hover:text-primary-800 flex items-center text-sm font-medium focus:outline-none group transition-colors"
            >
              <svg 
                className={`h-4 w-4 mr-2 transition-transform duration-300 ${showAdvancedOptions ? 'rotate-90' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              Advanced Options
            </button>
          </div>
          
          {/* Advanced Options Panel */}
          <div 
            className={`transition-all duration-500 overflow-hidden ${
              showAdvancedOptions 
                ? 'max-h-[800px] opacity-100' 
                : 'max-h-0 opacity-0'
            }`}
          >
            <div className="bg-primary-50 p-5 rounded-lg border border-primary-100 mt-2 space-y-4">
              <div className="form-group">
                <label className="form-label text-gray-700 mb-1">Serial Number Format</label>
                <select
                  value={advancedOptions.format}
                  onChange={(e) => setAdvancedOptions({...advancedOptions, format: e.target.value as any})}
                  className="input-field"
                >
                  <option value="uuid">UUID (default)</option>
                  <option value="alphanumeric">Alphanumeric</option>
                  <option value="numeric">Numeric only</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label text-gray-700 mb-1">Prefix</label>
                  <input
                    type="text"
                    value={advancedOptions.prefix}
                    onChange={(e) => setAdvancedOptions({...advancedOptions, prefix: e.target.value})}
                    className="input-field"
                    placeholder="e.g., PRD-"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-gray-700 mb-1">Suffix</label>
                  <input
                    type="text"
                    value={advancedOptions.suffix}
                    onChange={(e) => setAdvancedOptions({...advancedOptions, suffix: e.target.value})}
                    className="input-field"
                    placeholder="e.g., -2023"
                  />
                </div>
              </div>
              
              {advancedOptions.format !== 'uuid' && (
                <div className="form-group">
                  <label className="form-label text-gray-700 mb-1">Length</label>
                  <input
                    type="number"
                    value={advancedOptions.length}
                    onChange={(e) => setAdvancedOptions({...advancedOptions, length: parseInt(e.target.value)})}
                    className="input-field"
                    min="4"
                    max="32"
                  />
                  <p className="mt-1 text-xs text-gray-500">Number of characters in the generated serial (excluding prefix/suffix)</p>
                </div>
              )}
              
              {advancedOptions.format === 'alphanumeric' && (
                <div className="flex items-center">
                  <input
                    id="includeSymbols"
                    type="checkbox"
                    checked={advancedOptions.includeSymbols}
                    onChange={(e) => setAdvancedOptions({...advancedOptions, includeSymbols: e.target.checked})}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="includeSymbols" className="ml-2 block text-sm text-gray-700">
                    Include special characters (!@#$%^&*-_+=)
                  </label>
                </div>
              )}
              
              <div className="mt-2">
                <p className="text-sm text-gray-700 font-medium">Preview:</p>
                <div className="mt-1 p-3 bg-white rounded-lg border border-gray-200 text-gray-800 font-mono text-sm break-all shadow-inner-soft">
                  {advancedOptions.format === 'uuid' && !advancedOptions.prefix && !advancedOptions.suffix 
                    ? uuidv4()
                    : `${advancedOptions.prefix}${
                        advancedOptions.format === 'uuid' 
                          ? uuidv4() 
                          : (advancedOptions.format === 'numeric'
                              ? '1234567890'.substring(0, Math.min(advancedOptions.length, 10))
                              : 'ABC123xyz'.substring(0, Math.min(advancedOptions.length, 9)))
                      }${advancedOptions.suffix}`
                  }
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={generateSerials}
            disabled={!productName || isGenerating}
            className="w-full btn btn-primary mt-4 group"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : (
              <span className="flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Generate Serial Numbers
              </span>
            )}
          </button>
        </div>
      </div>

      {generatedSerials.length > 0 && (
        <div className="space-y-6 animate-slide-up" ref={scrollRef}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <svg className="h-5 w-5 text-secondary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Generated Serial Numbers
              <span className="ml-2 text-sm bg-primary-100 text-primary-800 rounded-full px-2 py-0.5">
                {generatedSerials.length}
              </span>
            </h3>
            <button
              onClick={exportToCSV}
              className="btn btn-success"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export to CSV
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {generatedSerials.map((serial, index) => (
              <div
                key={serial.id}
                className="card group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-5 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{serial.productName}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {new Date(serial.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-500 font-mono break-all select-all">{serial.serialNumber}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 flex justify-center group-hover:bg-primary-50 transition-colors">
                  <img
                    src={serial.qrCode}
                    alt="QR Code"
                    className="w-32 h-32 transition-all duration-300 group-hover:scale-110"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 