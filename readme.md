# Jobly Backend

This is the Express backend for Jobly, version 2.

To run this:

    node server.js
    
To run the tests:

    jest -i



User flow of the application 

What abilities does a non user have? 
1. A non-user can register
2. A non-user can attempt for a token(which requires registration info)
3. A non-user can see all companies
4. A non-user can search and filter through all companies (name,minEmployees,maxEmployees)
5. A non user can search a company by their handle
6. A non user can see all jobs and filter by (salary,hasEquity,title)


What can users do (in addition to above)?
1. Get their account details using their username
2. Update their account details
3. Delete their account 
4. Apply to a job on their own behalf 


What can admins do (in addition to above) ?
1. Create a user, can create other admins
2. Get all users information
3. Create company
4. Update Company
5. Delete Company
6. Create job
7. Update job
8. Apply to jobs on behalf of a user

Tasks assigned
1. Inspect PartialSQLUpdate Helper function
2. Add Filtering to Companies
3. Detect and apply authorization for companies and users
4. Add a feature for jobs (model,routes, testing)
a. Investigate the Numeric Field Type
b. Add filtering for jobs
c. Show available jobs for a company 
5. Add simple job application functionality