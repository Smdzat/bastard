import './technology-strip.css'

type Technology = {
  name: string
  asset?: string
  wordmark?: boolean
  detail?: string
  planned?: boolean
}

const technologies: Technology[] = [
  { name: 'Microsoft', asset: 'microsoft-6.svg', wordmark: true },
  { name: 'Windows Server', asset: 'windows-server.svg', wordmark: true },
  { name: 'Microsoft Azure', asset: 'azure-2.svg' },
  { name: 'Microsoft Intune', detail: 'Agent deployment' },
  { name: 'Veeam Backup', planned: true },
  { name: 'Microsoft Entra ID', asset: 'azure-active-directory.svg' },
  { name: 'Windows', asset: 'windows-darkblue-2012-svg.svg', wordmark: true },
  { name: 'Microsoft 365' },
  { name: 'CrowdStrike', planned: true },
  { name: 'PowerShell', asset: 'powershell.svg' },
]

export function TechnologyStrip() {
  return <section id="technologien" className="technology-strip" aria-labelledby="technology-strip-title">
    <div className="technology-strip-header">
      <h2 className="section-label" id="technology-strip-title"><span aria-hidden="true" /> Platforms and tools</h2>
    </div>
    <div className="technology-strip-viewport">
      <div className="technology-strip-track">
        {[false, true].map(duplicate => (
          <ul className="technology-strip-list" key={String(duplicate)} aria-hidden={duplicate || undefined} role="list">
            {technologies.map(({ name, asset, wordmark, detail, planned }) => (
              <li key={name} className="technology-strip-item">
                {asset && <img
                  className={wordmark ? 'technology-strip-wordmark' : 'technology-strip-symbol'}
                  src={`/assets/integrations/${asset}`}
                  alt={wordmark ? name : ''}
                  decoding="async"
                />}
                {!wordmark && <span>{name}</span>}
                {detail && <small className="technology-strip-detail">{detail}</small>}
                {planned && <small className="technology-strip-status">Planned</small>}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  </section>
}
