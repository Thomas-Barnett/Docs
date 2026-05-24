# Updating and Publishing a Docusaurus Site

This guide explains the basic workflow for editing a Docusaurus documentation site, previewing it locally, checking that it builds correctly, and pushing the changes to GitHub.

The general process is:

1. Open the Docusaurus project folder.
2. Start the local development server.
3. Make and preview changes.
4. Run a production build test.
5. Stage the changed files with Git.
6. Commit the changes with a message.
7. Push the commit to GitHub.

---

## 1. Open the Docusaurus Project Folder

First, move into the folder where your Docusaurus site lives.

```bash
cd path/to/your/docusaurus-site
```

### What this does

The `cd` command means **change directory**.

It moves your terminal into the project folder so that commands like `npm start`, `git status`, and `git push` run against the correct project.

Example:

```bash
cd ~/Documents/GitHub/Docs
```

In this example:

- `cd` changes the current terminal directory.
- `~/` means your home folder.
- `Documents/GitHub/Docs` is the folder path to the Docusaurus repo.

---

## 2. Open the Project in VS Code

Once you are inside the project folder, you can open it in Visual Studio Code.

```bash
code .
```

### What this does

The `code` command opens Visual Studio Code.

The `.` means **the current folder**.

So this command means:

> Open the current project folder in VS Code.

This is useful because VS Code will open the whole Docusaurus project, including folders like:

```text
docs/
blog/
src/
static/
```

---

## 3. Start the Docusaurus Local Preview Server

To preview your site locally, run:

```bash
npm start
```

or:

```bash
npm run start
```

### What this does

This starts the Docusaurus development server.

Docusaurus will usually open your site automatically in a browser at:

```text
http://localhost:3000
```

If it does not open automatically, you can manually go to that address in your browser.

### Command breakdown

```bash
npm start
```

- `npm` is the Node Package Manager.
- `start` runs the start script defined in your project’s `package.json`.

This is usually a shortcut for something like:

```bash
docusaurus start
```

The local server is for previewing changes while you work. It does not publish anything to the internet.

---

## 4. Edit Your Documentation Files

Most Docusaurus content is stored in Markdown or MDX files.

Common folders include:

```text
docs/
blog/
src/pages/
```

### What is happening

When you edit a file and save it, the local Docusaurus server usually reloads automatically.

That means you can make changes in VS Code and immediately preview them in your browser.

Common file types:

```text
.md
.mdx
.js
.jsx
.ts
.tsx
```

For normal documentation pages, you will mostly edit:

```text
.md
```

or:

```text
.mdx
```

---

## 5. Watch for Markdown Link Issues

Docusaurus checks links during the build process. A common issue is accidentally creating a broken Markdown link.

For example, this can break the build:

```md
[Something](!)
```

Docusaurus sees `!` as a link path and tries to resolve it as a real page.

If you want `(!)` to appear as plain text, use inline code:

```md
`(!)`
```

Or escape the exclamation point:

```md
(\!)
```

The inline code option is usually cleaner for documentation.

---

## 6. Test the Production Build Locally

Before pushing to GitHub, run:

```bash
npm run build
```

### What this does

This creates a production build of your Docusaurus site.

It checks for issues like:

- Broken links
- Bad Markdown or MDX syntax
- Missing images
- Invalid imports
- Build configuration problems

### Command breakdown

```bash
npm run build
```

- `npm` runs commands from your Node/Docusaurus project.
- `run` tells npm to run a script from `package.json`.
- `build` is the name of the script.

This usually runs something like:

```bash
docusaurus build
```

If this command succeeds, your site is probably safe to push.

If it fails, read the error carefully. Docusaurus usually tells you which page has the issue.

Example broken link error:

```text
Docusaurus found broken links!
Broken link on source page path = /docs/AWS-VoIP-Project/AWS-VoIP-Server-Setup
```

That means you should open that specific doc and look for the broken link.

---

## 7. Check Git Status

After making changes, check what Git sees as modified.

```bash
git status
```

### What this does

This shows the current state of your Git repo.

It tells you:

- Which files were modified
- Which files are new
- Which files are deleted
- Whether anything is staged for commit
- What branch you are currently on

### Command breakdown

```bash
git status
```

- `git` runs the Git version control tool.
- `status` shows the current working tree status.

This command does not change anything. It is safe to run anytime.

---

## 8. Stage Your Changes

To prepare all changed files for a commit, run:

```bash
git add .
```

### What this does

This stages your changes.

Staging means you are telling Git:

> Include these changes in the next commit.

### Command breakdown

```bash
git add .
```

- `git` runs Git.
- `add` stages files.
- `.` means the current folder and everything under it.

So this command stages all changed, new, and deleted files inside the current project folder.

If you only want to stage one specific file, use:

```bash
git add docs/example-page.md
```

That stages only that file.

---

## 9. Commit Your Changes

After staging your files, create a commit.

```bash
git commit -m "Update Docusaurus documentation"
```

### What this does

This saves a snapshot of your staged changes in Git.

A commit is like a checkpoint in your project history.

### Command breakdown

```bash
git commit -m "Update Docusaurus documentation"
```

- `git` runs Git.
- `commit` creates a new commit from the staged changes.
- `-m` means **message**.
- `"Update Docusaurus documentation"` is the commit message.

The `-m` flag lets you write the commit message directly in the command.

Without `-m`, Git may open a text editor and ask you to write a commit message there.

Example:

```bash
git commit
```

That opens the default Git editor instead of using an inline message.

Good commit messages should briefly explain what changed.

Examples:

```bash
git commit -m "Fix broken AWS VoIP doc link"
```

```bash
git commit -m "Add FreePBX server setup notes"
```

```bash
git commit -m "Update homepage feature cards"
```

---

## 10. Push Your Commit to GitHub

After committing, push the commit to GitHub.

```bash
git push
```

### What this does

This uploads your local commit to the remote GitHub repository.

Once pushed, GitHub can see your changes.

If your repo uses GitHub Actions to deploy the Docusaurus site, the push may automatically start a build/deployment workflow.

### Command breakdown

```bash
git push
```

- `git` runs Git.
- `push` uploads your local commits to the configured remote repository.

In most cases, if your branch is already tracking GitHub, this is enough.

---

## 11. First Push or New Branch

Sometimes Git does not know where to push the branch yet.

In that case, you may need:

```bash
git push -u origin main
```

### What this does

This pushes your local `main` branch to the remote named `origin`, and sets the upstream tracking relationship.

### Command breakdown

```bash
git push -u origin main
```

- `git` runs Git.
- `push` uploads commits.
- `-u` means **set upstream**.
- `origin` is the default name for your remote GitHub repository.
- `main` is the branch you are pushing.

The `-u` flag tells Git:

> In the future, when I run `git push`, push this local branch to `origin/main`.

After using `-u` once, you usually only need:

```bash
git push
```

If your branch is named `master` instead of `main`, use:

```bash
git push -u origin master
```

---

## 12. If GitHub Asks for Credentials

If you are pushing over HTTPS, GitHub may ask for a username and password.

Use:

```text
Username: your GitHub username
Password: your GitHub personal access token
```

Do not use your regular GitHub password.

For a fine-grained GitHub token, the minimum permission needed for normal doc pushes is:

```text
Contents: Read and write
```

For a classic token, the common permission is:

```text
repo
```

If you are editing files under `.github/workflows/`, you may also need workflow permissions.

---

## 13. Recommended Full Workflow

This is the normal process from start to finish:

```bash
cd path/to/your/docusaurus-site
```

Move into the Docusaurus project folder.

```bash
code .
```

Open the project in VS Code.

```bash
npm start
```

Start the local Docusaurus preview server.

Then edit your files in VS Code and preview them in your browser at:

```text
http://localhost:3000
```

After editing, test the production build:

```bash
npm run build
```

Check which files changed:

```bash
git status
```

Stage the changes:

```bash
git add .
```

Commit the changes:

```bash
git commit -m "Update documentation"
```

Push the changes to GitHub:

```bash
git push
```

---

## 14. Quick Troubleshooting Commands

Search for a broken Markdown link like `(!)`:

```bash
grep -n "\](!" docs/AWS-VoIP-Project/AWS-VoIP-Server-Setup.*
```

### Command breakdown

```bash
grep -n "\](!" docs/AWS-VoIP-Project/AWS-VoIP-Server-Setup.*
```

- `grep` searches text inside files.
- `-n` shows the line number of each match.
- `"\](!"` is the search pattern.
- `docs/AWS-VoIP-Project/AWS-VoIP-Server-Setup.*` searches files with that name and any extension, such as `.md` or `.mdx`.

Another useful search:

```bash
grep -n "(!)" docs/AWS-VoIP-Project/AWS-VoIP-Server-Setup.*
```

This searches for the literal text `(!)` in that file.

---

## 15. Summary

The most important commands are:

```bash
npm start
```

Use this to preview the site locally.

```bash
npm run build
```

Use this to check that the site can build successfully.

```bash
git status
```

Use this to review what changed.

```bash
git add .
```

Use this to stage your changes.

```bash
git commit -m "Your commit message"
```

Use this to save your changes into Git history.

```bash
git push
```

Use this to upload your commit to GitHub.

The key habit is:

> Preview locally, build locally, then push to GitHub.

That way, you catch most Docusaurus problems before GitHub Actions catches them for you.