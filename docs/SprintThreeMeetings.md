# Sprint Three (3) Meetings
## 22 April 2025

> Date: 22 April 2025.

> Time: 13:15.

> Platform: In Person.

> Attendees: All Team Members

### Agenda:

- Issue with saving event creator name to the database

- Implementing Sign out functionality

- Report generation functionality

- Details regarding UI formatting for form pages

- Users Stories for upcoming sprint

- Notification functionality and logistics

- Generating reports logistics

### Key Discussion Points:

1. Discussed resolving issue with event creator name

    Settled on saving user name to local storage so event creator name will not be saved as unknown

2. Discussed UI formatting for forms, calendars, and details on dashboards

    Discussed details regarding icons and colours on dashboards. Members voted to keep a preferred design.

    Discussed possibility of reformatting log-in / sign up page if time allows.

    Discussed possibility of adding profile images to dashboard pages

3. Planned and Assigned User Stories for coming sprint

    Added user stories to handle managing bookings

    Added user stories to handle generating reports

    Added user stories to handle notifications

    Assigned user stories to members

4. Discussed Logic around how notifications should be implemented

	Debated in app vs email notifications
	
    Some team members settled on email notifications for users for facility closures and bookings. 

5. Discussed logic regarding reports

    Members agreed reports will be broken down into three cards.

6. Assignments

    Tawana  - Usage Trends Reports  

    Amahle - Maintenance Reports  

    Phumla - Manage Bookings and booking notifications  

    Austin - Events calendar and notifications for events  

    Thembu - Facility Staff Notifications  

    Lindiwe - Custom View Reports

Next meeting: 30 April 2025

## 30 April 2025

> Date: 30 April 2025.

> Time: 17:30.

> Platform: Microsoft Teams.

> Attendees: All Team Members.

### Agenda:
- Discuss progress on report pages

- Clarify assignments for facility usage, maintenance, and custom reports

- Review dashboard integration for report generation

- Determine export formats and content

- Address user bookings review and feedback features

### Key Discussion Points:

1. Facility Usage Report Page:

    Functional version pushed to a separate branch.

    Includes data logging for bookings and issue reports.

    Allows filtering by date, facility, and type (bookings/issues).

    CSV and PDF export implemented.

2. Maintenance and Custom Reports:

    Maintenance report in progress.

    Custom view report allows flexible filters like date range, facility, usage stats.

    Coordination needed to avoid duplicated work, members encouraged to merge code into shared components.

3. Dashboard Integration:

    New dashboard with three cards: usage trends, maintenance, and custom view.

    Clicking a card navigates to the appropriate report page.

4. Export Format and Content:

    Exported reports to include more detailed data, not just table views.

    Discussions around enriching PDF/CSV output with user names and facility details.

5. Resident Booking Review:

    Proposal to replace resident calendar with a booking review page.

    Bookings will show current status (pending, approved, declined).

    Suggested ability for admins to attach reasons when declining bookings.

6. Final Remarks:

    Confirmation of deployment status and missing tests.

Next meeting: 1 May 2025.


## 1 May 2025

> Date: 1 May 2025.

> Time: 17:30.

> Platform: Microsoft Teams.

> Attendees: All Team Members.

### Agenda:

- Resolve errors and questions around custom report view

- Clarify division of report responsibilities

- Share updates on maintenance and facility reports

- Finalize export structure and dropdown filters

- Prepare for upcoming project presentation

### Key Discussion Points:

1. Custom View Report:

    Confusion around overlap with facility and maintenance reports.

    Confirmed that users should be able to choose which data to include.

    Plan to reuse and adapt functions from other reports for efficiency.

2. Maintenance Report Updates:

    Includes bar graphs, filtering by status, and data fetching issues.

    Problems with retrieving assigned facility data from Firestore.

    Proposal to enrich report with calculated stats.

3. Export File Improvements:

    Suggestion to revise PDF/CSV structure to be more informative.

    Export should reflect applied filters and contain more contextual info.

4. Filtering and Fetching Fixes:

    Resolved confusion over field vs. document fetching in Firestore.

    Clarified data paths and document structure for facility names and issue categories.

5. UI Cleanup Suggestions:

    Recommendation to change free-text facility input to a dropdown.

6. Final Remarks:

    Reinforcement to push code regularly.

    Agreed to finalize work and verify functionality for the upcoming presentation.

Next Meeting: 2 May 2025

## 2 May 2025
Date: 2 May 2025.
Time: 19:30.
Platform: Microsoft Teams.
Attendees: All Team Members.

### Agenda:

- Clarify content for Maintenance and Custom View Report pages

- Review PDF export and formatting

- Discuss UML diagram updates

- Review appearance of UI features and email functionality

### Key Discussion Points:

1. Maintenance and Custom View Report Pages:

    Discussed content requirements for the Custom View page to help clarify what should be included.

    Wendy received clarification and feedback to resolve uncertainty in her implementation.


2. UML Diagrams:

    Team discussed the need to update UML class diagrams.

    Commitment was made to send updated diagrams over the weekend.

3. UI and Email Functionality:

    General satisfaction expressed with the current appearance of UI components.

    Email notifications for booking approval were reviewed.

    Bug suspected due to role switching during test, teammates agreed to retest properly.

Next Meeting: 4 May 2025

### 4 May 2025
Date: 4 May 2025.
Time: 18:30.
Platform: Microsoft Teams.
Attendees: All Team Members.

### Agenda:

- Confirm progress on individual parts

- Finalize PDF and usage trends features

- Review pending user stories and merge status

- Update notification functionality and documentation

- Conduct UI and responsiveness checks

### Key Discussion Points:

1. Status of Team Members' Parts:

    Some parts not yet live due to merge conflicts and ongoing fixes.

    Members clarified their progress and pending tasks like PDF generatio and errors in code.

2. Pending User Stories:

    6–7 total stories, with some still requiring final merges.

    User stories include approve or decline bookings, usage trends, and notification updates.

3. Notifications Functionality:

    Reviewed logic for when users receive notifications.

    Discussed what triggers notifications and which team members implemented which parts.

4. PDF Generation and Bug Fixes:

    Confirmed that PDF export is functioning, but formatting and browser compatibility issues experienced.

5. UI Review and Responsiveness:

    Minor navigation and routing bugs identified.

    Responsiveness issues were flagged — to be addressed in next sprint.

6. Documentation Updates:

    Some documentation still incomplete.

    Plan made to finalize within an hour after the meeting.