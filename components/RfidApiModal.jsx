'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Radio, Terminal, Cpu, Play } from 'lucide-react';

export default function RfidApiModal({ isOpen, onClose, onSimulatedScan }) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [hostUrl, setHostUrl] = useState('http://localhost:3000');
  const [sampleRoll, setSampleRoll] = useState('23CEB0B10');
  const [simStatus, setSimStatus] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostUrl(window.location.origin);
    }
  }, []);

  if (!isOpen) return null;

  const endpointUrl = `${hostUrl}/api/arcade/scan`;
  const fallbackUrl = `${hostUrl}/api/rfid/scan`;
  const secretKey = 'rc_arcade_rfid_2026';

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleCurl = `curl -X POST "${endpointUrl}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${secretKey}" \\
  -d '{"rollNumber": "${sampleRoll}"}'`;

  const arduinoSnippet = `// ESP32 / Arduino HTTP POST Example
#include <HTTPClient.h>

void sendRfidScan(String rollNo) {
  HTTPClient http;
  http.begin("${endpointUrl}");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", "${secretKey}");
  
  String payload = "{\\"rollNumber\\":\\"" + rollNo + "\\"}";
  int httpCode = http.POST(payload);
  
  if (httpCode > 0) {
    Serial.println("Scan sent! Response: " + http.getString());
  }
  http.end();
}`;

  const handleSimulate = async () => {
    if (!sampleRoll.trim()) return;
    setIsSimulating(true);
    setSimStatus({ type: 'loading', message: 'Sending test RFID scan request...' });

    try {
      const res = await fetch('/api/arcade/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': secretKey
        },
        body: JSON.stringify({ rollNumber: sampleRoll.trim().toUpperCase() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSimStatus({
          type: 'success',
          message: `Success! Student: "${data.player.name}" (${data.player.rollNumber}) added to Waiting List queue.`
        });
        if (onSimulatedScan) onSimulatedScan();
      } else {
        setSimStatus({
          type: 'error',
          message: data.error || 'Request failed'
        });
      }
    } catch (err) {
      setSimStatus({
        type: 'error',
        message: err.message || 'Network error'
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-3xl bg-[#0c121e] border border-[#1e293b] rounded-2xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2.5 mb-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-black tracking-wider text-white font-tech uppercase">
            EMBEDDED TEAM RFID API SPECIFICATIONS
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Specifications and documentation for ESP32, Arduino, Raspberry Pi, or any microcontroller sending student RFID taps.
        </p>

        {/* Reference Specifications Table (Styled exactly like Image 1) */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#080d16] mb-6">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/80">
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Parameter</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Value</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-200">HTTP Method</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold">
                    POST
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400">Must be POST</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-200">Endpoint URL</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 select-all">
                      {endpointUrl}
                    </span>
                    <button
                      onClick={() => copyToClipboard(endpointUrl, 'endpoint')}
                      className="text-slate-400 hover:text-cyan-400 transition-colors"
                      title="Copy URL"
                    >
                      {copiedKey === 'endpoint' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-400">Live endpoint for hardware</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-200">Header: Content-Type</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    application/json
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400">Required</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-200">Header: x-api-key</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-fuchsia-400">
                      {secretKey}
                    </span>
                    <button
                      onClick={() => copyToClipboard(secretKey, 'apikey')}
                      className="text-slate-400 hover:text-cyan-400 transition-colors"
                      title="Copy Key"
                    >
                      {copiedKey === 'apikey' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-400">Default secret key</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-200">Fallback URL</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                    {fallbackUrl}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400">Works identically as an alias</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-200">JSON Body Payload</td>
                <td className="py-3 px-4">
                  <pre className="text-[11px] text-amber-300 bg-slate-950 p-2 rounded border border-slate-800">
{`{
  "rollNumber": "23CEB0B10"
}`}
                  </pre>
                </td>
                <td className="py-3 px-4 text-slate-400">
                  Accepts <code className="text-cyan-400 font-bold">rollNumber</code>, <code className="text-cyan-400 font-bold">rollNo</code>, or <code className="text-cyan-400 font-bold">rfid</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Interactive RFID Hardware Simulator */}
        <div className="mb-6 p-4 rounded-xl border border-cyan-800/60 bg-gradient-to-br from-cyan-950/20 to-slate-900">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-cyan-400 uppercase tracking-wider font-tech">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>Interactive RFID Hardware Simulator</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Test the live hardware flow right now by sending a simulated RFID card scan:
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={sampleRoll}
                onChange={(e) => setSampleRoll(e.target.value.toUpperCase())}
                placeholder="Enter roll number e.g. 23CEB0B10"
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none"
              />
            </div>

            {/* Quick sample roll selectors */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {['23CEB0B10', '24CSM2R21', '23ECB1F04'].map((roll) => (
                <button
                  key={roll}
                  type="button"
                  onClick={() => setSampleRoll(roll)}
                  className="px-2 py-1 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  {roll}
                </button>
              ))}
            </div>

            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold font-mono tracking-wider bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center justify-center gap-1.5 shadow-neon-cyan transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isSimulating ? 'Sending...' : 'Simulate RFID Tap'}</span>
            </button>
          </div>

          {simStatus && (
            <div className={`mt-3 p-2.5 rounded-lg text-xs font-mono flex items-center gap-2 ${
              simStatus.type === 'success' 
                ? 'bg-emerald-950/80 border border-emerald-600/50 text-emerald-300'
                : simStatus.type === 'error'
                ? 'bg-rose-950/80 border border-rose-600/50 text-rose-300'
                : 'bg-slate-800 text-slate-300'
            }`}>
              <span>{simStatus.message}</span>
            </div>
          )}
        </div>

        {/* cURL and Arduino snippets tabs */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1 font-mono">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-fuchsia-400" />
                cURL Test Command
              </span>
              <button
                onClick={() => copyToClipboard(sampleCurl, 'curl')}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                {copiedKey === 'curl' ? 'Copied!' : 'Copy cURL'}
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-black/80 border border-slate-800 text-[11px] font-mono text-fuchsia-300 overflow-x-auto">
              {sampleCurl}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1 font-mono">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                ESP32 / Arduino Microcontroller Code Snippet
              </span>
              <button
                onClick={() => copyToClipboard(arduinoSnippet, 'arduino')}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                {copiedKey === 'arduino' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-black/80 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-40">
              {arduinoSnippet}
            </pre>
          </div>
        </div>

        {/* Close Button at footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            Close Specs
          </button>
        </div>

      </div>
    </div>
  );
}
