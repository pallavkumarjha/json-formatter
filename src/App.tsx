/* eslint-disable */
import { useState } from 'react'
import { FileJson, ArrowRightLeft, AlertCircle, Check, Wand2, ChevronRight, ChevronDown, SunIcon, MoonIcon, Mail, Linkedin } from 'lucide-react'
import { Analytics } from "@vercel/analytics/react"
// import Lottie from 'lottie-react';
import OpenAI from 'openai'
// import animationData from './animations/hamster.json'; // Make sure to replace with the correct path

// import Link from "next/link";
import { Heart } from "lucide-react";
// import Image from "next/image";

import './app.css'
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: This is not recommended for production
})

const CollapsibleJSON: React.FC<{ data: any }> =({ data }) => {
  const [isCollapsed, setIsCollapsed] = useState({});

  const toggleCollapse = (key) => {
    setIsCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderValue = (value: any, key: any) => {
    if (typeof value === 'object' && value !== null) {
      const isArray = Array.isArray(value);
      return (
        <div key={key}>
          <span
            onClick={() => toggleCollapse(key)}
            className="cursor-pointer inline-flex items-center"
          >
            {isCollapsed[key] ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {isArray ? '[' : '{'}
          </span>
          {!isCollapsed[key] && (
            <div className="ml-4">
              {Object.entries(value).map(([k, v]) => (
                <div key={k}>
                  <span className="text-blue-600">{isArray ? '' : `"${k}": `}</span>
                  {renderValue(v, `${key}.${k}`)}
                </div>
              ))}
            </div>
          )}
          {isCollapsed[key] && <span>...</span>}
          <span>{isArray ? ']' : '}'}</span>
        </div>
      );
    }
    return (
      <span className={typeof value === 'string' ? 'text-green-600' : 'text-red-600'}>
        {JSON.stringify(value)}
      </span>
    );
  };

  return <div>{renderValue(data, 'root')}</div>;
};

function App() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [aiExplanation, setAiExplanation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFormatted, setIsFormatted] = useState(false)
  const [showFixButton, setShowFixButton] = useState(false)
  const [isAiFixing, setIsAiFixing] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

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
      setShowFixButton(true)
    } finally {
      setIsLoading(false)
    }
  }

  const fixJSON = async () => {
    setIsAiFixing(true)
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "You are a helpful assistant that fixes JSON structures. Respond only with the fixed JSON, nothing else." },
          { role: "user", content: `Fix this JSON: ${input}` }
        ],
        model: "gpt-3.5-turbo",
      });
      const fixedJsonString: any = completion.choices[0].message.content;
      try {
        setOutput(JSON.stringify(JSON.parse(fixedJsonString), null, 2));
        setIsFormatted(true);
        setError('');
        setShowFixButton(false);
      } catch (parseError) {
        setError("AI couldn't fix the JSON. Please check your input and try again.");
      }
    } catch (aiError) {
      setError('Failed to get AI fix: ' + (aiError as Error).message);
    } finally {
      setIsLoading(false);
      setIsAiFixing(false);
    }
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-rose-100 via-pink-100 to-indigo-200'} flex flex-col`}>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold text-rose-500 flex transition-transform transform hover:scale-105">
            <FileJson className="mr-3 h-10 w-10 text-rose-600" /> AI JSON Formatter & Fixer
          </h1>
          <button
            onClick={toggleDarkMode}
            className={`w-12 h-11 border border-transparent text-lg font-semibold rounded-full shadow-lg text-white flex items-center justify-center transition-all duration-200 ease-in-out transform hover:scale-105 ${
              isDarkMode ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-300' : 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-300'
            }`}
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        <h2 className={`text-xl font-light ${isDarkMode ? 'text-gray-300' : 'text-gray-800'} flex mb-4 font-sans`}>
          Format and fix JSON with AI.
        </h2>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl`}>
          <div className="p-8 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label htmlFor="input" className={`block text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Input JSON
                </label>
                <div className="relative">
                  <textarea
                    id="input"
                    className={`w-full h-96 p-4 pl-10 border-2 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-gray-50'} rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 ease-in-out`}
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
                <label htmlFor="output" className={`block text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Formatted JSON
                </label>
                <div
                  id="output"
                  className={`w-full h-96 p-4 border-2 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'} rounded-lg overflow-auto`}
                  style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
                >
                  {isFormatted && <CollapsibleJSON data={JSON.parse(output)} />}
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-center w-100">
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
             { showFixButton && (<button
                onClick={fixJSON}
                className={`
                  inline-flex items-center px-6 py-3 ml-5 border border-transparent text-lg font-semibold rounded-full shadow-lg text-white
                  ${isAiFixing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-4 focus:ring-indigo-300'}
                  transition-all duration-200 ease-in-out transform hover:scale-105
                `}
                disabled={isLoading || isAiFixing}
              >
                {isAiFixing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    AI Fixing...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 -ml-1 h-6 w-6" />
                    Fix with AI
                  </>
                )}
              </button>)}
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
        <p className={`text-sm font-light ${isDarkMode ? 'text-gray-300' : 'text-gray-800'} flex mb-4 justify-center font-sans text-center rounded-lg p-4`}>
          AI can make mistakes. Please double check the output.
        </p>
        {/* <Lottie animationData={animationData} loop={true} 
          style={{ width: 100, height: 100, position: 'fixed', top: '50px', left: '10px', opacity: 0.5 }} 
          className="rounded-full mx-auto" /> */}
      </main>
      <footer className={`bg-gray-900 text-white py-16  mt-16 ${isDarkMode ? 'bg-gray-800' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center md:text-left">
          <div className="col-span-1 md:col-span-1">
            <div className="flex flex-col md:flex-row md:items-start items-center md:justify-start justify-center">
              <a
                href="/"
                className="text-3xl flex items-center space-x-2"
              >
                <span>AI JSON Formatter</span>
              </a>
            </div>
            <p className="mt-2 text-sm italic text-center md:text-left">
              Your ultimate JSON formatter!!
            </p>
            <div className="mt-4 text-center md:text-left">
              <p className="text-sm">
                Made with{" "}
                <Heart className="inline-block w-4 h-4 text-indigo-500" /> by{" "}
                <a
                  href="https://x.com/the_visutor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline hover:no-underline"
                >
                  Pallav
                </a>
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-2">Features</h3>
            <ul className="space-y-2">
              <li>
                <span
                  className="transition-colors"
                >
                  Format JSON
                </span>
              </li>
              <li>
                <span
                  className="transition-colors"
                >
                  JSON fixer using AI
                </span>
              </li>
              <li>
                <span
                  className="transition-colors"
                >
                  Upload JSON files{" "}
                  <span className="ml-1 text-xs font-medium bg-orange-100 dark:bg-blue-900 text-orange-600 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                </span>
              </li>
              <li>
                <span
                  className="transition-colors"
                >
                  Diff Highlighter{" "}
                  <span className="ml-1 text-xs font-medium bg-green-100 dark:bg-blue-900 text-green-600 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Connect With Me</h3>
            <div className="flex justify-center md:justify-start space-x-3">
                <a
                href="mailto:pallavkumarjha26@gmail.com"
                className="group"
                >
                <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                  <Mail className="w-5 h-5 text-pink-500 group-hover:text-pink-600" />
                </div>
                </a>
              <a
                href="https://x.com/the_visutor"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-gray-700 group-hover:text-gray-800"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
              </a>
              <a
                href="https://www.linkedin.com/in/pallavkumarjha/"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Linkedin className="w-5 h-5 text-pink-500 group-hover:text-pink-600" />
                </div>
              </a>
            </div>
            <div className="mt-4">
              <a
                href="https://www.buymeacoffee.com/pallavjha"
                target="_blank"
                className="inline-flex items-center transition-colors"
              >
                <img
                  src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                  alt="Buy Me A Coffee"
                  style={{ height: "100%", width: "150px" }}
                />
              </a>
            </div>
          </div>
        </div>

        <div className="text-center border-gray-200 dark:border-gray-700 pt-8">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} JSON Formatter. All rights reserved, except the ones we forgot to reserve.
          </p>
        </div>
      </div>
    </footer>
      {/* <footer className={`bg-gray-900 text-white mt-16 ${isDarkMode ? 'bg-gray-800' : ''}`}>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <p className="text-center text-sm">
            &copy; 2024 JSON Formatter. All rights reserved, except the ones we forgot to reserve.
          </p>
          <p className="text-center text-sm">
          <button
              onClick={() => window.open('https://buymeacoffee.com/pallavjha', '_blank')}
              className={`
                inline-flex items-center px-4 py-2 text-sm 
                bg-transparent focus:ring-4 focus:ring-yellow-300
                transition-all duration-200 ease-in-out transform hover:scale-105
              `}
            >
              <CoffeeIcon style={{ marginRight: '12px'}} />
              Buy Me a Coffee
            </button>
          </p>

        </div>
      </footer> */}
      <Analytics />
    </div>
  )
}

export default App
