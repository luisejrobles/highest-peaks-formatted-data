import React, { useState } from 'react';
import './App.css';

// Import the prompt concatenation function
let getPromptForFormat: any;
try {
  const promptsModule = require('../prompts/main.js');
  getPromptForFormat = promptsModule.getPromptForFormat;
  console.log('Prompts module loaded successfully:', promptsModule);
  console.log('Available exports:', Object.keys(promptsModule));
} catch (error) {
  console.error('Failed to load prompts module:', error);
  // Fallback function that concatenates main_prompt with format
  getPromptForFormat = (format: string, location: string) => {
    const locationPrompts = {
      mexico: "5 highest Mexico peaks: Name, Alt (m), Location as Country, State.",
      latinAmerica: "5 highest peaks in Latam: Name, Alt (m), Location as Country, State.",
      world: "5 highest peaks in the world with: Name, Alt (m), Location as Country, State."
    };
    
    const main_prompt = locationPrompts[location as keyof typeof locationPrompts] || locationPrompts.latinAmerica;
    
    const formatPrompts = {
      json: `as the following json format: 
### Example:
[
    {
        "name": "Cotopaxi",
        "altitude": "5897 m.s.n.m",
        "location": "Latacunga, Ecuador"
    }
]`,
      nested: `as the following nested text data format: 
### Example:
- name: Cotopaxi
  altitude: 5897 m.s.n.m
  location: Latacunga, Ecuador`,
      yaml: `as the following yaml format: 
### Example:
- name: Cotopaxi
  altitude: 5897 m.s.n.m
  location: Latacunga, Ecuador`
    };
    return `${main_prompt} ${formatPrompts[format as keyof typeof formatPrompts] || ''}`;
  };
}

type FormatType = 'nested' | 'json' | 'yaml' | null;
type LocationType = 'mexico' | 'latinAmerica' | 'world';

interface Peak {
  name: string;
  altitude: string;
  location: string;
}

const App: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<FormatType>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationType>('latinAmerica');
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

  const handleLocationSelect = (location: LocationType) => {
    console.log('Location selected:', location);
    setSelectedLocation(location);
    setDataRetrieved(false);
    setOutputData('');
    setError('');
  };

  const handleGetData = async () => {
    console.log('Get Data clicked!');
    console.log('Selected format:', selectedFormat);
    console.log('Selected location:', selectedLocation);
    
    if (!selectedFormat) {
      console.log('No format selected, returning');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      console.log('Getting prompt for format:', selectedFormat, 'and location:', selectedLocation);
      const prompt = getPromptForFormat(selectedFormat, selectedLocation);
      console.log('Generated concatenated prompt:', prompt);
      
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
        filename = 'highest_peaks.txt';
        mimeType = 'text/plain';
        break;
      case 'json':
        filename = 'highest_peaks.json';
        mimeType = 'application/json';
        break;
      case 'yaml':
        filename = 'highest_peaks.yml';
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
        <h1>Highest Peaks Data</h1>
        <p>Get formatted mountain peaks data in the necessary format</p>
      </header>
      
      <main className="App-main">
        <div className="section location-section">
          <h2>Select Location</h2>
          <div className="location-buttons">
            <button
              className={`btn btn-secondary location-btn ${selectedLocation === 'mexico' ? 'active' : ''}`}
              onClick={() => handleLocationSelect('mexico')}
            >
              Mexico
            </button>
            <button
              className={`btn btn-secondary location-btn ${selectedLocation === 'latinAmerica' ? 'active' : ''}`}
              onClick={() => handleLocationSelect('latinAmerica')}
            >
              Latin America
            </button>
            <button
              className={`btn btn-secondary location-btn ${selectedLocation === 'world' ? 'active' : ''}`}
              onClick={() => handleLocationSelect('world')}
            >
              World
            </button>
          </div>
        </div>

        <div className="section format-section">
          <h2>Select Output Format</h2>
          <div className="format-buttons">
            <button
              className={`btn btn-secondary format-btn ${selectedFormat === 'nested' ? 'active' : ''}`}
              onClick={() => handleFormatSelect('nested')}
            >
              Nested Text Data
            </button>
            <button
              className={`btn btn-secondary format-btn ${selectedFormat === 'json' ? 'active' : ''}`}
              onClick={() => handleFormatSelect('json')}
            >
              JSON
            </button>
            <button
              className={`btn btn-secondary format-btn ${selectedFormat === 'yaml' ? 'active' : ''}`}
              onClick={() => handleFormatSelect('yaml')}
            >
              YAML
            </button>
          </div>
        </div>

        <div className="action-section">
          <button
            className="btn btn-primary get-data-btn"
            onClick={handleGetData}
            disabled={!selectedFormat || isLoading}
          >
            {isLoading ? 'Getting Data...' : 'Get Data'}
          </button>
          
          <button
            className="btn btn-success download-btn"
            onClick={handleDownload}
            disabled={!dataRetrieved}
          >
            Download Data
          </button>
        </div>

        {error && (
          <div className="error-section">
            <h3>Error</h3>
            <p className="error-message">{error}</p>
          </div>
        )}

        <div className="section output-section">
          <h2>Output</h2>
          <textarea
            className="output-textbox"
            value={outputData}
            readOnly
            placeholder={isLoading ? "Loading data from OpenAI..." : "Select a location, format and click 'Get Data' to see the formatted output..."}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
