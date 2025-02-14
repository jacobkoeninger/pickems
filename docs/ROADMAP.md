# Pickems Project Cycle Roadmap

## Overview
This document outlines the roadmap for our current development cycle to improve and maintain the Pickems project. It details our process for reviewing the codebase, identifying areas of improvement, breaking down tasks, ordering those tasks, and tracking progress throughout the cycle.

## Objectives
- **Codebase Review:** Skim through the current codebase to gain a holistic view of where we stand.
- **Identifying Issues:** Determine what parts of the project need work or enhancement (e.g., authentication, contest mechanics, real-time updates, leaderboards).
- **Task Breakdown:** Convert identified areas into actionable, manageable tasks.
- **Task Prioritization:** Order tasks based on their urgency, impact, and dependencies.
- **Progress Tracking:** Document our progress in this roadmap and update it as tasks are completed.

## Process Steps
1. **Codebase Review:**
   - Thoroughly skim the project to understand the current state and architecture.
2. **Identify Areas for Improvement:**
   - Note modules or features that require refactoring or enhancements.
   - Highlight missing features or documentation gaps.
3. **Task Breakdown:**
   - Create individual tasks for each identified issue (e.g., improvements in authentication flow, refining contest scoring logic, updating leaderboards, etc.).
4. **Task Priority & Ordering:**
   - Determine dependencies and order tasks from highest to lowest priority.
5. **Roadmap Finalization:**
   - Compile the tasks and milestones into this document.
6. **Ongoing Tracking:**
   - Regularly update the status of tasks here to reflect ongoing progress.

## Initial Task List
- [x] Conduct a detailed codebase review. *(Completed: Reviewed src/, src/components, src/auth, and parsed_pickems.json)*
## Milestones
- **Milestone 1:** Complete the codebase review and document all areas for improvement. *(Achieved)*
- **Milestone 2:** Define and prioritize all tasks based on the review.
- **Milestone 3:** Begin implementation of high-priority tasks and monitor progress.
- **Milestone 4:** Update leaderboards and confirm real-time updates are functioning correctly.
- **Milestone 5:** Finalize testing and QA improvements and update documentation accordingly.

## Tracking Progress
- Update this document with task completions and changes as the cycle progresses.
- Use the checklist above to mark off tasks as they are completed.
- Reassess priority and adjust deadlines during periodic reviews.

## Additional Notes
- All team members are encouraged to contribute updates and feedback to this roadmap.
- This document serves as our roadmap for the cycle and can be revised as needed based on project developments.

## Task Breakdown

### 1. Authentication and Discord Integration
- [ ] Review and improve error handling in `src/auth/discord.js`.
- [ ] Validate and, if necessary, update nickname management in `src/auth/nicknames.js`.

### 2. Contest and Prediction Logic
- [ ] Review the structure and data in `src/parsed_pickems.json` to ensure it aligns with our new contest rules.
- [ ] Validate the scoring calculation in the prediction processing logic (e.g., within `src/actions.js` and `src/queries.js`).

### 3. Leaderboard Functionality and Real-Time Updates
- [ ] Design and implement real-time leaderboard update features.
- [ ] Create or update front-end components (potentially in `src/pages` or `src/components`) to display leaderboard information clearly.

### 4. Testing and Quality Assurance
- [ ] Write unit tests for core functionalities (e.g., scoring logic, error handling in authentication).
- [ ] Set up integration tests for complete contest workflows.

### 5. Documentation Enhancements
- [ ] Update project documentation to reflect the new contest rules and system behavior.
- [ ] Add inline comments and JSDoc annotations where needed across the codebase. 