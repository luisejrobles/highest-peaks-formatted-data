import React, { useState } from 'react';
import './App.css';

type FormatType = 'nested' | 'json' | 'yaml' | null;

interface Peak {
  name: string;
  elevation: number;
  location: string;
  country: string;
  firstAscent: number;
}

const App: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<FormatType>(null);
  const [outputData, setOutputData] = useState<string>('');
  const [dataRetrieved, setDataRetrieved] = useState<boolean>(false);

  // Sample peak data
  const peaksData: Peak[] = [
    {
      name: "Mount Everest",
      elevation: 8848,
      location: "Mahalangur Himal",
      country: "Nepal/China",
      firstAscent: 1953
    },
    {
      name: "K2",
      elevation: 8611,
      location: "Baltoro Karakoram",
      country: "Pakistan/China",
      firstAscent: 1954
    },
    {
      name: "Kangchenjunga",
      elevation: 8586,
      location: "Kangchenjunga Himalaya",
      country: "Nepal/India",
      firstAscent: 1955
    },
    {
      name: "Lhotse",
      elevation: 8516,
      location: "Mahalangur Himal",
      country: "Nepal/China",
      firstAscent: 1956
    },
    {
      name: "Makalu",
      elevation: 8485,
      location: "Mahalangur Himal",
      country: "Nepal/China",
      firstAscent: 1955
    }
  ];

  const formatData = (format: FormatType): string => {
    switch (format) {
      case 'nested':
        return peaksData.map(peak => 
          `${peak.name}\n` +
          `  Elevation: ${peak.elevation}m\n` +
          `  Location: ${peak.location}\n` +
          `  Country: ${peak.country}\n` +
          `  First Ascent: ${peak.firstAscent}\n`
        ).join('\n');
      
      case 'json':
        return JSON.stringify(peaksData, null, 2);
      
      case 'yaml':
        // Simple YAML formatting without js-yaml for now
        return peaksData.map(peak => 
          `- name: ${peak.name}\n` +
          `  elevation: ${peak.elevation}\n` +
          `  location: ${peak.location}\n` +
          `  country: ${peak.country}\n` +
          `  firstAscent: ${peak.firstAscent}`
        ).join('\n');
      
      default:
        return '';
    }
  };

  const handleFormatSelect = (format: FormatType) => {
    setSelectedFormat(format);
    setDataRetrieved(false);
    setOutputData('');
  };

  const handleGetData = () => {
    if (selectedFormat) {
      const formattedData = formatData(selectedFormat);
      setOutputData(formattedData);
      setDataRetrieved(true);
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
            disabled={!selectedFormat}
          >
            Get Data
          </button>
          
          <button
            className="action-btn download-btn"
            onClick={handleDownload}
            disabled={!dataRetrieved}
          >
            Download Data
          </button>
        </div>

        <div className="output-section">
          <h2>Output:</h2>
          <textarea
            className="output-textbox"
            value={outputData}
            readOnly
            placeholder="Select a format and click 'Get Data' to see the formatted output..."
          />
        </div>
      </main>
    </div>
  );
};

export default App;
