import { getInput, setFailed, setOutput } from '@actions/core'
import { readFileSync, writeFileSync } from 'fs'
import { SemVer, ReleaseType } from 'semver'
import parse from 'semver/functions/parse'

// prettier-ignore
const RELEASE_TYPES = ['major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease'] as const
function assertRelease(s: any) {
  const msg = `Invalid release type "${s}".\nUse one of ${RELEASE_TYPES}`
  if (!RELEASE_TYPES.includes(s)) throw new Error(msg)
}

function inc(sv: SemVer, rt: ReleaseType, id?: string): SemVer {
  const isPre = rt.startsWith('pre') && !id
  return sv.inc(rt, isPre ? 'alpha' : undefined)
}

type Input = {
  increment: ReleaseType
  identifier?: string
  ver: { file: string; regex: RegExp }
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

try {
  const { increment, identifier, ver } = getAllInput()

  const lines = readFileSync(ver.file, 'utf8').split('\n')
  const n = lines.findIndex((v) => ver.regex.test(v))
  if (n === -1) throw new Error(`Regex doesn't match any line`)

  // won't throw because regex has matched previously already
  const current = parse(ver.regex.exec(lines[n])[1])

  const next = inc(parse(current.version), increment, identifier)
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
} catch (err) {
  setFailed(err.message)
}
