# FACILITY PRO SD PROJECT

# READ ME WALK THROUGH

# USING FACILITY PRO
The following is the link to site hosted on azure: 

https://purple-flower-02549321e.6.azurestaticapps.net/ 

This link can also be found in the submitted documentation in the appropriate section.

You may sign up and log in as a resident using google. You may also sign up and log in as a resident using email and password. NB: When signing up as a resident, please use a valid (real) email address, as emails will be sent to this email address. This is important for checking the notification functionality for the app. 

To use the app as an admin, use the following credentials:
- email: markingadmin@gmail.com
- password: markingadmin
  
To use the app as a staff member, use the following credentials:
- email: markingstaff123@gmail.com
- password: markingstaff

# RUNNING FACILITY PRO LOCALLY

To run facility pro locally, create the following file in the root folder:

file name: 

.env

Copy and paste the following into the file: 

Please see documentation, under the "Running Facility-Pro Locally" section. The file contents cannot be kept in the readme due to information sensitivity.


Once this is done, make sure to save the file, and then run the app using:

- npm install
- npm run dev

## Note: 
This requires that you have Node.js installed on your device.


# NAVIGATING THE REPOSITORY
 The repository contains all the files that have to do with Facility pro's front and back end.

## src
 The source folder contains all front end components. It is divided up into four main folders:
- admin - This folder contains all the admin UI components, such as the admin dashboard or the user management page.
- resident - This folder contains all the resident UI components, such as the calender page (where bookings are made) and the resident dashboard.
- staff - This folder contains all the staff UI components, such as the Issue Management page and staff dashboard.
- tests - This folder contains all the tests for components and logic

## functions
 This folder all the cloud functions that handle the logic of Facility-Pro. All functions can be found in index.js

## backend
 This folder contains the setup for our firebase firestore database, and the functions that request our cloud functions, that are then used in the front-end.

## .github/workflows
 Contains workflows for code coverage and deployment to azure

## docs
 Contains documentation that has to do with the scrum methodology. Also contains user stories and user acceptance tests that were worked on per sprint



