# 🔐 Branch Protection Rules

This document outlines the branch protection rules for the FlowNote repository to ensure code quality, security, and proper release management.

## 📋 Table of Contents

- [Overview](#overview)
- [Branch Protection Settings](#branch-protection-settings)
- [Setup Instructions](#setup-instructions)
- [Bypass Permissions](#bypass-permissions)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

FlowNote uses GitHub Branch Protection Rules to:
- ✅ Prevent direct pushes to protected branches
- ✅ Require PR reviews before merging
- ✅ Enforce status checks (CI/CD)
- ✅ Require linear commit history
- ✅ Prevent force pushes
- ✅ Ensure code quality and security

---

## 🌳 Branch Protection Settings

### `main` Branch (Production)

**Purpose**: Production-ready code only. All releases go through this branch.

#### Protection Rules

```yaml
Branch name pattern: main

Pull request requirements:
  ✅ Require a pull request before merging
  ✅ Require approvals: 1
  ✅ Dismiss stale pull request approvals when new commits are pushed
  ✅ Require review from Code Owners (if CODEOWNERS file exists)
  ✅ Require approval of the most recent reviewable push
  ❌ Require conversation resolution before merging (enabled)

Status checks:
  ✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging

  Required status checks:
    - security (npm audit)
    - lint (ESLint check)
    - test (Unit & Integration tests)
    - build (Build verification)
    - validate-title (PR title validation)

Commit requirements:
  ✅ Require linear history (no merge commits, prefer squash/rebase)
  ✅ Require signed commits (recommended for security)

Push restrictions:
  ✅ Restrict who can push to matching branches
    - Allow: Repository administrators only
    - Allow: GitHub Actions (for semantic-release)

Additional settings:
  ✅ Lock branch (prevent deletion)
  ✅ Do not allow bypassing the above settings
  ❌ Allow force pushes: Nobody
  ❌ Allow deletions: Nobody
```

#### GitHub Settings JSON (for API/CLI setup)

```json
{
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "require_last_push_approval": true
  },
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "security",
      "lint",
      "test",
      "build",
      "validate-title"
    ]
  },
  "enforce_admins": true,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": true,
  "allow_fork_syncing": true
}
```

---

### `develop` Branch (Beta/Integration)

**Purpose**: Integration branch for ongoing development. Beta releases happen here.

#### Protection Rules

```yaml
Branch name pattern: develop

Pull request requirements:
  ✅ Require a pull request before merging
  ✅ Require approvals: 1
  ✅ Dismiss stale pull request approvals when new commits are pushed
  ❌ Require review from Code Owners (optional)
  ✅ Require conversation resolution before merging

Status checks:
  ✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging

  Required status checks:
    - lint (ESLint check)
    - test (Unit tests)
    - validate-title (PR title validation)

Commit requirements:
  ✅ Require linear history (preferred)
  ❌ Require signed commits (optional)

Push restrictions:
  ✅ Restrict who can push to matching branches
    - Allow: Repository administrators
    - Allow: Maintainers
    - Allow: GitHub Actions (for semantic-release)

Additional settings:
  ✅ Lock branch (prevent deletion)
  ❌ Do not allow bypassing (admins can bypass for emergency)
  ❌ Allow force pushes: Nobody
  ❌ Allow deletions: Nobody
```

#### GitHub Settings JSON

```json
{
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "require_last_push_approval": true
  },
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "lint",
      "test",
      "validate-title"
    ]
  },
  "enforce_admins": false,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": true,
  "allow_fork_syncing": true
}
```

---

### `release/*` Branches (Release Candidates)

**Purpose**: Final preparation before production release.

#### Protection Rules

```yaml
Branch name pattern: release/*

Pull request requirements:
  ✅ Require a pull request before merging
  ✅ Require approvals: 1

Status checks:
  ✅ Require status checks to pass before merging

  Required status checks:
    - lint
    - test
    - build

Commit requirements:
  ✅ Require linear history

Push restrictions:
  ❌ No restrictions (allow developers to push)

Additional settings:
  ❌ Lock branch (can be deleted after merge)
  ❌ Do not allow bypassing
  ❌ Allow force pushes: Nobody
  ✅ Allow deletions: Yes (after merge to main)
```

---

### `feature/*` Branches (Development)

**Purpose**: Active sprint development.

#### Protection Rules

```yaml
Branch name pattern: feature/*

Pull request requirements:
  ❌ No PR required (developers work directly)

Status checks:
  ✅ Require status checks to pass (recommended)

  Required status checks (if PR created):
    - lint
    - test

Commit requirements:
  ❌ No specific requirements

Push restrictions:
  ❌ No restrictions

Additional settings:
  ❌ No protection (flexible for development)
  ✅ Allow force pushes: Yes (only on feature branches)
  ✅ Allow deletions: Yes (after merge)
```

---

### `hotfix/*` Branches (Critical Fixes)

**Purpose**: Emergency production fixes.

#### Protection Rules

```yaml
Branch name pattern: hotfix/*

Pull request requirements:
  ✅ Require a pull request before merging
  ✅ Require approvals: 1 (can be expedited)

Status checks:
  ✅ Require status checks to pass

  Required status checks:
    - lint
    - test
    - build

Commit requirements:
  ❌ No specific requirements (speed is priority)

Push restrictions:
  ❌ No restrictions (allow rapid development)

Additional settings:
  ❌ Lock branch (can be deleted after merge)
  ❌ Allow force pushes: Yes
  ✅ Allow deletions: Yes (after merge)
```

---

## 🛠️ Setup Instructions

### Option 1: GitHub Web UI

1. Go to **Settings** → **Branches**
2. Click **Add branch protection rule**
3. Enter branch pattern (e.g., `main`)
4. Configure settings as outlined above
5. Click **Create** or **Save changes**

Repeat for each branch pattern: `main`, `develop`, `release/*`, `feature/*`, `hotfix/*`

---

### Option 2: GitHub CLI

```bash
# Install GitHub CLI
brew install gh  # macOS
# or
sudo apt install gh  # Ubuntu

# Authenticate
gh auth login

# Set protection for main branch
gh api repos/emrealmaoglu/flownote/branches/main/protection \
  --method PUT \
  --input - <<EOF
{
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true
  },
  "required_status_checks": {
    "strict": true,
    "contexts": ["security", "lint", "test", "build"]
  },
  "enforce_admins": true,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
EOF

# Set protection for develop branch
gh api repos/emrealmaoglu/flownote/branches/develop/protection \
  --method PUT \
  --input - <<EOF
{
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  },
  "required_status_checks": {
    "strict": true,
    "contexts": ["lint", "test"]
  },
  "enforce_admins": false,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
```

---

### Option 3: Terraform (Infrastructure as Code)

```hcl
# main.tf
resource "github_branch_protection" "main" {
  repository_id = "flownote"
  pattern       = "main"

  required_pull_request_reviews {
    required_approving_review_count = 1
    dismiss_stale_reviews           = true
    require_code_owner_reviews      = true
    require_last_push_approval      = true
  }

  required_status_checks {
    strict   = true
    contexts = ["security", "lint", "test", "build"]
  }

  enforce_admins         = true
  require_linear_history = true
  allow_force_pushes     = false
  allow_deletions        = false

  required_conversation_resolution = true
  lock_branch                      = true
}

resource "github_branch_protection" "develop" {
  repository_id = "flownote"
  pattern       = "develop"

  required_pull_request_reviews {
    required_approving_review_count = 1
    dismiss_stale_reviews           = true
  }

  required_status_checks {
    strict   = true
    contexts = ["lint", "test"]
  }

  enforce_admins         = false
  require_linear_history = true
  allow_force_pushes     = false
  allow_deletions        = false
}
```

---

## 🔓 Bypass Permissions

### When Bypass is Allowed

Only in these scenarios:

1. **Emergency Hotfixes** (with post-incident review)
2. **Automated Release Bot** (GitHub Actions with `GH_TOKEN`)
3. **Repository Admins** (with justification)

### How to Bypass (Admins Only)

```bash
# Temporary disable protection
gh api repos/emrealmaoglu/flownote/branches/main/protection \
  --method DELETE

# Make urgent change
git push origin main

# Re-enable protection immediately
gh api repos/emrealmaoglu/flownote/branches/main/protection \
  --method PUT \
  --input protection.json
```

**⚠️ Important**: Document all bypass events in incident log.

---

## 🚨 Troubleshooting

### Issue: "Required status check is not passing"

**Solution**:
```bash
# Check status
gh pr checks

# Re-run failed checks
gh pr checks --watch

# If stuck, close and reopen PR
gh pr close 123
gh pr reopen 123
```

### Issue: "Branch is out of date"

**Solution**:
```bash
# Update branch
git fetch origin
git rebase origin/main  # or develop

# Or merge
git merge origin/main

# Force push (only on feature branches!)
git push --force-with-lease
```

### Issue: "Conversation not resolved"

**Solution**:
- Go to PR page
- Click on each conversation thread
- Click "Resolve conversation" after addressing comments

### Issue: "Linear history required"

**Solution**:
```bash
# Use rebase instead of merge
git rebase origin/main

# Or squash commits before merging
git rebase -i HEAD~5
# Mark commits as 'squash' or 'fixup'

# When merging PR, choose "Squash and merge"
```

### Issue: "Admin bypass needed for emergency"

**Steps**:
1. Contact repository admin
2. Document reason in incident log
3. Admin temporarily disables protection
4. Push emergency fix
5. Admin re-enables protection immediately
6. Create post-incident review issue

---

## 📊 Protection Status Check

Verify branch protection is configured:

```bash
# Check main branch protection
gh api repos/emrealmaoglu/flownote/branches/main/protection | jq

# Check develop branch protection
gh api repos/emrealmaoglu/flownote/branches/develop/protection | jq

# List all protected branches
gh api repos/emrealmaoglu/flownote/branches \
  --jq '.[] | select(.protected == true) | .name'
```

Expected output:
```
main
develop
```

---

## 🔒 Security Best Practices

1. **Enable Required Signed Commits**
   ```bash
   git config --global commit.gpgsign true
   ```

2. **Use Personal Access Tokens (PAT) with minimal scope**
   - Scopes: `repo`, `workflow`
   - Expiration: 90 days max

3. **Enable 2FA for all contributors**

4. **Regularly audit branch protection rules**
   ```bash
   gh api repos/emrealmaoglu/flownote/branches/main/protection
   ```

5. **Monitor bypass events**
   - Check audit log monthly
   - Review all admin overrides

---

## 📚 Related Documentation

- [Git Workflow](./GIT_WORKFLOW.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Pull Request Template](../.github/pull_request_template.md)
- [GitHub Branch Protection Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

---

**Last Updated**: 2024-12-19
**Maintained By**: FlowNote DevOps Team
