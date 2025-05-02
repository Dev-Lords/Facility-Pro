# Sprint Two (2) Meetings

## 14 April 2025

> Date: Monday, 14 April 2025.  

> Time: 15:00.  

> Platform: In Person.  

> Attendees: All Team Members.  

### Agenda:

- Add Team Members as Collaborators on Firebase

- Task Breakdown for coding

- Discussion of sprint’s User Stories and how tasks will be distributed

- Discussion of using Branches

- Configuration of DashBoard cards as a guide for requirements

- Discussion of representation of roles in database

### Key Discussion Points:

1. Collaboration on Firebase:

    Added all team members as collaborators on firebase.

2. Task Breakdown for coding:

    Distributed Task Breakdown for coding according to dashboards.

    Amahle and Austin on Residents Dashboard.

    Phumla and Lindiwe on Admin Dashboard .

    Thembu and Tawana on Facility Staff Dashboard.

3. Discussion of User Stories:

    Distributed User Stories according to dashboards cards.

    Formulated User Stories according to dashboard role requirements.

4. Use of Branches:

    Changes will be made from branches with one merge at the end.

5. Admin Dashboard:

    Formulated User Story to Create Events.

    Formulated User Story  to Review Bookings.

6. Facility Staff Dashboard:

    Formulated User Story to update status of reports.

    Formulated User Story to Provide feedback of reports.

7. Resident Dashboard:

    Formulated User Story to book Facilities.

    Formulated User Story to report issues.

Next Meeting: 17 April 2025

## 17 April 2025

> Date: Thursday, April 17 2025.

> Time: 20:00.

> Platform: Microsoft Teams.

> Attendees: All Team Members.

### Agenda:
- Progress on Dashboards and User Stories

- Progress on test coverage

- Addressed Error in user authentication and role logic

- Addressed Error with accessing issues data as a user

### Key discussion points:

1. Progress on Resident Dashboard:

    Backend and Frontend code complete, changes yet to be pushed to GitHub.

    Team emphasized pushing code to receive help from team members.

2. Progress on Admin Dashboard: 

    Backend and Frontend code written.

    Clarification off user management limits of admin.

3. Progress on Staff Dashboard:

    Backend and Frontend code complete.

    Test coverage reaches 40%.

4. UML diagrams:

    Clarification on when UML diagrams will be made.

    Discusses types of UML diagrams to be used.

Next meeting: 18 April 2025

## April 18 2025

> Date: 18 April 2025.

> Time: 19:00.

> Platform: Microsoft Teams.

> Attendees: All Team Members.

### Agenda:

- Fix login-related bugs

- Handle user creation issues

- Discuss progress on UI changes

- Clarify responsibilities and user story completion

### Key Discussion Points:

1. Login Bug and Admin Logout Issue

    Problem: Admins were logged out when creating new users.

    Cause: Admins using frontend functions like createUserWithEmailAndPassword caused session conflict.

    Solution: Using Firebase Admin SDK and backend functions to separate admin session from created users.

2. UML Diagrams and Project Documentation

    Some members found UML diagrams (component and sequence) challenging.

    Discussed potential tools or AI support for diagram generation based on workflows.

3. Report Issue Feature

    Feature was pushed to production.

    Hardcoded user ID using UUID was discussed; consensus was to rely on Firebase-generated IDs.

4. Calendar on Resident Page

    Debated whether the resident calendar should display events.

    Final decision: Calendar should display both events and booked slots.

5. UI Changes and Improvements

    Admin page updated for design consistency.

    System Settings renamed to Bookings for clarity.

    Sign-out functionality still needs to be added.

6. Progress Updates

    Most members are nearing completion of their tasks.

    Focus on finishing UI polish, routing logic, and minor transitions.

Next Meeting: 19 April 2025

## 19 April 2025

> Date: 19 April 2025.

> Time: 19: 00.

> Platform: Microsoft Teams.

> Attendees: Multiple group members.


### Agenda:

- Notification system design

- Facility dashboard functionality

- Code testing and coverage

- Visual UI improvements

### Key Discussion Points:

1. Notification System Debate

    Debate over using platform-only notifications vs. emails.

    Decision: Implement a notification button on the landing page for internal notifications; emails optional.

    Notification scope: Individual issue updates (for reporters), general events (for all users).

2. Issue Reporting & Visibility

    Confirmed only facility staff and individual reporters can see issues.

    Tracking and history for submitted issues is being added.

3. Testing and Bug Fixing

    Discussion around test coverage.

    Some tests failing due to routing and async delays; members fixing by mocking/stubbing.

    Emphasis on improving test coverage and maintaining clean branches.

4. Admin & Facility Staff Page Concerns

    Some code pushed to branches, not yet merged.

    Admin SDK causing login issues during user creation—discussion on workarounds.

    UI feedback like popups needed after actions.

5. UI/UX Enhancements

    Pop-up feedback to confirm booking success + auto-routing to dashboard.

    Calendar event indicator design still under discussion.

    Facility dashboard redesign suggested: streamline cards, remove redundancy.

6. Miscellaneous

    Team agreed to shift non-critical admin features to next sprint.

    Everyone confirmed their user story progress.

Next Meeting: 20 April 2025

## 20 April 2025

> Date: 20 April 2025.

> Time: 19:00.

> Platform: Miscrosoft Teams.

> Attendees: All Team Members


### Agenda:

- Review of individual progress and latest changes

- Code testing and test coverage

- UI feedback and fixes

- Firebase Firestore user data issues

- Planning meeting with Chloe and finalizing Sprint 2

### Key Discussion Points:

1. Progress Updates

    Team member added functionality for residents to view previously logged issues.

    Tasks were updated and documented, with user stories and UML diagrams completed.

2. Testing and Code Coverage

    Reach 50% test coverage by Monday.

    Some tests failed due to deleted UI elements, which were then fixed.

    Issues were encountered running tests.

    Team committed to writing and running more tests before Tuesday.

3. UI and Functional Issues

    UI update pushed to production
    
    New user type dropdown in onboarding form had visibility issues.

    Color bug inconsistently affected different machines and browsers.

    Users missing expected attributes caused UI errors or invalid data formatting.

    Need to handle missing fields in user objects and ensure data consistency in Firestore.

4. Database and Sync Issues

    Users deleted in Firestore were not being removed from Firebase Authentication.

    Discussion around tracking and formatting createdAt and updatedAt fields.

    Agreed on formatting dates using toISOString and fixing formatting mismatches causing errors.

5. Sprint Wrap-up and Meeting Planning

    Chloe is available to meet on Tuesday between 12:00–2:00 PM or 2:00–4:00 PM.

    Team opted for Tuesday 12:00–2:00 PM.