import * as core from '@actions/core'
import { readFileSync, writeFileSync } from 'fs'
import { SemVer, ReleaseType } from 'semver'
import parse from 'semver/functions/parse'
import chalk from 'chalk'

// prettier-ignore
const RELEASE_TYPES = [ 'major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease' ]
const isValidReleaseType = (s: string) => RELEASE_TYPES.includes(s)

function inc(sv: SemVer, rt: ReleaseType, id?: string): SemVer {
  const isPre = rt.startsWith('pre') && !id
  return sv.inc(rt, isPre ? 'alpha' : undefined)
}

const DISPLAY_RANGE = 3

try {
  const REQUIRED = { required: true }
  const increment = core.getInput('increment', REQUIRED) as ReleaseType

  if (!isValidReleaseType(increment))
    throw new Error(
      `Invalid release type "${increment}".\n` +
        `Use one of ${JSON.stringify(RELEASE_TYPES)}.`
    )

  const identifier = core.getInput('identifier')
  const version_file = core.getInput('version_file', REQUIRED)
  const version_regex = new RegExp(core.getInput('version_regex', REQUIRED))

  const lines = readFileSync(version_file, 'utf8').split('\n')
  const n = lines.findIndex((v) => version_regex.test(v))
  if (n === -1) throw new Error(`Regex doesn't match any line`)

  // won't throw because regex has matched previously already
  const current = parse(version_regex.exec(lines[n])[1])
  const current_version = current.version

  const next = inc(current, increment, identifier)
  // replace the line in-place
  lines[n] = lines[n].replace(current_version, next.version)

  console.log(`\
Increment request: [${increment}, ${identifier}]
Current version:   ${current_version}
Next version:      ${next.version}

Updated "${version_file}" preview:`)
  console.log('────────────────────────────────────────────────────────────')
  lines
    .filter((_, i) => n - DISPLAY_RANGE <= i && i <= n + DISPLAY_RANGE)
    .forEach((v, i) => console.log(i == n ? v : chalk.green(v)))
  console.log('────────────────────────────────────────────────────────────')

  writeFileSync(version_file, lines.join('\n'))
  core.setOutput('version', next.version)
} catch (err) {
  core.setFailed(err.message)
}
