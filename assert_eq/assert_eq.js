const { getInput, setFailed } = require('@actions/core')

try {
  const received = getInput('received', { required: true })
  const expected = getInput('expected', { required: true })
  if (received !== expected) {
    throw new Error(`\
Assertion Error:
received: ${received}
expected: ${expected}
`)
  }
} catch (err) {
  setFailed(err.message)
}
