import { getInput, setFailed, setOutput } from '@actions/core'
import { readFileSync, writeFileSync } from 'fs'
import parse from 'semver/functions/parse'
import type { ReleaseType } from 'semver'

// prettier-ignore
const RELEASE_TYPES = ['major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease'] as const
function assertRelease(s: any) {
  const msg = `Invalid release type "${s}".\nUse one of ${RELEASE_TYPES}`
  if (!RELEASE_TYPES.includes(s)) throw new Error(msg)
}

type Input = {
  increment: ReleaseType
  identifier?: string
  ver: { file: string; regex: RegExp }
}

/**
 * throws if no capture groups is found
 */
function getMatch(re: RegExp, haystack: string) {
  const result = re.exec(haystack)!
  if (typeof result[1] !== 'string') {
    throw new Error('version_regex must have at least one capture group')
  }
  return result[1]
}

function getAllInput(): Input {
  const R = { required: true }
  const input = {
    increment: getInput('increment', R) as ReleaseType,
    identifier: getInput('identifier'),
    ver: {
      file: getInput('version_file', R),
      regex: new RegExp(getInput('version_regex', R)),
    },
  }
  assertRelease(input.increment)
  return input
}

function preview(lines: string[], delta: number, range = 3) {
  const [lb, rb] = [delta - range, delta + range]
  console.log('---')
  lines.filter((_, i) => lb <= i && i <= rb).forEach((v) => console.log(v))
  console.log('---')
}

function readFile(filepath: string) {
  try {
    return readFileSync(filepath, 'utf8').split('\n')
  } catch {
    throw new Error(`File not found: ${filepath}`)
  }
}

try {
  const { increment, identifier, ver } = getAllInput()

  const lines = readFile(ver.file)
  const n = lines.findIndex((v) => ver.regex.test(v))
  if (n === -1) throw new Error(`Regex doesn't match any line`)

  const current = parse(getMatch(ver.regex, lines[n]))
  if (!current) {
    throw new Error(`Invalid SemVer found in ${ver.file}:\n${lines[n]}`)
  }
  const next = parse(current.version)!.inc(increment, identifier)
  // replace the line in-place
  lines[n] = lines[n].replace(current.version, next.version)

  console.log(`\
Increment request: [${increment}${identifier ? ', ' + identifier : ''}]
Current version:   ${current.version}
Next version:      ${next.version}

Updated "${ver.file}" preview:`)
  preview(lines, n)

  writeFileSync(ver.file, lines.join('\n'))
  setOutput('version', next.version)
} catch (err: any) {
  setFailed(err.message)
  setOutput('error', err.message)
}
