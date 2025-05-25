# FACILITY PRO SD PROJECT

# READ ME WALK THROUGH

# USING FACILITY PRO
The following is the link to site hosted on azure:
https://purple-flower-02549321e.6.azurestaticapps.net/
This link can also be found in the submitted documentation in the appropriate section.

You may sign up and log in as a resident using google. You may also sign up and log in as a resident using email and password. 
To use the app as an admin, use the following credentials:
- email:
- password:
To use the app as a staff member, use the following credentials:
- email: markingstaff123@gmail.com
- password: markingstaff (This password applies to signing into the google account as well as signing into Facility–Pro)

# RUNNING FACILITY PRO LOCALLY

To run facility pro locally, create the following file in the root folder:

file name:
.env

Copy and past the following into the file:

VITE_FIREBASE_API_KEY=AIzaSyC1CymHohELYGN7EipJOC5sL9iQe5sIOzc
VITE_FIREBASE_AUTH_DOMAIN=facilty-pro.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=facilty-pro
VITE_FIREBASE_STORAGE_BUCKET=facilty-pro.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=33531147470
VITE_FIREBASE_APP_ID=1:33531147470:web:46c8bc113fdf63a5a4cc9f
VITE_FIREBASE_MEASUREMENT_ID=G-89EB162VPS

Once this is done, make sure to save the file, and the run the app using:

npm run dev

# NAVIGATING THE REPOSITORY
 The repository contains all the files that have to do with Facility pro's front and back end.

## src
 The source folder contains all front end components. It is divided up into four main folders:
- admin - This folder contains all the admin UI components, such as the admin dashboard or the user management page.
- resident - This folder contains all the resident UI components, such as the calender page (where bookings are made) and the resident dashboard.
- staff - This folder contains all the staff UI components, such as the Issue Management page and staff dashboard.
- tests - This folder contains all the tests for components and logic

## functions
 This folder all the cloud functions that handle the logic of Facility-Pro. All functions can be found in index.html

## backend
 This folder contains the setup for our firebase firestore database.

## .github/workflows
 Contains workflows for code coverage and deployment to azure

## docs
 Contains documentation that has to do with the scrum methodology. Also contains user stories and user acceptance tests that were worked on per sprint



