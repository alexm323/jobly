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

    /** Find all jobs.
     *
     * Returns [{ id, title, salary, equity, companyHandle }, ...]
     * */
    /** 
   * We add in a filter method to be able to search for 3 stackable filters, search by the following hasEquity(true or false), minSalary(the minimum salary for a job), and title(the job title)
   * all of these can be used seperately or in conjuction
   */
    // Add in an optional parameter for search filters that accepts an object of the 3 potential search filters
    static async findAll(searchFilters = {}) {

        // create a base query variable so that we can build our SQL query later with additional parameters
        let query = `SELECT id,title,salary,equity,company_handle AS "companyHandle" FROM jobs`
        // empty array to track the expressions we will be querying, will be the WHERE clause expressions
        let filterQueries = []
        // The values for the where clauses 
        let queryValues = []
        // deconstruct the searchFilters object so we can extract the values that we want to query
        const { title, minSalary, hasEquity } = searchFilters;
        // add each type of filter to the arrays so we know what we need to add to our WHERE clause 
        // if there is a minEmployees in the query string we will add it the the filterQueries array to make our sql late
        // filter to see if there is equity, equity would count as anything above 0 
        if (hasEquity) {
            // push the value to where we keep the where clauses 
            queryValues.push(0)
            // this is where we build a part of our overall query to add to the base query
            filterQueries.push(`equity > $${queryValues.length}`)

        }
        // check to see if there is a minSalary req
        if (minSalary !== undefined) {
            // we want that number as a value pushed into our queryValues array 
            queryValues.push(minSalary);
            // our WHERE clause
            filterQueries.push(`salary >= $${queryValues.length}`)
        }
        // adjust the query to filter by title 
        if (title) {
            // Using %title% here allows us to use sql to find patterns that match this title from our database 
            queryValues.push(`%${title}%`)
            // now we just add in the sql statement before we add it all together 
            filterQueries.push(`title ILIKE $${queryValues.length}`)
        }
        // now with our if statements populating the filter query we can build it and we should end up with 0 -  3 variables ($1,$2,$3) depending on how many filters the user would like to apply \

        // if we have at least 1 query active then we want to adjust our query and seperate them with WHERE and AND to combine the queries
        if (filterQueries.length > 0) {
            query = query + ` WHERE ` + filterQueries.join(' AND ');

        }
        // order the query results by title of the job before we return them, could also add in a param to order this in any way that we want 
        query = query + " ORDER BY title";
        const jobRes = await db.query(query, queryValues)
        return jobRes.rows;
    }

    // get a specific job buy the id number
    static async get(id) {
        // standard job response by the id as a WHERE clause 
        const jobRes = await db.query(
            `SELECT id,
                      title,
                      salary,
                      equity,
                      company_handle AS "companyHandle"
               FROM jobs
               WHERE id = $1`,
            [id]);
        // we want to return the singular job we should be getting back
        const job = jobRes.rows[0];
        // if there is nothing in job then the job was not found for that particular id
        if (!job) throw new NotFoundError(`No job with id: ${id}`);
        // otherwise we just return job
        return job;
    }

    // our update here like the company update will be capable of updating in part or in whole
    static async update(id, data) {
        // we will be using our helper function to help build our specific update query     
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {});

        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE jobs 
                          SET ${setCols} 
                          WHERE id = ${idVarIdx} 
                          RETURNING id, 
                                    title, 
                                    salary, 
                                    equity,
                                    company_handle AS "companyHandle"`;
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);

        return job;
    }
    // adding the ability to remove a job specifically by id 
    static async remove(id) {
        const result = await db.query(
            `DELETE
               FROM jobs
               WHERE id = $1
               RETURNING title`,
            [id]);
        const job = result.rows[0];
        // dont find the job and we throw an error
        if (!job) throw new NotFoundError(`No job with the id of: ${id}`);
    }


}


module.exports = Job;


