'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface VerificationResult {
  isValid: boolean;
  productName?: string;
  createdAt?: string;
  batchId?: string;
  serialNumber?: string;
}

export default function SerialVerifier() {
  const [serialNumber, setSerialNumber] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const verifySerial = async () => {
    if (!serialNumber.trim()) {
      setErrorMessage('Please enter a serial number');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);
    setErrorMessage('');

    try {
      const { data, error } = await supabase
        .from('serial_numbers')
        .select('*')
        .eq('serialNumber', serialNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - serial number not found
          setVerificationResult({
            isValid: false
          });
        } else {
          throw error;
        }
      } else if (data) {
        setVerificationResult({
          isValid: true,
          productName: data.productName,
          createdAt: new Date(data.createdAt).toLocaleDateString(),
          batchId: data.batchId,
          serialNumber: data.serialNumber
        });
      }
    } catch (error) {
      console.error('Error verifying serial:', error);
      setErrorMessage('An error occurred while verifying the serial number');
      setVerificationResult({
        isValid: false
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      verifySerial();
    }
  };

  const handleClear = () => {
    setSerialNumber('');
    setVerificationResult(null);
    setErrorMessage('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 shadow-soft">
        <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
          <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Verify Serial Number
        </h2>
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label text-blue-900 mb-1">
              Serial Number
            </label>
            <div className="mt-1 relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => {
                  setSerialNumber(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                onKeyPress={handleKeyPress}
                className={`input-field pl-10 pr-10 ${errorMessage ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter serial number to verify"
              />
              {serialNumber && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            {errorMessage && (
              <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={verifySerial}
              disabled={!serialNumber.trim() || isVerifying}
              className="flex-1 btn btn-primary"
            >
              {isVerifying ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verify Serial Number
                </span>
              )}
            </button>
            <button
              onClick={handleClear}
              type="button"
              disabled={!serialNumber && !verificationResult}
              className="px-3 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reset
            </button>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">
              Enter the serial number from your product's label or scan the QR code
            </p>
          </div>
        </div>
      </div>

      {verificationResult && (
        <div className="animate-fade-in">
          {verificationResult.isValid ? (
            <div className="bg-green-50 border border-green-100 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                  <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                  <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-green-800">
                  <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold">Authentic Product Verified</h3>
                </div>
                <div className="pl-8 grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                  <div className="p-3 bg-white rounded-lg shadow-inner-soft">
                    <p className="text-sm text-gray-500 font-medium">Product</p>
                    <p className="text-green-700 font-semibold">{verificationResult.productName}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-inner-soft">
                    <p className="text-sm text-gray-500 font-medium">Date Issued</p>
                    <p className="text-green-700">{verificationResult.createdAt}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-inner-soft sm:col-span-2">
                    <p className="text-sm text-gray-500 font-medium">Serial Number</p>
                    <p className="text-green-700 font-mono text-sm break-all">
                      {verificationResult.serialNumber}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-inner-soft sm:col-span-2">
                    <p className="text-sm text-gray-500 font-medium">Batch ID</p>
                    <p className="text-green-700 font-mono text-sm break-all">
                      {verificationResult.batchId}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-100 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0">
                <div className="flex items-center text-red-800 sm:mr-4">
                  <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-red-800">Invalid Serial Number</h3>
                  <p className="mt-1 text-red-700">
                    This serial number does not match any of our records. Please check the number and try again.
                  </p>
                  <p className="mt-4 text-sm text-red-600">
                    If you believe this is an error, please contact customer support for assistance.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 