// Loaded only by the static showcase. The seed is provided by dashboard-showcase.ts.
((seed) => {
  const baseFetch = window.fetch.bind(window);
  const hour = 60 * 60 * 1000;
  const date = hoursAgo => new Date(Date.now() - hoursAgo * hour).toISOString();
  const tenantId = '00000000-0000-4000-8000-000000000001';
  const people = [
    ['demo-admin', 'Morgan Lee', 'morgan.lee', 'IT Operations', 'IT Operations Lead', 'admin'],
    ['demo-user', 'Jamie Smith', 'jamie.smith', 'Client Services', 'Support Specialist', 'user'],
    ['demo-user2', 'Alex Müller', 'alex.mueller', 'IT Operations', 'Endpoint Engineer', 'agent'],
    ['demo-samira', 'Samira Klein', 'samira.klein', 'Client Services', 'Service Coordinator', 'iap'],
    ['demo-luca', 'Luca Weber', 'luca.weber', 'Workplace Services', 'Workplace Coordinator', 'logistics'],
  ].map(([uid, displayName, handle, department, jobTitle, role]) => ({
    uid, id: uid, displayName, department, jobTitle, role, accountEnabled: true,
    mail: `${handle}@example.test`, email: `${handle}@example.test`, userPrincipalName: `${handle}@example.test`,
    companyId: 'demo-northstar', lastLoginAt: date(3),
  }));
  const departments = ['IT Operations', 'Client Services', 'Workplace Services'].map((name, i) => ({ id: `dept-${i}`, name, path: name }));
  const companies = [
    { id: 'demo-northstar', name: 'Northstar Services', active: true, entraTenantIds: [tenantId], memberCount: people.length, iapCount: 1 },
    { id: 'demo-studio', name: 'Northstar Studio', active: true, entraTenantIds: [], memberCount: 2, iapCount: 1 },
  ];
  const tenant = { tenantId, displayName: 'Northstar Microsoft 365', defaultDomainName: 'example.test', userCount: people.length, lastSyncAt: date(2) };

  const hosts = ['LATITUDE-5430-01', 'PRECISION-7670-02', 'LATITUDE-5430-03'];
  const packageSeeds = [
    ['7-Zip', '7zip.7zip', '24.08', '24.09', 'pending', 2],
    ['Mozilla Firefox', 'Mozilla.Firefox', '132.0.1', '132.0.2', 'pending', 1],
    ['Microsoft PowerToys', 'Microsoft.PowerToys', '0.85.0', '0.86.0', 'approved', 2],
    ['Zoom Workplace', 'Zoom.Zoom', '6.2.0', '6.2.5', 'approved', 1],
    ['Notepad++', 'Notepad++.Notepad++', '8.7.1', '8.7.2', 'installed', 3],
    ['VLC media player', 'VideoLAN.VLC', '3.0.20', '3.0.21', 'failed', 1],
    ['Python 3.11', 'Python.Python.3.11', '3.11.8', '3.11.9', 'rejected', 1],
  ];
  const patches = packageSeeds.map(([name, wingetId, installedVersion, version, status, devices], i) => ({
    patchId: `patch-${i}`, name, wingetId, installedVersion, version, status, devices,
    kind: 'update', classification: i < 2 ? 'critical' : 'recommended', source: 'winget',
    firstDetectedAt: date(28 - i), installedAt: status === 'installed' ? date(8) : null, installedBy: 'Scheduled policy',
    lastAttemptAt: status === 'failed' ? date(6) : null, lastError: status === 'failed' ? 'Application in use' : null,
  }));
  const schedule = (time, days) => ({ frequency: 'daily', time, days, timezone: 'device', staggerHours: 0, staggerMinutes: 15, weeks: [1, 2, 3, 4, 5], monthDays: [1], months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] });
  const policies = [
    { id: 'workstations', name: 'Windows workstations', days: [1, 2, 3, 4, 5], deviceCount: 2, software: patches.slice(0, 4) },
    { id: 'pilot', name: 'Early update pilot', days: [0, 2, 4], deviceCount: 1, software: patches.slice(4) },
  ].map(({ days, software, ...policy }) => ({
    ...policy, enabled: true, description: 'Scheduled software updates for Naivano demo devices.',
    scan: { schedule: schedule('08:30', days), scanImmediately: false, applyImmediately: false },
    update: { schedule: schedule('18:00', days), runIfMissed: true, preStage: false, maintenance: { enabled: false } },
    reboot: { loggedIn: { mode: 'prompt', promptEveryMin: 60, forceAfterPrompts: 3, delayMin: 15 }, loggedOut: { mode: 'immediate', retryEveryMin: 60 } },
    notifications: { mode: 'do_not_close', promptEveryMin: 15, forceAfterPrompts: 3, customDialogText: '' },
    approvals: { enabled: true, critical: 'approve', recommended: 'manual' },
    winget: { updateAll: false, includeUnknown: false }, overrides: [],
    software: software.map(({ wingetId, name, source, classification }) => ({ wingetId, name, source, classification, critical: 'approve', recommended: 'manual', installIfMissing: false, selfService: false })),
  }));
  const activities = [
    { id: 'job-1', hostname: hosts[0], policyName: policies[0].name, kind: 'scan', status: 'ok', trigger: 'scheduled', startedAt: date(2), summary: '3 updates found' },
    { id: 'job-2', hostname: hosts[1], policyName: policies[0].name, kind: 'update', status: 'partial', trigger: 'scheduled', startedAt: date(6), summary: '1 installed · 1 needs retry', results: [
      { id: patches[4].wingetId, name: patches[4].name, version: patches[4].version, status: 'installed' },
      { id: patches[5].wingetId, name: patches[5].name, version: patches[5].version, status: 'failed', message: 'Application in use' },
    ] },
    { id: 'job-3', hostname: hosts[2], policyName: policies[1].name, kind: 'update', status: 'ok', trigger: 'scheduled', startedAt: date(8), summary: 'Updates installed successfully' },
  ];
  const patchStatuses = ['pending', 'approved', 'rejected', 'installed', 'failed'];
  function patchOverview() {
    const status = Object.fromEntries(patchStatuses.map(key => {
      const matches = patches.filter(patch => patch.status === key);
      return [key, { patches: matches.length, devices: Math.max(0, ...matches.map(patch => patch.devices)) }];
    }));
    return {
      managedDevices: hosts.length, fullyPatched: 1, patchesInstalledPct: 38, rebootPending: 1, status,
      topOutstanding: [{ hostname: hosts[0], approved: 2, pending: 2 }, { hostname: hosts[1], approved: 1, pending: 1 }],
      topFailed: [{ hostname: hosts[1], failed: 1 }], topFailures: [{ error: 'Application in use', count: 1 }],
    };
  }

  // Recommendations use fictional reference IDs and describe update status only.
  const findings = [
    [0, 'high', 8.2, 'open'], [1, 'medium', 6.4, 'open'], [4, 'medium', 5.5, 'fixed'], [5, 'low', 3.6, 'ignored'],
  ].map(([index, severity, cvss, status]) => {
    const patch = patches[index];
    return {
      key: `rec-${index}`, title: `Update ${patch.name}`, product: patch.name, matchedOn: ['software'],
      status, severity, maxCvss: cvss, cveCount: 1, kevCount: 0, deviceCount: patch.devices, fleetSize: hosts.length,
      installedVersions: [patch.installedVersion], fixedVersion: patch.version, fixedVersionExact: true, isLatest: true,
      minimumVersion: { version: patch.version, exact: true }, latest: { wingetId: patch.wingetId, version: patch.version, checkedAt: date(2) },
      remediation: `Review the available ${patch.name} update and apply it in the next maintenance window.`,
      findings: patch.devices, confirmed: patch.devices, bySeverity: { [severity]: 1 }, firstSeen: date(26),
      devices: hosts.slice(0, patch.devices).map(hostname => ({ hostname, os: 'Windows 11 Pro', lastSeen: date(2), lastSeenOnline: date(2), cveCount: 1, confirmed: true, installed: [{ name: patch.name, version: patch.installedVersion }] })),
      cves: [{ cveId: `DEMO-2026-${100 + index}`, title: 'Fictional finding for the product showcase', severity, cvss, devices: patch.devices, fixedVersion: patch.version, publishedAt: date(40) }],
    };
  });
  function vulnerabilitySummary() {
    const open = findings.filter(item => item.status === 'open');
    const exposed = new Set(open.flatMap(item => item.devices.map(device => device.hostname)));
    const bySeverity = Object.fromEntries(['critical', 'high', 'medium', 'low'].map(key => [key, open.filter(item => item.severity === key).length]));
    return { recommendations: open.length, devices: exposed.size, cves: open.length, kev: 0, bySeverity, lastScan: date(2), lastScanCves: findings.length + 1 };
  }

  const catalog = [
    ['standard-laptop', 'Standard business laptop', 'device', 'NB-STD-14', 'laptop-standard.jpg', '14-inch notebook for office and mobile work.'],
    ['monitor', '27-inch USB-C monitor', 'accessory', 'MON-27', 'monitor-27.jpg', 'Height-adjustable display for the standard workplace.'],
    ['dock', 'USB-C docking station', 'accessory', 'DOCK-USBC', 'docking-station.jpg', 'Connect displays, power and Ethernet using one cable.'],
    ['headset', 'Teams headset', 'accessory', 'HS-TEAMS', 'headset.jpg', 'USB headset for calls and hybrid meetings.'],
  ].map(([id, name, kind, sku, image, description]) => ({ id, name, kind, sku, image: `/catalog/${image}`, images: [`/catalog/${image}`], description, active: true }));
  const orders = [
    [0, 1, 1, 'in_logistics', 'approved', 't2', 'D-0002'],
    [1, 2, 2, 'in_logistics', 'approved'],
    [2, 0, 4, 'with_support', 'approved'],
  ].map(([i, item, person, status, approval, ticketId, ticketNumber]) => ({
    id: `${i + 1}`.padStart(24, '0'), orderNumber: `ORD-00${i + 41}`,
    itemName: catalog[item].name, itemSku: catalog[item].sku, quantity: 1,
    requestedByName: people[person].displayName, requestedByEmail: people[person].email, companyName: companies[0].name,
    status, approval, ticketId, ticketNumber, createdAt: date(16 + i * 4), decisionNote: 'Approved for the standard workplace setup.',
  }));

  const initialQuestion = 'Which devices need patching this week?';
  const aiConfig = {
    configured: true, provider: 'Naivano Demo', endpoint: 'Local examples', insightsTier: 'mid', schedulerEnabled: true,
    tiers: ['cheap', 'mid', 'strong'].map(tier => ({ tier, model: `demo-${tier}` })),
    samples: [initialQuestion, 'Summarize open support tickets', 'Show the pending hardware orders'],
  };
  const aiAnswer = question => {
    if (/patch|device|risk|security/i.test(question)) return `In the demo fleet, ${hosts[0]} has two pending updates and ${hosts[1]} has one. One device is fully patched. Review the open packages in Patching → Software.`;
    if (/order|hardware|procurement/i.test(question)) return 'Two approved requests are in the demo logistics queue: a USB-C monitor and a docking station.';
    if (/ticket|support|helpdesk/i.test(question)) return 'The demo queue includes an Outlook sign-in issue and a monitor support request. Open Tickets to review the status, requester and conversation.';
    return 'This is a local Naivano AI example. Try asking about the demo fleet, support tickets, patching or hardware orders.';
  };
  const aiChats = [{ id: 'fleet-weekly', title: initialQuestion, updatedAt: date(3), turns: [{ question: initialQuestion, answer: aiAnswer(initialQuestion), status: 'done', askedAt: date(3) }] }];
  const schedules = [{ id: 'weekly-patches', question: initialQuestion, enabled: true, timeZone: 'Europe/Berlin', days: [1], timeOfDay: '09:00', nextRunAt: date(-80), chatId: aiChats[0].id }];

  const changeAssignees = people.slice(0, 3).map(({ uid, displayName, email }) => ({ uid, name: displayName, email }));
  const changes = [
    { id: 'vpn', type: 'maintenance', title: 'VPN gateway maintenance', description: 'A brief interruption is expected during the gateway update.', startAt: date(-3), endAt: date(-5) },
    { id: 'patches', type: 'change', title: 'Windows workstation patch rollout', description: 'Deploy approved updates to the workstation group.', startAt: date(-28), endAt: date(-31) },
    { id: 'network', type: 'outage', title: 'Network switch replacement', description: 'The test network will be unavailable during the replacement.', startAt: date(-55), endAt: date(-57) },
  ].map((entry, index) => ({
    ...entry, affected: { scope: 'org', targets: [] }, assignee: changeAssignees[index], status: 'planned', createdAt: date(30),
  }));

  function dayKey(day) {
    return [day.getFullYear(), day.getMonth() + 1, day.getDate()].map(value => String(value).padStart(2, '0')).join('-');
  }

  const today = dayKey(new Date());
  const usageDays = Array.from({ length: 366 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (365 - index));
    return { date: dayKey(day), spendUsd: (245 + (index * 47 % 218)) / 100, requestCount: 34 + (index * 13 % 27) };
  });
  const monthDays = usageDays.filter(day => day.date.startsWith(today.slice(0, 7)));
  const budgetUsd = 180;

  function spendFor(days) {
    const spendUsd = Number(days.reduce((total, day) => total + day.spendUsd, 0).toFixed(2));
    const requestCount = days.reduce((total, day) => total + day.requestCount, 0);
    return {
      spendUsd, budgetUsd, requestCount, currency: 'USD', totalTokens: requestCount * 1920,
      remainingUsd: Math.max(0, budgetUsd - spendUsd),
      overBudgetUsd: Math.max(0, spendUsd - budgetUsd),
      percentUsed: (spendUsd / budgetUsd) * 100,
    };
  }

  const sampleWorkflow = {
    id: '0000000000000000000000a1', name: 'Service desk intake', description: 'Route incoming sample tickets to the service desk.',
    active: true, nodeCount: 2, updatedAt: date(8), createdAt: date(72),
    nodes: [
      { id: 'start', name: 'Manual trigger', type: 'core.manualTrigger', position: [0, 0], parameters: {} },
      { id: 'format', name: 'Format ticket summary', type: 'core.set', position: [260, 0], parameters: {} },
    ],
    connections: [],
  };
  const sampleScript = {
    id: 'demo-inventory-note', name: 'Inventory summary', description: 'Example read-only PowerShell script for a device summary.',
    language: 'powershell', updatedAt: date(9), createdAt: date(100), versions: [],
  };
  const sampleApproval = {
    id: 'demo-approval', title: 'Review the workstation patch rollout', status: 'pending', workflowName: sampleWorkflow.name,
    createdAt: date(5), requestedFor: changeAssignees[1], canDecide: true, details: { group: 'Sample workstations' },
  };
  const reportBase = { organisation: seed.org.name, generatedAt: date(1), generatedBy: people[0].displayName };
  const severities = ['critical', 'high', 'medium', 'low'];
  const severityData = build => Object.fromEntries(severities.map((severity, index) => [severity, build(index)]));
  const patchReportItems = patches.map(patch => ({ ...patch, id: patch.patchId, title: patch.name }));

  const routes = {
    '/api/auth/me': seed.profile,
    '/api/projects': [seed.org],
    '/api/org/memberships': [{ ...seed.profileOrg, role: seed.profile.role }],
    '/api/org': { ...seed.org, members: people.map((person, index) => ({ ...person, isSelf: index === 0, status: 'active' })) },
    '/api/invitations': [],
    '/api/notification-prefs': { emailAvailable: false, events: [
      { key: 'assigned', label: 'Ticket assigned to you', inbox: true, email: false },
      { key: 'reply', label: 'New ticket reply', inbox: true, email: false },
    ] },
    '/api/roles': seed.roles,
    '/api/users': people,
    '/api/companies': companies,
    '/api/departments': departments,
    '/api/entra/status': { configured: true, tenants: [tenant] },
    '/api/entra/users': people,
    '/api/entra/reset-audit': [{ at: date(24), userId: people[2].userPrincipalName, method: 'stepup', result: 'success', byEmail: people[0].email, reason: 'Example audit entry' }],
    '/api/ticket-scopes': { unrestricted: ['owner'], roles: [{ role: 'agent', label: 'Service desk', mode: 'departments', departmentIds: [departments[0].id] }] },
    '/api/ticket-dashboard-presets': [
      { id: 'demo-open', name: 'Open tickets', filter: { statusMode: 'active' } },
      { id: 'demo-waiting', name: 'Waiting on user', filter: { statusMode: 'waiting_customer' } },
      { id: 'demo-escalated', name: 'Escalated tickets', filter: { statusMode: 'active', escalatedOnly: true } },
    ],
    '/api/inbox/unread-count': { count: 0 },
    '/api/inbox': [],
    '/api/news': [],
    '/api/ai/costs/range': ({ searchParams }) => {
      const start = searchParams.get('start') || monthDays[0].date;
      const end = searchParams.get('end') || today;
      return spendFor(usageDays.filter(day => day.date >= start && day.date <= end));
    },
    '/api/ai/costs/monthly': () => {
      const spend = spendFor(monthDays);
      return {
        ...spend,
        byModel: [{ model: 'demo-mid', requestCount: spend.requestCount, totalTokens: spend.totalTokens, spendUsd: spend.spendUsd }],
        byFeature: [{ feature: 'insights', requestCount: spend.requestCount, totalTokens: spend.totalTokens, spendUsd: spend.spendUsd }],
      };
    },
    '/api/ai/costs/daily': { days: monthDays },
    '/api/ai/models': {
      configured: true, provider: 'azure', endpoint: 'Sample workspace',
      deployments: { ok: true, count: aiConfig.tiers.length, names: aiConfig.tiers.map(tier => ({ name: tier.model, model: tier.model })) },
      tiers: aiConfig.tiers.map((tier, index) => ({ ...tier, label: ['Economy', 'Balanced', 'Advanced'][index], usable: true })),
      features: [{ key: 'insights', label: 'Naivano AI', tier: 'mid', hint: 'Model used for sample workspace questions.' }],
    },
    '/api/workflows': [sampleWorkflow],
    [`/api/workflows/${sampleWorkflow.id}`]: sampleWorkflow,
    [`/api/workflows/${sampleWorkflow.id}/versions`]: [],
    '/api/workflow-node-types': seed.workflowNodes,
    '/api/workflow-settings': { retentionDays: 30 },
    '/api/workflow-executions': [],
    '/api/approvals': ({ searchParams }) => [sampleApproval].filter(item => !searchParams.get('status') || item.status === searchParams.get('status')),
    '/api/scripts': [sampleScript],
    '/api/scripts/demo-inventory-note': sampleScript,
    '/api/script-folders': [],
    '/api/script-versions': [],
    '/api/change-requests': ({ searchParams }) => {
      const from = searchParams.get('from');
      const to = searchParams.get('to');
      const limit = Math.max(1, Number(searchParams.get('limit')) || 500);
      return changes.filter(entry => (!from || entry.endAt >= from) && (!to || entry.startAt < to)).slice(0, limit);
    },
    '/api/change-requests/options': { organisation: seed.org, assignees: changeAssignees },
    '/api/agent/info': { version: '0.1.0' },
    '/api/agent/connections': { connections: 2 },
    '/api/patching/overview': patchOverview,
    '/api/patching/report-catalog': { items: patchReportItems, companies },
    '/api/patching/reports': [],
    '/api/patching/activities': ({ searchParams }) => activities.filter(job => (!searchParams.get('kind') || job.kind === searchParams.get('kind')) && (!searchParams.get('status') || job.status === searchParams.get('status'))),
    '/api/patching/patches': url => patches.filter(patch => (!url.searchParams.get('status') || patch.status === url.searchParams.get('status')) && matches(url, patch.name, patch.wingetId, ...hosts.slice(0, patch.devices))),
    '/api/patching/patches/devices': url => {
      const patch = patches.find(item => item.patchId === url.searchParams.get('patchId'));
      return patch ? hosts.slice(0, patch.devices).map(hostname => ({ hostname, online: hostname !== hosts[2], ...patch })) : [];
    },
    '/api/patch-policies': policies,
    '/api/patch-catalog': url => patches.filter(patch => matches(url, patch.name, patch.wingetId)),
    '/api/catalog/all': catalog,
    '/api/catalog/images': catalog.flatMap(item => item.images.map(url => ({ name: url.split('/').at(-1), url }))),
    '/api/orders/logistics': orders,
    '/api/vulnerabilities/summary': vulnerabilitySummary,
    '/api/vulnerabilities/reports/exposure': {
      ...reportBase, totals: { fleet: hosts.length, exposedDevices: 2, cves: 2, findings: 2, kevCves: 0, products: 2 },
      bySeverity: severityData(index => ({ cves: Number(index === 1 || index === 2), devices: Number(index === 1 || index === 2) })),
      products: findings.filter(item => item.status === 'open').map(item => ({ ...item, name: item.title, firstSeen: item.firstSeen || date(48) })),
      devices: hosts.slice(0, 2).map((hostname, host) => ({ hostname, os: 'Windows', bySeverity: severityData(index => Number(index === host + 1)), kevCount: 0, firstSeen: date(48) })),
    },
    '/api/vulnerabilities/reports/kev': { ...reportBase, totals: { fleet: hosts.length, kevCves: 0, devices: 0, findings: 0 }, cves: [] },
    '/api/vulnerabilities/reports/time-to-fix': ({ searchParams }) => {
      const periodDays = Number(searchParams.get('days')) || 90;
      return {
        ...reportBase, totals: { fleet: hosts.length }, periodDays, since: date(periodDays * 24),
        ageBuckets: [{ key: 'recent', label: 'Under 7 days' }],
        fixed: { all: { count: 1, medianDays: 2, p90Days: 2 }, bySeverity: severityData(index => index === 2 ? { count: 1, medianDays: 2, meanDays: 2, p90Days: 2 } : { count: 0 }) },
        open: { all: { count: 2 }, bySeverity: severityData(index => ({ count: Number(index === 1 || index === 2), buckets: { recent: Number(index === 1 || index === 2) } })) },
        products: [{ name: 'Example Windows update', count: 1, cves: 1, devices: 1, medianDays: 2, meanDays: 2, p90Days: 2 }],
      };
    },
    '/api/vulnerabilities': url => findings.filter(item => item.status === (url.searchParams.get('status') || 'open') && (!url.searchParams.get('severity') || item.severity === url.searchParams.get('severity')) && matches(url, item.title, item.cves[0].cveId, ...item.devices.map(device => device.hostname))),
    '/api/vulnerabilities/by-package': () => findings.filter(item => item.status === 'open').map(item => ({ wingetId: item.latest.wingetId, key: item.key, severity: item.severity, cveCount: item.cveCount, deviceCount: item.deviceCount })),
    '/api/vulnerabilities/recommendation': url => findings.find(item => item.key === url.searchParams.get('key')),
    '/api/vulnerabilities/scanned': url => [{ cveId: 'DEMO-2026-099', title: 'Fictional scan result with no affected devices', severity: 'medium', cvss: 5.1, products: ['demo/archived-client'], lastScannedAt: date(2) }].filter(item => matches(url, item.cveId, item.title) && (!url.searchParams.get('severity') || item.severity === url.searchParams.get('severity'))),
    '/api/demo-ai/config': aiConfig,
    '/api/demo-ai/chats': () => ({ chats: aiChats.map(({ turns, ...chat }) => ({ ...chat, turnCount: turns.length })) }),
    '/api/demo-ai/schedules': { schedules },
    '/api/search': search,
  };

  for (const article of seed.articles) {
    void baseFetch('/api/kb/articles', { method: 'POST', body: JSON.stringify({ ...article, projectId: seed.org.id, published: true }) });
  }

  function matches(url, ...values) {
    const query = (url.searchParams.get('q') || '').toLowerCase();
    return values.some(value => String(value).toLowerCase().includes(query));
  }

  async function search(url) {
    const [tickets, inventory] = await Promise.all(['/api/tickets', '/api/inventory'].map(async path => (await baseFetch(path)).json()));
    const matchingTickets = tickets.filter(ticket => matches(url, ticket.title, ticket.ticketNumber, ticket.createdByName))
      .map(ticket => ({ type: 'ticket', id: ticket._id, ticketNumber: ticket.ticketNumber, primary: ticket.title, identifier: ticket.ticketNumber, secondary: ticket.createdByName }));
    const matchingPeople = people.filter(person => matches(url, person.displayName, person.email))
      .map(person => ({ type: 'user', id: person.uid, primary: person.displayName, secondary: person.email }));
    const matchingDevices = inventory.filter(device => matches(url, device.hostname, device.product_name))
      .map(device => ({ type: 'device', id: device.hostname, primary: device.hostname, secondary: device.product_name }));
    const results = [...matchingPeople, ...matchingTickets, ...matchingDevices];
    return { results: results.slice(0, 12) };
  }

  function getDetail(pathname) {
    const [, , resource, id, section] = pathname.split('/');
    if (!id) return undefined;
    if (resource === 'patch-policies') {
      const policy = policies.find(item => item.id === id);
      if (!policy) return null;
      if (section === 'devices') {
        const assigned = policy.id === 'workstations' ? hosts.slice(0, 2) : hosts.slice(2);
        return assigned.map(hostname => ({ deviceId: hostname, hostname, online: hostname !== hosts[2], counts: { pending: 2, approved: 1, failed: 0, installed: 3 }, lastScanAt: date(2), nextScanAt: date(-12), nextUpdateAt: date(-22) }));
      }
      return policy;
    }
    if (resource === 'orders') {
      const order = orders.find(item => item.id === id);
      return order ? { order, events: [{ actorName: 'Samira Klein', text: 'approved the request', at: date(9) }] } : null;
    }
    if (resource === 'demo-ai' && id === 'chats') return aiChats.find(chat => chat.id === section) || null;
  }

  async function ask(init) {
    const { question, chatId } = JSON.parse(init.body || '{}');
    if (!question?.trim()) return Response.json({ error: 'Enter a question to try the demo.' }, { status: 400 });
    const chat = aiChats.find(item => item.id === chatId) || { id: crypto.randomUUID(), title: question, turns: [] };
    const turn = { question, answer: aiAnswer(question), status: 'done', askedAt: date(0), interpretation: 'Local showcase response from the sample workspace.' };
    chat.turns.push(turn);
    chat.updatedAt = turn.askedAt;
    if (!aiChats.includes(chat)) aiChats.unshift(chat);
    return Response.json({ ...turn, chatId: chat.id });
  }

  let noticeTimer;
  function showDemoNotice(message) {
    if (!document.body) return;
    let notice = document.querySelector('.demo-action-notice');
    if (!notice) {
      notice = document.createElement('div');
      notice.className = 'demo-action-notice';
      notice.innerHTML = '<div role="status"><strong>Demo workspace</strong><span></span></div><button type="button" aria-label="Dismiss demo notice">×</button>';
      notice.querySelector('button').addEventListener('click', () => { notice.hidden = true; });
      document.body.append(notice);
    }
    notice.hidden = false;
    notice.querySelector('[role="status"] span').textContent = message;
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => { notice.hidden = true; }, 7500);
  }

  window.fetch = async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : input, location.origin);
    const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    if (url.origin !== location.origin || !url.pathname.startsWith('/api/')) return baseFetch(input, init);
    if (method === 'GET') {
      const route = routes[url.pathname];
      const data = typeof route === 'function' ? await route(url) : route ?? getDetail(url.pathname);
      if (data !== undefined) return data === null ? Response.json({ error: 'This example was not found.' }, { status: 404 }) : Response.json(data);
    }
    if (method === 'POST' && url.pathname === '/api/demo-ai/ask') return ask(init);
    const response = await baseFetch(input, init);
    if (response.status !== 404) return response;
    const value = await response.clone().json().catch(() => null);
    if (!value?.error?.startsWith('Mock route not found')) return response;
    if (method === 'GET' || method === 'HEAD') {
      return Response.json({ error: 'This information is not included in the demo workspace.' }, { status: 404 });
    }
    const error = url.pathname === '/api/patching/scan-online'
      ? 'Live device scans require a connected workspace. The findings shown here are sample data.'
      : 'This action requires a connected workspace. You can still explore the sample data in this demo.';
    showDemoNotice(error);
    return Response.json({ error, code: 'demo_only' }, { status: 409 });
  };

  document.documentElement.setAttribute('data-naivano-demo', '');
  document.documentElement.classList.add(window.self === window.top ? 'naivano-demo-standalone' : 'nevian-demo-embedded');
  if (window.self === window.top) {
    document.addEventListener('DOMContentLoaded', () => {
      const root = document.documentElement;
      const menu = document.querySelector('.demo-workspace-menu');
      const scrim = document.querySelector('.demo-workspace-scrim');
      const sidebar = document.getElementById('sidebar');
      const content = document.querySelectorAll('#admin-shell > .admin-topbar, .admin-content-col');
      if (!menu || !scrim || !sidebar) return;
      const setOpen = (open, returnFocus = true) => {
        root.classList.toggle('demo-workspace-menu-open', open);
        menu.setAttribute('aria-expanded', String(open));
        menu.setAttribute('aria-label', open ? 'Close dashboard menu' : 'Open dashboard menu');
        menu.firstElementChild.textContent = open ? '×' : '☰';
        content.forEach(element => { element.inert = open; });
        if (open) sidebar.querySelector('a[href]')?.focus();
        else if (returnFocus) menu.focus();
      };
      const isOpen = () => root.classList.contains('demo-workspace-menu-open');
      menu.addEventListener('click', () => setOpen(!isOpen()));
      scrim.addEventListener('click', () => setOpen(false));
      sidebar.addEventListener('click', event => {
        if (isOpen() && event.target.closest('a[href], [data-admin-nav]')) setOpen(false);
      });
      document.addEventListener('keydown', event => {
        if (isOpen() && event.key === 'Escape') { event.preventDefault(); setOpen(false); }
      });
      window.matchMedia('(max-width: 700px)').addEventListener('change', event => {
        if (!event.matches && isOpen()) setOpen(false, false);
      });
    }, { once: true });
  }
  const BrowserEventSource = window.EventSource;
  window.EventSource = class extends EventTarget {
    static CONNECTING = BrowserEventSource.CONNECTING;
    static OPEN = BrowserEventSource.OPEN;
    static CLOSED = BrowserEventSource.CLOSED;
    readyState = BrowserEventSource.OPEN;

    constructor(url, options) {
      super();
      const eventUrl = new URL(url, location.origin);
      if (eventUrl.origin !== location.origin || eventUrl.pathname !== '/api/events') return new BrowserEventSource(url, options);
    }

    close() { this.readyState = BrowserEventSource.CLOSED; }
  };
})(window.nevianDemoSeed);
