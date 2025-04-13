# Meetings

## 7 April 2025

> Date: Monday, April 7 2025.  

> Time: 15:00.  

> Platform: In person.  

> Attendees: Austin, Amahle, Thembu, Lindiwe, Phumla, Tawana, Chloe.  


1. Met and discussed basic project admin with Tutor

2. Discussed which platforms to use and settled on using:
 - Firebase
 - React - Front End
 - NoteJS, Express - Back End
 - JavaScript
 - MySQL database instance in Azure

3. Discussed using database based information storing vs File based information storing and settled on MySQL Database.

4. Decided group members will collaborate to set up GitHub repository

5. Discussed how different types of user roles will be created and managed
6. Decided Facility Staff wil and Admin profiles will be created internally, and new users may only sign up as residents.

7. Decided that anyone who wants to book register as a resident.

8. Decided to use Azure with MySQL database instance

9. Discussed what certain roles will be capable of doing. 

10. Decided on the plan for the week:
 - Thembu to set up GitHub Organisations and GitHub Issues

11. Came up with User Stories

12. Created GitHub Organisation DevLords

13. Integrated React onto GitHub

- Next Meeting: 9 April 2025, 17:00

## 9 April 2025

> Date: Wednesday, April 9 2025.  

> Time: 18:00.  

> Platform: Microsoft Teams.  

> Attendees: All Team Members.

The meeting was chaired informally by members.

### Agenda
- OAuth setup and tech stack alignment

- Task breakdown for GitHub Issues

- Clarification on user stories and rubric expectations

### Key Discussion Points
1. Third-Party Auth Implementation:

    Decided to use Firebase Authentication with Google OAuth.

    Team emphasized not storing emails or passwords in the database, per instructor’s guidance.

2. Backend Strategy:

    Firebase preferred over AWS due to team familiarity.

    Data models (e.g., Facility, StaffMember) will be structured in Firebase.

3. Rubric Guidance:

    Tasks must be directly derived from user stories.

    Setup tasks (e.g., GitHub repo, code coverage) are not counted unless linked to stories.

4. GitHub Usage:

    Decided to break user stories into smaller tasks and add them to GitHub Issues.

    One member volunteered to help format and assign tasks clearly.

5. Task Assignments:

    Identified tasks such as:

    Set up Google OAuth

    Design Google login button (not full form)

    Implement routing after login

    Discussed assigning and managing via GitHub Issues and a project board.

5. Clarification on Sign-in UI:

    UI should only show third-party login options (e.g., “Login with Google”).

    No custom email/password forms should be used to avoid security responsibility.

- Next Meeting: 11 April 2025

## 11 April 2025

> Date: Friday, April 11, 2025.  

> Time: 19:00.  

> Platform: Microsoft Teams.  

> Attendees: All Team Members (some initially missing but joined later).

The meeting  was chaired informally by available members

### Agenda:
- Finalization of Sprint 1 tasks

- Review of deployment requirements

- Clarification of task responsibilities

- Discussion on user role assignment and routing logic

### Key Discussion Points:
1. Deployment Clarification:

    Confirmed requirement from rubric: system must be deployed (e.g., to Azure).

    GitHub Releases and deployment are necessary for full marks.

2. Progress Review:

    Sign in with Google is working; sign-up behavior discussed.

    Front-end dashboards for different user roles (admin, staff, resident) are being designed.

3. Routing Logic:

    Routing based on user roles was under development.

    Discussion emphasized that role information must be included in the authentication token to support routing logic.

4. Issue with Role Assignment:

    Currently, user role assignment during account creation is not implemented.

    Clarified that only residents will sign up directly, other roles will be created/administered by the admin.

5. Code Integration:

    Concern raised about conflicts due to outdated local branches.

    Agreed to commit changes to a separate branch and merge into main via pull requests.

6. Weekend Plan:

    Complete deployment setup.

    Finalize sign-in/out logic.

    Include role management for routing and access control.

- Next Meeting: 13 April 2025