"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
    /** Create a job (from data), update db, return new company data.
     *
     * data should be { title,salary,equity,company_handle }
     *
     * Returns { id,title,salary,equity,companyHandle}
     *
     * 
     * */

    static async create({ title, salary, equity, companyHandle }) {

        const result = await db.query(
            `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id,title, salary, equity,company_handle AS "companyHandle"`,
            [
                title,
                salary,
                equity,
                companyHandle
            ]);
        const job = result.rows[0];

        return job;
    }

    /** Find all companies.
     *
     * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
     * */
    /** 
   * Filter method for getting a company with a specific name, minimum number of employees or a maximum number of employees
   * we can add in a parameter to findAll that acceepts an object with the search terms as keys and the query params as values 
   * then we can make some if statements to account for each kind of filter they can do 
   */
    // Add in an optional parameter for search filters that accepts an object of the 3 potential search filters
    static async findAll(searchFilters = {}) {

        // create a query variable so we can add a search filter to the end of it as needed, we remove the order by name since we will be adding to the end of the query string as filters are added
        let query = `SELECT id,title,salary,equity,company_handle AS "companyHandle" FROM jobs`
        console.log(query)
        // empty array to track the expressions we will be querying, will be the WHERE clause expressions
        let filterQueries = []
        // The values for the where clauses 
        let queryValues = []
        // deconstruct the searchFilters object so we can extract the values that we want to query
        const { title, minSalary, hasEquity } = searchFilters;
        // add each type of filter to the arrays so we know what we need to add to our WHERE clause 
        // if there is a minEmployees in the query string we will add it the the filterQueries array to make our sql late
        // if the maxEmployees is given a value in the query string
        if (hasEquity) {
            queryValues.push(0)
            filterQueries.push(`equity > $${queryValues.length}`)

        }
        if (minSalary !== undefined) {
            // we want that number as a value pushed into our queryValues array 
            queryValues.push(minSalary);
            // our WHERE clause
            filterQueries.push(`salary >= $${queryValues.length}`)
        }
        if (title) {
            // Using %title% here allows us to use sql to find patterns that match this title from our database 
            queryValues.push(`%${title}%`)
            // now we just add in the sql statement before we add it all together 
            filterQueries.push(`title ILIKE $${queryValues.length}`)
        }
        // now with our if statements populating the filter query we can build it and we should end up with 0 -  3 variables ($1,$2,$3) depending on how many filters the user would like to apply 
        // if we have at least 1 query active 
        if (filterQueries.length > 0) {
            query = query + ` WHERE ` + filterQueries.join(' AND ');

        }
        // order the query results by name of company before we return them, could also add in a param to order this in any way that we want 
        query = query + " ORDER BY title";
        const jobRes = await db.query(query, queryValues)
        // I THINK I WOULD BE SERVED WELL TO TRY TO GET THIS WORKING AS A STANDALONE HELPER FUNCTION CALLED SQLQUERYBUILDER OR SOMETHING, FOR NOW JUST FINISH BUILDING IT OUT  
        return jobRes.rows;
    }
}


module.exports = Job;


