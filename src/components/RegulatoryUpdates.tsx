import React, { useState, useEffect } from 'react';
import { AlertTriangle, BookOpen } from 'lucide-react';
import { regulatoryAPI } from '../lib/api';  // Import the new API service

interface RegulatoryUpdate {
  id: number;
  title: string;
  content: string;
  category: 'RBI' | 'GST';
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export default function RegulatoryUpdates() {
  const [updates, setUpdates] = useState<RegulatoryUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegulatoryUpdates();
  }, []);

  const fetchRegulatoryUpdates = async () => {
    try {
      const data = await regulatoryAPI.getAll();
      setUpdates(data);
    } catch (error) {
      console.error('Error fetching regulatory updates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading updates...</span>
        </div>
      </div>
    );
  }

  const rbiUpdates = updates.filter(update => update.category === 'RBI');
  const gstUpdates = updates.filter(update => update.category === 'GST');

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <BookOpen className="mr-2" />
          Regulatory Updates
        </h2>
        <p className="text-blue-100 mt-2">Stay informed with the latest RBI and GST updates</p>
      </div>
      
      <div className="p-6">
        {/* RBI Updates Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <AlertTriangle className="text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold ml-3 text-gray-800">RBI Updates</h3>
          </div>
          
          {rbiUpdates.length > 0 ? (
            <div className="space-y-4">
              {rbiUpdates.map((update) => (
                <div key={update.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-800">{update.title}</h4>
                  <p className="text-gray-600 mt-2">{update.content}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">
                      {new Date(update.created_at).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      RBI
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">No RBI updates available at the moment</p>
            </div>
          )}
        </div>
        
        {/* GST Updates Section */}
        <div>
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <AlertTriangle className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold ml-3 text-gray-800">GST Updates</h3>
          </div>
          
          {gstUpdates.length > 0 ? (
            <div className="space-y-4">
              {gstUpdates.map((update) => (
                <div key={update.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-800">{update.title}</h4>
                  <p className="text-gray-600 mt-2">{update.content}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">
                      {new Date(update.created_at).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      GST
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">No GST updates available at the moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
