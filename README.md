# `semver-increment`

![tests](https://img.shields.io/github/actions/workflow/status/nguyenvukhang/semver-increment/tests.yml?label=tests)

The `semver-increment` action lets the GitHub Action Runner obtain the
current version of the project from a file in the repository and
increment it using npm's [semver][npm-semver] library.

## Example Configuration

```yaml
steps:
  - uses: actions/checkout@v3
  - uses: nguyenvukhang/semver-increment@v1
    with:
      increment: 'prerelease'
      identifier: 'alpha'
      version-file: 'Cargo.toml'
      version-regex: '^version = "(.*)"'
```

## Usage

- `increment`: How far to push the next version.  
  Possible values: `major`,
  `premajor`, `minor`, `preminor`, `patch`, `prepatch`, or
  `prerelease`.
- `identifier`: _(optional)_ The pre-release identifier. Can be `alpha`, `beta`, or
  any string.
- `version-file`: The file which the SemVer string of the project is
  stored in. This file will be mutated after the action completes.
- `version-regex`: A line-matching regex to let `semver-increment`
  know which line to edit in `version-file`.

## Outputs

- `version`: The value of the version after the increment.
- `error`: The error message, if the execution failed.

### Example output usage

```yaml
steps:
  - uses: actions/checkout@v3
  - uses: nguyenvukhang/semver-increment@v1
    id: semver
    continue-on-error: true
    with:
      increment: 'prerelease'
      identifier: 'alpha'
      version-file: 'Cargo.toml'
      version-regex: '^version = "(.*)"'

  - name: Get error message (if any)
    run: echo ${{ steps.semver.outputs.error }}

  - name: Get the new latest version after incrementing
    run: echo ${{ steps.semver.outputs.version }}
```

[npm-semver]: https://www.npmjs.com/package/semver
