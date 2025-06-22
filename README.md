# aakasmik-nidhi-sanstha
This is a MERN stack project to provide digital solution to Contingency Fund Youth Association Barkangango(आकस्मिक निधि युवा संस्था बरकनगांगो).

## Considerations

- There will be three types of role for users:
    - Super Admin: To manage admins
    - Admin: To manage members
    - Member: Real end users who will contribute to the Association and get benefitted when required

## Features

- Registration: Each and every user has to register first. Fields for registration:
    - Name
    - Father's Name
    - Phone Number(Should match with payment mobile number)
    - Email Id(Optional)
    - Occupation
    - Password

- Login: User should login with phone number and password. User login should persist in Local Storage.
- Landing Page: Default landing page would show past contributions table and a image upload field for current month contribution. There will be some customization for each roles:
    - Super Admin: Includes a page link to manage admin
    - Admin: Includes a page link to manage members
    - Member: They would just have default page.

- Manage Admin Page: This will have a table of users with filter feature. There should be a column of a button for 'Make Admin'.
Also if a user is admin then show 'Remove Admin'.

- Manage Member Page: This page is very important. Features:
    - If a new user has registered. That will require approval from Admin. So there would be a page/tab to approve/reject the registration.
    - Show current month contribution table: Two tables- paid and due
    - Export to Excel option for both table.

- Test Push:
   - version: 2


## TODO
- Create a nodejs api on vercel to use node-cron and fire this get call in 5 mins interval
https://aakasmik-nidhi-backend.onrender.com/health

- Use Redux to manage state for upload and anything else.