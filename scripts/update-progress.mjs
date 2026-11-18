import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const site = fileURLToPath(new URL('../', import.meta.url))
const target = new URL('../src/data/progress.json', import.meta.url)
const previous = JSON.parse(readFileSync(target, 'utf8'))
const reviewed = JSON.parse(readFileSync(new URL('./progress-public-copy.json', import.meta.url), 'utf8'))
const git = (...args) => execFileSync('git', args, { cwd: site, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
const publicCopy = hash => {
  const copy = reviewed[hash]
  if (!copy?.title || !copy?.description) {
    throw new Error(`Public copy review required for commit ${hash}. Add a reviewed summary before updating progress.`)
  }
  return { title: copy.title, description: copy.description }
}

// Export only reviewed copy and aggregate metadata. Never export raw Git messages,
// authors, repository URLs, file paths, configuration values or full commit IDs.
const commits = git('rev-list', '--max-count=30', 'HEAD').split('\n').map(sha => {
  const hash = sha.slice(0, 7)
  const files = git('show', '--format=', '--numstat', '--root', '--first-parent', sha).split('\n').filter(Boolean)
  const stats = files.map(line => line.split('\t').slice(0, 2).map(value => value === '-' ? 0 : Number(value)))
  return {
    type: 'commit', hash, at: git('show', '-s', '--format=%cI', sha), author: 'Artin',
    ...publicCopy(hash), filesChanged: files.length,
    added: stats.reduce((sum, row) => sum + row[0], 0),
    removed: stats.reduce((sum, row) => sum + row[1], 0), commits: [],
  }
})
const byHash = new Map(commits.map(commit => [commit.hash, commit]))
const pushes = previous.activities.filter(event => event.type === 'push' && byHash.has(event.hash)).map(event => {
  const included = git('rev-list', `--max-count=${event.count}`, event.hash).split('\n').map(sha => {
    const hash = sha.slice(0, 7)
    return { hash, message: publicCopy(hash).title }
  })
  return {
    type: 'push', hash: event.hash, at: event.at, author: 'Artin', count: included.length,
    title: `Published ${included.length} ${included.length === 1 ? 'commit' : 'commits'}`,
    description: '', filesChanged: 0, added: 0, removed: 0, commits: included,
  }
})
const activities = [...commits, ...pushes].sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
const data = {
  updatedAt: new Date().toISOString(), start: previous.start, end: previous.end, daily: previous.daily,
  latestCommitAt: commits[0].at, commitLimit: 30, activities,
}
const output = JSON.stringify(data, null, 2) + '\n'
if (/nevian|github\.com|ITSM_Agent|NikolayTanev|-----BEGIN|:\/\//i.test(output)) {
  throw new Error('Unexpected private or legacy information in public progress data. Review required.')
}
writeFileSync(target, output)
console.log(`Updated ${commits.length} reviewed public summaries and ${pushes.length} push events.`)
