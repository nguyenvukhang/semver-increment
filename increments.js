const ver = require('semver/functions/parse')

const PRE = 'prerelease'
const PAT = 'patch'
const A = 'alpha'

const cases = [
  [['0.7.1-alpha.4', PRE], '0.7.1-alpha.5'],
  [['0.7.1-alpha.4', PAT], '0.7.1'],
  [['0.7.1', PAT], '0.7.2'],
  [['0.7.1', PRE], '0.7.2-0'],
  [['0.7.1-alpha.4', PRE, A], '0.7.1-alpha.5'],
  [['0.7.1', PRE, A], '0.7.2-alpha.0'],
  [['0.7.1-alpha.4', PAT, A], '0.7.1'],
  [['0.7.1', PAT, A], '0.7.2'],

  // dev branch behavior
  [['0.7.1-alpha.4', PRE, A], '0.7.1-alpha.5'],
  [['0.7.1', PRE, A], '0.7.2-alpha.0'],

  // main branch behavior
  [['0.7.1-alpha.4', PAT], '0.7.1'],
  [['0.7.1', PAT], '0.7.2'],
  [['0.7.1-alpha.4', PAT, A], '0.7.1'],
  [['0.7.1', PAT, A], '0.7.2'],
]

for (let i = 0; i < cases.length; i++) {
  let [[v, r, a], e] = cases[i]
  const rec = ver(v).inc(r, a)
  const exp = ver(e)
  if (rec.version !== exp.version)
    throw new Error(`Error(${i}):\nreceived: ${rec}\nexpected: ${exp}`)
}
