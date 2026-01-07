---
description: Generate a GitHub Pull Request with title and body auto-filled from commit history
---

1. **Generate and Open PR**:
   - This step calculates the PR metadata from your local git history and uses the `gh` CLI to create the PR.
   - It defaults to targeting `main`.

   // turbo
   - Run the following command:

     ```bash
     # 1. Get current branch name
     CURRENT_BRANCH=$(git branch --show-current)

     # 2. Get the First Commit Subject as the PR Title
     # We assume the first commit (oldest) or the most recent?
     # Usually the most recent or a summary is good. Let's pick the latest commit subject for now.
     # Or better, derive it from the branch name if commits are messy, but user asked for metadata.
     # Let's use the first commit message of the branch (common practice for single-commit PRs),
     # or the branch name if that fails.
     # actually, 'git log main..HEAD' shows newest first.
     # Let's take the first line of the first commit (HEAD) as title.
     PR_TITLE=$(git log -1 --pretty=format:"%s")

     # 3. Get all commit messages as the Body (bullet points)
     # We exclude the subject if we want, but listing all commits is safer.
     PR_BODY=$(git log main..HEAD --pretty=format:"- %s (%h)")

     if [ -z "$PR_BODY" ]; then
        echo "No commits found between main and $CURRENT_BRANCH. Have you committed your changes?"
        exit 1
     fi

     # 4. Construct the full description
     DESCRIPTION="## Summary\n\nAuto-generated PR for branch \`$CURRENT_BRANCH\`.\n\n## Changes\n\n$PR_BODY"

     echo "Creating PR..."
     echo "Title: $PR_TITLE"
     echo "Description: $DESCRIPTION"

     # 5. Create the PR using gh CLI
     # We use --web so the user can review it in the browser before final confirm, or remove --web to auto-create.
     # The user said "generates a PR", let's create it directly.
     gh pr create --title "$PR_TITLE" --body "$DESCRIPTION"
     ```
