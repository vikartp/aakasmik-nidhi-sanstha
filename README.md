# aakasmik-nidhi-sanstha
This is a MERN stack project to provide digital solution to Contingency Fund Youth Association Barkangango(आकस्मिक निधि युवा संस्था बरकनगांगो). This is a completely free of cost deployed project for betterment of village.
This also includes one expo project which is used to build mobile application.

## Tech Stack

- Front End:
  - React+Vite
  - Tailwind CSS
  - Shadcn
  - Expo (for mobile app)

- Back End:
  - Node.js
  - Express.js

- Database:
  - MongoDB 
  - Cloudinary (for image upload)

- Authentication:
  - JWT

## Considerations

- There are three types of role for users:
    - Super Admin: To manage admins and bulk screenshots
    - Admin: To manage members and monthly screenshot verifications
    - Member: All users who will contribute to the Association and get benefitted when required

## Features

- Web Application:
  - SuperAdmin:
    - can assign admin role to any user
    - can delete any user.
    - can delete screenshots of any month
    - can access all screenshots and details of upload
  - Admin:
    - can add contributions for any user 
    - can verify uploaded screenshots
    - can reject screenshot for monthly contribution
    - can verify new user access(to make a new member)
  - Member:
    - Superadmin and admin are member by default so they see/access everything what a member can.
    - can upload monthly contribution screenshot
    - can check monthly contribution table for all users
    - can access monthly contribution and total contribution till date
    - can access his/her own contribution table which shows all contribution till date
    - can access secret key for password reset
    - can check due users and download month wise contribution pdf

- ANidhi Mobile App:
  - We have three tabs in mobile app - Home, Contribution, Web portal
  - Home: Users can see their detail like personal information, contribution and secret
  - Contribution: User can select month and year to check all member contribution
  - Web Portal: User can access entire web app in the third tab so that they get all update without updating the mobile app.

## TODO

- Use Redux to manage state for upload and anything else.