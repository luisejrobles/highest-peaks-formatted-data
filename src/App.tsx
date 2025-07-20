import React, { useState } from 'react';
import './App.css';

// Try different import approaches
let getPromptForFormat: any;
try {
  const promptsModule = require('../prompts/main.js');
  getPromptForFormat = promptsModule.getPromptForFormat;
  console.log('Prompts module loaded successfully:', promptsModule);
} catch (error) {
  console.error('Failed to load prompts module:', error);
  // Fallback function
  getPromptForFormat = (format: string) => {
    const main_prompt = "Give the list of the 20 highest peaks in latin america. Name, Altitude as m.s.n.m (meters above sea level), and Location as State, Country. Output data";
    return main_prompt + " in " + format + " format";
  };
}

type FormatType = 'nested' | 'json' | 'yaml' | null;

interface Peak {
  name: string;
  altitude: string;
  location: string;
}

const App: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<FormatType>(null);
  const [outputData, setOutputData] = useState<string>('');
  const [dataRetrieved, setDataRetrieved] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const callOpenAI = async (prompt: string): Promise<string> => {
    console.log('Calling OpenAI with prompt:', prompt);
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    
    console.log('API Key exists:', !!apiKey);
    console.log('API Key is placeholder:', apiKey === 'your_openai_api_key_here');
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      throw new Error('Please set your OpenAI API key in the .env file');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response from OpenAI';
  };

  const handleFormatSelect = (format: FormatType) => {
    console.log('Format selected:', format);
    setSelectedFormat(format);
    setDataRetrieved(false);
    setOutputData('');
    setError('');
  };

  const handleGetData = async () => {
    console.log('Get Data clicked!');
    console.log('Selected format:', selectedFormat);
    
    if (!selectedFormat) {
      console.log('No format selected, returning');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      console.log('Getting prompt for format:', selectedFormat);
      const prompt = getPromptForFormat(selectedFormat);
      console.log('Generated prompt:', prompt);
      
      const result = await callOpenAI(prompt);
      console.log('OpenAI result:', result);
      
      setOutputData(result);
      setDataRetrieved(true);
    } catch (err) {
      console.error('Error in handleGetData:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setDataRetrieved(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!dataRetrieved || !outputData) return;

    let filename = '';
    let mimeType = '';

    switch (selectedFormat) {
      case 'nested':
        filename = 'peaks.txt';
        mimeType = 'text/plain';
        break;
      case 'json':
        filename = 'peaks.json';
        mimeType = 'application/json';
        break;
      case 'yaml':
        filename = 'peaks.yml';
        mimeType = 'text/yaml';
        break;
    }

    const blob = new Blob([outputData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Highest Peaks Data Formatter</h1>
        <p>Get the 20 highest peaks in Latin America via OpenAI</p>
      </header>
      
      <main className="App-main">
        <div className="format-section">
          <h2>Select Output Format:</h2>
          <div className="format-buttons">
            <button
              className={`format-btn ${selectedFormat === 'nested' ? 'active' : ''}`}
              onClick={() => handleFormatSelect('nested')}
            >
              Nested Text Data
            </button>
            <button
              className={`format-btn ${selectedFormat === 'json' ? 'active' : ''}`}
              onClick={() => handleFormatSelect('json')}
            >
              JSON
            </button>
            <button
              className={`format-btn ${selectedFormat === 'yaml' ? 'active' : ''}`}
              onClick={() => handleFormatSelect('yaml')}
            >
              YAML
            </button>
          </div>
        </div>

        <div className="action-section">
          <button
            className="action-btn get-data-btn"
            onClick={handleGetData}
            disabled={!selectedFormat || isLoading}
          >
            {isLoading ? 'Getting Data...' : 'Get Data'}
          </button>
          
          <button
            className="action-btn download-btn"
            onClick={handleDownload}
            disabled={!dataRetrieved}
          >
            Download Data
          </button>
        </div>

        {error && (
          <div className="error-section">
            <h3>Error:</h3>
            <p className="error-message">{error}</p>
          </div>
        )}

        <div className="output-section">
          <h2>Output:</h2>
          <textarea
            className="output-textbox"
            value={outputData}
            readOnly
            placeholder={isLoading ? "Loading data from OpenAI..." : "Select a format and click 'Get Data' to see the formatted output..."}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
