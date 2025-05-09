'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Line, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface SerialData {
  productName: string;
  count: number;
}

interface StatData {
  totalSerials: number;
  totalProducts: number;
  totalBatches: number;
  recentSerials: {
    date: string;
    count: number;
  }[];
  productDistribution: {
    product: string;
    count: number;
  }[];
}

export default function Statistics() {
  const [loading, setLoading] = useState(true);
  const [statData, setStatData] = useState<StatData | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  const fetchStatistics = async () => {
    setLoading(true);

    try {
      // Get total number of serials
      const { count: totalSerials } = await supabase
        .from('serial_numbers')
        .select('*', { count: 'exact', head: true });

      // Get unique products count
      const { data: productsData } = await supabase
        .from('serial_numbers')
        .select('productName');
      
      // Extract unique product names
      const uniqueProducts = Array.from(
        new Set(productsData?.map(item => item.productName))
      );

      // Get unique batches count
      const { data: batchesData } = await supabase
        .from('serial_numbers')
        .select('batchId');
      
      // Extract unique batch IDs
      const uniqueBatches = Array.from(
        new Set(batchesData?.map(item => item.batchId))
      );

      // For recent serials, we'll use a simpler approach
      // This would ideally use a database function, but for now we'll simulate it
      const timeAgo = getTimeAgo(dateRange);
      const { data: recentData } = await supabase
        .from('serial_numbers')
        .select('createdAt')
        .gte('createdAt', timeAgo);
      
      // Process the data to group by date
      const recentSerials = processTimeSeriesData(recentData || [], dateRange);

      // Get product distribution
      const { data: productData } = await supabase
        .from('serial_numbers')
        .select('productName');
      
      // Process to count by product
      const productCounts: Record<string, number> = {};
      productData?.forEach(item => {
        productCounts[item.productName] = (productCounts[item.productName] || 0) + 1;
      });
      
      // Convert to array and sort by count
      const productDistribution = Object.entries(productCounts)
        .map(([product, count]) => ({ product, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStatData({
        totalSerials: totalSerials || 0,
        totalProducts: uniqueProducts.length,
        totalBatches: uniqueBatches.length,
        recentSerials,
        productDistribution
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get time ago based on date range
  const getTimeAgo = (range: 'week' | 'month' | 'year'): string => {
    const date = new Date();
    switch (range) {
      case 'week':
        date.setDate(date.getDate() - 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'year':
        date.setFullYear(date.getFullYear() - 1);
        break;
    }
    return date.toISOString();
  };

  // Helper function to process time series data
  const processTimeSeriesData = (data: any[], range: 'week' | 'month' | 'year') => {
    const dates: Record<string, number> = {};
    const format = range === 'year' ? 'month' : 'day';
    
    // Initialize dates with zeroes
    const daysToShow = range === 'week' ? 7 : range === 'month' ? 30 : 12;
    const labels = [];
    
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date();
      if (format === 'day') {
        date.setDate(date.getDate() - (daysToShow - 1 - i));
        const dateStr = date.toISOString().split('T')[0];
        dates[dateStr] = 0;
        labels.push(dateStr);
      } else {
        date.setMonth(date.getMonth() - (daysToShow - 1 - i));
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        dates[dateStr] = 0;
        labels.push(dateStr);
      }
    }
    
    // Count data by date
    data.forEach(item => {
      const date = new Date(item.createdAt);
      const dateStr = format === 'day' 
        ? date.toISOString().split('T')[0]
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
      if (dates[dateStr] !== undefined) {
        dates[dateStr]++;
      }
    });
    
    // Convert to array format
    return labels.map(date => ({
      date,
      count: dates[date]
    }));
  };

  // Chart data for recent serials
  const timeSeriesData = {
    labels: statData?.recentSerials.map(item => item.date) || [],
    datasets: [
      {
        label: 'Serials Generated',
        data: statData?.recentSerials.map(item => item.count) || [],
        backgroundColor: 'rgba(124, 58, 237, 0.2)',
        borderColor: 'rgba(124, 58, 237, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      }
    ]
  };

  // Chart data for product distribution
  const productDistData = {
    labels: statData?.productDistribution.map(item => item.product) || [],
    datasets: [
      {
        label: 'Serials per Product',
        data: statData?.productDistribution.map(item => item.count) || [],
        backgroundColor: [
          'rgba(124, 58, 237, 0.7)',
          'rgba(79, 70, 229, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)',
        ],
        borderWidth: 1,
      }
    ]
  };

  const StatCard = ({ title, value, icon }: { title: string, value: number | string, icon: React.ReactNode }) => (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-1 text-2xl font-semibold text-gray-900">{value}</h3>
        </div>
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass-card shadow-sm p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Dashboard Analytics</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex">
              <button 
                onClick={() => setDateRange('week')} 
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${dateRange === 'week' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Week
              </button>
              <button 
                onClick={() => setDateRange('month')} 
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${dateRange === 'month' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Month
              </button>
              <button 
                onClick={() => setDateRange('year')} 
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${dateRange === 'year' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Year
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                  title="Total Serials" 
                  value={statData?.totalSerials || 0}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  }
                />
                <StatCard 
                  title="Unique Products" 
                  value={statData?.totalProducts || 0}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                />
                <StatCard 
                  title="Total Batches" 
                  value={statData?.totalBatches || 0}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  }
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Serial Generation Over Time</h3>
                  <div className="h-80">
                    <Line 
                      data={timeSeriesData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              precision: 0
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Top Products</h3>
                  <div className="h-80">
                    <Doughnut
                      data={productDistData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 