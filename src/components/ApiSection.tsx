import { useState } from 'react'
import { Icon } from './Icon'
import './api-section.css'

const examples = [
  {
    file: 'webhook.js',
    code: [
      '// Send an alert to an activated workflow.',
      'const response = await fetch(',
      '  process.env.NAIVANO_WEBHOOK_URL,',
      '  {',
      "    method: 'POST',",
      '    headers: {',
      "      'Content-Type': 'application/json',",
      "      'X-Webhook-Token': process.env.WEBHOOK_TOKEN,",
      '    },',
      '    body: JSON.stringify({',
      "      source: 'monitoring',",
      "      title: 'Low disk space',",
      "      device: 'SERVER-01',",
      '    }),',
      '  },',
      ')',
      '',
      'if (!response.ok) {',
      '  throw new Error(await response.text())',
      '}',
      'const { executionId } = await response.json()',
    ].join('\n'),
  },
  {
    file: 'response.json',
    code: '{\n  "executionId": "64d2ef730bd54a118c9f4a22"\n}',
  },
  {
    file: 'inventory.js',
    code: [
      '// Run in a signed-in Naivano dashboard.',
      "const response = await fetch('/api/inventory')",
      '',
      'if (!response.ok) throw new Error(await response.text())',
      '',
      'const inventory = await response.json()',
      'console.log(inventory)',
    ].join('\n'),
  },
] as const

const syntax = /(\/\/.*$)|(['"][^'"]*['"])|(\b(?:const|await|if|throw|new)\b)|(\b\w+(?=\s*:))|(\b\w+(?=\s*\())/g
const tokenClasses = ['comment', 'string', 'keyword', 'property', 'function']

function highlight(line: string) {
  let offset = 0
  const parts = [...line.matchAll(syntax)].flatMap(match => {
    const start = match.index
    const text = line.slice(offset, start)
    offset = start + match[0].length
    const kind = tokenClasses[match.slice(1).findIndex(Boolean)]
    return [text, <span className={`api-token-${kind}`} key={start}>{match[0]}</span>]
  })
  return [...parts, line.slice(offset)]
}

export function ApiSection() {
  const [selected, setSelected] = useState(0)
  const example = examples[selected]
  const lines = example.code.split('\n')

  return <section className="api-section" id="api" aria-labelledby="api-title">
    <div className="api-section-inner">
      <div className="api-pitch">
        <p className="section-label"><span aria-hidden="true" /> API &amp; Webhooks</p>
        <h2 id="api-title">Your tools.<br />Connected to Naivano.</h2>
        <p>Turn a monitoring alert into a service desk ticket. Send an event to an activated Naivano workflow, then let its steps handle the ticket and assignment.</p>
        <p>Each webhook has its own URL and configured authentication. A successful request returns an execution ID while the workflow runs in the background.</p>
        <ol className="api-flow" aria-label="Example integration flow">
          <li><span>Monitoring</span> sends an alert</li>
          <li><span>Webhook</span> starts your workflow</li>
          <li><span>Service desk</span> receives the ticket</li>
        </ol>
      </div>

      <div className="api-workspace">
        <div className="api-editor">
          <div className="api-editor-body">
            <nav className="api-explorer" aria-label="Code examples">
              <span className="api-explorer-label">Explorer</span>
              <strong><Icon name="chevron" /> Examples</strong>
              {examples.map(({ file }, index) => (
                <button type="button" key={file} aria-pressed={selected === index} onClick={() => {
                  setSelected(index)
                }}>
                  <span aria-hidden="true" data-json={file.endsWith('.json')}>{file.endsWith('.json') ? '{}' : 'JS'}</span>{file}
                </button>
              ))}
            </nav>
            <div className="api-source">
              <div className="api-source-tab">{example.file}</div>
              <pre aria-label={`Example code ${example.file}`} tabIndex={0}><code>
                {lines.map((line, index) => (
                  <span className="api-code-line" data-line={index + 1} key={index}>{highlight(line)}{index < lines.length - 1 ? '\n' : ''}</span>
                ))}
              </code></pre>
            </div>
          </div>
        </div>
        <div className="api-response-note">
          <span className="api-response-code">202 Accepted</span>
          <span>The workflow runs asynchronously.</span>
        </div>
        <p className="api-example-note">Example configuration. Use the URL and token configured for your workflow. The inventory example uses your signed-in dashboard session.</p>
      </div>
    </div>
  </section>
}
