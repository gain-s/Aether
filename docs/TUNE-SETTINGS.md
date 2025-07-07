# Tune Settings: Removing Root package.json and Related Files

This checklist will help you safely remove `package.json` and related files from the application root, ensuring all installs and scripts are localized to `frontend/` and `backend/`.

## To-Do Checklist

- [x] **Audit devcontainer.json and scripts**

  - [x] Check if any commands in `devcontainer.json` (e.g., `postCreateCommand`, `postStartCommand`, etc.) run `npm install`, `npm run`, or similar commands in the root directory.
  - [x] If so, update these commands to run in `frontend/` and `backend/` only.

- [x] **Check for root-level npm scripts usage**

  - [x] Ensure no one is expected to run `npm run ...` or `npm install` from the root for project setup, linting, or testing.
  - [x] Move any shared scripts or configs to a `scripts/` or `config/` folder, and update documentation accordingly.

- [ ] **Update documentation**

  - [ ] Make sure your README and onboarding docs do not reference root-level npm commands.

- [ ] **Test the devcontainer**
  - [ ] Rebuild the devcontainer after removing the root `package.json` and `package-lock.json`.
  - [ ] Verify that both frontend and backend install and run as expected.

## Suggested Process

1. Update `devcontainer.json` so all install/start commands are scoped to `frontend/` and `backend/`.
2. Remove root `package.json` and `package-lock.json`.
3. Rebuild the devcontainer and verify all workflows (dev, lint, test, build) work from the subfolders.
4. Update documentation and scripts as needed.

---

_This document is a living checklist for the settings and process tuning required to fully localize all Node.js installs and scripts to the appropriate subfolders._
