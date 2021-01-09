"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
// const companyUpdateSchema = require("../schemas/companyUpdate.json");

const router = new express.Router();


/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

// router.post("/", async function (req, res, next) {
//     try {
//         const validator = jsonschema.validate(req.body, companyNewSchema);
//         if (!validator.valid) {
//             const errs = validator.errors.map(e => e.stack);
//             throw new BadRequestError(errs);
//         }

//         const company = await Company.create(req.body);
//         return res.status(201).json({ company });
//     } catch (err) {
//         return next(err);
//     }
// });
router.post("/", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Job.create(req.body);
        return res.status(201).json({ job });
    } catch (err) {
        return next(err);
    }
});


/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", ensureAdmin, async function (req, res, next) {
    try {
        // checking if the there is any filtering happening from the query string
        const queryKeysArray = Object.keys(req.query)
        // if there is no query values then we will just return a list of all of the companies
        if (queryKeysArray.length === 0) {
            const jobs = await Job.findAll();
            return res.json({ jobs });

        } else {
            // otherwise here we are going to be using our findAll filter which accepts an argument of the query string and based off of that our filter changes and our query changes with it 
            // console.log(req.query)
            const filteredJobs = await Job.findAll(req.query)
            // return res.send(queryKeysArray)
            // return the response we get back
            return res.json({ filteredJobs })
        }




    } catch (err) {
        return next(err);
    }
});

// /** GET /[handle]  =>  { company }
//  *
//  *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
//  *   where jobs is [{ id, title, salary, equity }, ...]
//  *
//  * Authorization required: none
//  */

router.get("/:id", ensureAdmin, async function (req, res, next) {
    try {
        const job = await Job.get(req.params.id);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

// /** PATCH /[handle] { fld1, fld2, ... } => { company }
//  *
//  * Patches company data.
//  *
//  * fields can be: { name, description, numEmployees, logo_url }
//  *
//  * Returns { handle, name, description, numEmployees, logo_url }
//  *
//  * Authorization required: login
//  */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.update(req.params.id, req.body);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

// /** DELETE /[handle]  =>  { deleted: handle }
//  *
//  * Authorization: login
//  */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
    try {
        await Job.remove(req.params.id);
        return res.json({ deleted: req.params.id });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
