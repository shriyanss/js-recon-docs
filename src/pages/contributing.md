# Contributing to JS Recon Tool

## Reporting Bugs

If you find an issue with the tool, please create a new issue on GitHub [here](https://github.com/js-recon/js-recon/issues/new?template=bug_report.md).

## Requesting new support for new technologies

If the tool doesn't support a framework and you want the tool to support it, please create a new issue on GitHub [here](https://github.com/js-recon/js-recon/issues/new?template=new_tech_support_request.md).

## Contributing to the codebase

### Setting the dev environment

First of all, clone the repository:

```bash
git clone https://github.com/js-recon/js-recon.git
cd js-recon
npm install
```

The tool supports Node.js v22.17.0 (LTS) or later with npm as the package manager. You can download it from [here](https://nodejs.org/en/download/).

### How the codebase is structured

First of all, these three npm scripts would be helpful:

```bash
npm run build # build the tool
npm run start # run the tool in production mode
npm run cleanup # remove all the output files of tool and build the tool again
```

All the code for this tool is written in TypeScript, and is under the [`src/`](https://github.com/js-recon/js-recon/tree/main/src) directory. The file `index.ts` is the entry point of the tool. It contains all the CLI arguments for the tool, and executes the responsible functions.

The code for the modules is stored in directories inside the [`src/`](https://github.com/js-recon/js-recon/tree/main/src) directory, except for the [`utility`](https://github.com/js-recon/js-recon/tree/main/src/utility) directory.

The directories for the modules contain a file `index.ts`, which is the entry point for the module.

### Testing is required for new functionality

Every new feature or fix should ship with tests:

- **Unit tests** ([Vitest](https://vitest.dev/)) for pure functions — anything that takes plain
  inputs and returns a value without I/O (parsing, string extraction, URL resolution, etc.). Live in
  `src/__tests__/<component>/<name>.test.ts`, run with `npm test`. Puppeteer, network calls, and file
  writes are intentionally left untested at the unit level — validate those end-to-end via the `run`
  subcommand instead.
- **Fuzz tests** ([fast-check](https://fast-check.dev/)) for anything on the untrusted-input
  boundary — js-recon parses JS bundles pulled from third-party targets, so functions that parse or
  transform that raw text should get a property-based fuzz test in addition to example-based unit
  tests. Named `<name>.fuzz.test.ts`, run separately with `npm run test:fuzz` (excluded from the
  default `npm test` run since they're slower).
- **Smoke tests** for new rules — the `rules-smoke-test` CI workflow runs js-recon end-to-end against
  a seeded lab app (`js-recon-labs`) and asserts every expected rule fires. Adding a rule to
  `js-recon-rules` means seeding the corresponding vulnerability in the lab app and adding the rule
  ID to `EXPECTED_RULES` in `js-recon`'s `scripts/smoke-test.js`.

See [`contributing/testing.md`](https://github.com/js-recon/js-recon/blob/dev/contributing/testing.md)
in the js-recon repo for the full write-up, including how to construct Babel AST nodes in tests and
how to avoid tripping GitHub's secret scanner on test fixtures that look like real credentials.

### Keep the docs in sync

If your change affects user-facing behavior, CLI flags, exit codes, or install/usage instructions,
include a corresponding update to this docs site (`js-recon-docs`) — either in the same pull request
cycle or a linked follow-up PR. Docs-only fixes don't require a corresponding `js-recon` change.

### Static analysis

CI runs [ESLint](https://eslint.org/) (with `eslint-plugin-security`) and
[CodeQL](https://codeql.github.com/) on every push and pull request to `js-recon`. Run `npm run lint`
locally before pushing.

### Making a Pull Request

1. Fork the repo
2. Create a new branch from the `dev` branch

```bash
git checkout -b <your-feature-name> dev
```

3. Commit your changes with meaningful commit messages

```bash
git add <files>
git commit -m "[feat/chore/fix/docs]: <meaningful commit message>"
```

4. Push your branch

```bash
git push origin <your-feature-name>
```

5. Open a pull request to the `dev` branch

6. When the PR is created, make sure that all the checks pass. If any of the checks fail, fix the issues and push the changes again.

7. Once all the tests pass, the changes will be reviewed by the maintainers. If the changes are accepted, they will be merged into the `dev` branch.

8. The changes will be available in the next release of the tool.

9. If you want to contribute to the docs, please create a new pull request on GitHub [here](https://github.com/js-recon/js-recon-docs/pulls/).
