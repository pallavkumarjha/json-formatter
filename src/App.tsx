import React, { useState } from 'react'
import { FileJson, ArrowRightLeft, AlertCircle, Check, Github, Search } from 'lucide-react'

function App() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [aiExplanation, setAiExplanation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFormatted, setIsFormatted] = useState(false)

  const formatJSON = async () => {
    setIsLoading(true)
    setError('')
    setAiExplanation('')
    setIsFormatted(false)
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, 2))
      setIsFormatted(true)
    } catch (e) {
      setError('Invalid JSON: ' + (e as Error).message)
      setOutput('')
      setAiExplanation("AI explanation would appear here if connected to OpenAI API.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-indigo-200 flex flex-col">
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
          <div className="p-8 sm:p-10">
            <h1 className="text-3xl font-bold text-rose-500 flex items-center justify-center mb-8">
              <FileJson className="mr-2 h-8 w-8" /> JSON Formatter
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label htmlFor="input" className="block text-lg font-semibold text-gray-700">
                  Input JSON
                </label>
                <div className="relative">
                  <Search className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                  <textarea
                    id="input"
                    className="w-full h-80 p-4 pl-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 ease-in-out bg-gray-50"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste your JSON here..."
                    style={{
                      boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
                    }}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label htmlFor="output" className="block text-lg font-semibold text-gray-700">
                  Formatted JSON
                </label>
                <textarea
                  id="output"
                  className="w-full h-80 p-4 border-2 border-gray-200 rounded-lg bg-white"
                  value={output}
                  readOnly
                  placeholder="Formatted JSON will appear here..."
                  style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
                />
              </div>
            </div>
            <div className="mt-8 flex justify-center">
              <button
                onClick={formatJSON}
                className={`
                  inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-full shadow-lg text-white
                  ${isLoading ? 'bg-rose-400 cursor-not-allowed' : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-rose-300'}
                  transition-all duration-200 ease-in-out transform hover:scale-105
                `}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="mr-2 -ml-1 h-6 w-6" />
                    Format JSON
                  </>
                )}
              </button>
            </div>
          </div>
          {(error || isFormatted) && (
            <div className={`px-8 py-6 ${error ? 'bg-red-50' : 'bg-green-50'} transition-all duration-300 ease-in-out`}>
              <div className={`rounded-lg p-4 ${error ? 'bg-red-100' : 'bg-green-100'} shadow-inner`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {error ? (
                      <AlertCircle className="h-6 w-6 text-red-400" aria-hidden="true" />
                    ) : (
                      <Check className="h-6 w-6 text-green-400" aria-hidden="true" />
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-lg font-medium ${error ? 'text-red-800' : 'text-green-800'}`}>
                      {error ? 'Error' : 'Success'}
                    </h3>
                    <div className={`mt-2 text-sm ${error ? 'text-red-700' : 'text-green-700'}`}>
                      <p>{error || 'JSON formatted successfully!'}</p>
                    </div>
                    {aiExplanation && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-800">AI Explanation:</h4>
                        <p className="mt-1 text-sm text-gray-600">{aiExplanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <p className="text-center text-sm">
            &copy; 2024 JSON Formatter. All rights reserved.
          </p>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">
            <Github className="h-6 w-6" />
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App