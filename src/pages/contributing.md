# Contributing to JS Recon Tool

## Reporting Bugs

If you find an issue with the tool, please create a new issue on GitHub [here](https://github.com/shriyanss/js-recon/issues/new?template=bug_report.md).

## Requesting new support for new technologies

If the tool doesn't support a framework and you want the tool to support it, please create a new issue on GitHub [here](https://github.com/shriyanss/js-recon/issues/new?template=new_tech_support_request.md).

## Contributing to the codebase

### Setting the dev environment

First of all, clone the repository:

```bash
git clone https://github.com/shriyanss/js-recon.git
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

All the code for this tool is written in TypeScript, and is under the [`src/`](https://github.com/shriyanss/js-recon/tree/main/src) directory. The file `index.ts` is the entry point of the tool. It contains all the CLI arguments for the tool, and executes the responsible functions.

The code for the modules is stored in directories inside the [`src/`](https://github.com/shriyanss/js-recon/tree/main/src) directory, except for the [`utility`](https://github.com/shriyanss/js-recon/tree/main/src/utility) directory.

The directories for the modules contain a file `index.ts`, which is the entry point for the module.

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

9. If you want to contribute to the docs, please create a new pull request on GitHub [here](https://github.com/shriyanss/js-recon-docs/pulls/).
