import React, { useState } from 'react';
import CharacterCreator from './components/CharacterCreator';
import StoryboardCreator from './components/StoryboardCreator';
import { UserCircle, Clapperboard } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'character' | 'storyboard'>('character');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Clapperboard className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">AI Video Storyboard</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
            <button
              onClick={() => setActiveTab('character')}
              className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'character'
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <UserCircle className="w-4 h-4 mr-2" />
              Bikin Karakter
            </button>
            <button
              onClick={() => setActiveTab('storyboard')}
              className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'storyboard'
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Clapperboard className="w-4 h-4 mr-2" />
              Story Board
            </button>
          </div>
        </div>

        <div className="transition-all duration-300 ease-in-out">
          <div style={{ display: activeTab === 'character' ? 'block' : 'none' }}>
            <CharacterCreator />
          </div>
          <div style={{ display: activeTab === 'storyboard' ? 'block' : 'none' }}>
            <StoryboardCreator />
          </div>
        </div>
      </main>
    </div>
  );
}
