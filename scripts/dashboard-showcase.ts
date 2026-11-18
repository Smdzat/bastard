import { copyFileSync, cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

interface ConsolePages {
  PAGES: Array<{ paths: string[] }>
  clientModule(): string
}

interface Roles {
  ADMIN: string
  GRANTABLE_CAPS: Record<string, readonly string[]>
  capabilitiesOf(role: string, grants?: string[]): Iterable<string>
}

export function dashboardShowcase(site: string, dashboard: string) {
  const load = createRequire(join(dashboard, 'package.json'))
  const { PAGES, clientModule } = load('./console-pages') as ConsolePages
  const { ADMIN, GRANTABLE_CAPS, capabilitiesOf } = load('./roles') as Roles
  load('./workflow/nodes/core')
  const { describe } = load('./workflow/registry') as { describe(): unknown[] }
  const routes = PAGES.flatMap(page => page.paths)
  const pageMatchers = routes.map(route => new RegExp(`^${route.replace(/:[^/]+/g, '[^/]+')}/?$`))
  // Vite serves these files in development and copies them into the static build.
  const publicDir = join(site, 'node_modules', '.cache', 'nevian-showcase')
  const dashboardPublic = join(dashboard, 'public')
  mkdirSync(publicDir, { recursive: true })
  cpSync(join(site, 'public'), publicDir, { recursive: true })
  for (const folder of ['assets', 'catalog', 'js', 'shared', 'vendor']) {
    cpSync(join(dashboardPublic, folder), join(publicDir, folder), { recursive: true })
  }
  copyFileSync(join(dashboardPublic, 'favicon.ico'), join(publicDir, 'favicon.ico'))
  copyFileSync(join(dashboard, 'deploy', 'mock-api.js'), join(publicDir, 'nevian-mock-api.js'))
  writeFileSync(join(publicDir, 'shared', 'console-pages.js'), clientModule())

  const org = { id: 'nevian-demo', name: 'Naivano Demo', logoUrl: '/assets/naivano-mark.png' }
  const profileOrg = { orgId: org.id, orgName: org.name }
  const seed = {
    org,
    profileOrg,
    workflowNodes: describe(),
    profile: {
      uid: 'demo-admin', displayName: 'Morgan Lee', email: 'morgan.lee@example.test',
      role: ADMIN, capabilities: [...capabilitiesOf(ADMIN, Object.keys(GRANTABLE_CAPS))], ...profileOrg,
    },
    roles: {
      myRole: ADMIN, myRoleLabel: 'Administrator',
      grantable: [{ role: 'agent', label: 'Service desk' }, { role: 'user', label: 'Employee' }],
    },
    articles: [
      { title: 'VPN connection checklist', body: 'Check the network connection, confirm that the VPN client is current, then retry. If the issue persists, attach the error message to the ticket.' },
      { title: 'Prepare a laptop for a new starter', body: 'Check the assigned device in Fleet, install the required applications and verify that the employee can sign in.' },
    ],
  }
  const demoApi = readFileSync(join(site, 'scripts', 'dashboard-demo-api.js'), 'utf8')
  writeFileSync(join(publicDir, 'nevian-demo-api.js'), 'window.nevianDemoSeed = ' + JSON.stringify(seed) + ';\n' + demoApi)
  copyFileSync(join(site, 'scripts', 'dashboard-demo.css'), join(publicDir, 'nevian-demo.css'))

  const homeNav = `<nav class="demo-home-nav demo-home-nav-standalone" aria-label="Demo navigation">
    <a href="/" class="demo-home-brand" aria-label="Naivano home"><img src="/assets/naivano-logo.webp" alt="" width="576" height="126"></a>
    <span class="demo-home-mode">Sample data</span>
    <div class="demo-home-actions">
      <a href="/" class="demo-home-link"><span aria-hidden="true">←</span> Back to home</a>
      <button type="button" class="demo-workspace-menu" aria-controls="sidebar" aria-expanded="false" aria-label="Open dashboard menu"><span aria-hidden="true">☰</span></button>
    </div>
  </nav><div class="demo-workspace-scrim" aria-hidden="true"></div>`
  const page = readFileSync(join(dashboardPublic, 'admin-console.html'), 'utf8')
    .replace('<head>', '<head>\n<script src="/nevian-mock-api.js"></script>\n<script src="/nevian-demo-api.js"></script>')
    .replace('placeholder="Search tickets, ticket numbers, devices, users…"', 'placeholder="Search tickets, devices, people…" aria-label="Search Naivano"')
    .replace('</head>', '<link rel="stylesheet" href="/nevian-demo.css">\n<link rel="stylesheet" href="/demo-home-nav.css">\n</head>')
    .replace('<div id="admin-shell"', `${homeNav}\n<div id="admin-shell"`)
  writeFileSync(join(publicDir, 'nevian-demo.html'), page)
  const staticRoutes = [...routes.filter(route => !route.includes(':')), '/tickets/open-tickets']
  for (const route of staticRoutes) {
    const dir = join(publicDir, route.slice(1))
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), page)
  }
  const redirects = routes.map(route => `${route} /nevian-demo.html 200`)
  redirects.push('/login / 302')
  writeFileSync(join(publicDir, '_redirects'), `${redirects.join('\n')}\n/* /index.html 200\n`)

  function routeDemo(req: IncomingMessage, res: ServerResponse, next: () => void) {
    const pathname = new URL(req.url || '/', 'http://localhost').pathname
    if (pathname === '/login') {
      res.writeHead(302, { Location: '/' }).end()
      return
    }
    if (pageMatchers.some(pattern => pattern.test(pathname))) req.url = '/nevian-demo.html'
    next()
  }

  const plugin: Plugin = {
    name: 'nevian-dashboard-showcase',
    configureServer(server) { server.middlewares.use(routeDemo) },
    configurePreviewServer(server) { server.middlewares.use(routeDemo) },
  }
  return { publicDir, plugin }
}
