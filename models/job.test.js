"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
// const Company = require("./company.js");
const Job = require("./job.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
    const newJob = {
        title: "newJob",
        salary: 420,
        equity: 0.123,
        companyHandle: "c1"
    };

    test("works", async function () {
        let job = await Job.create(newJob);
        expect(job).toEqual(
            {
                "id": expect.any(Number),
                "title": "newJob",
                "salary": 420,
                "equity": "0.123",
                "companyHandle": "c1"
            }
        )

        const result = await db.query(
            `SELECT title, salary, equity,company_handle
           FROM jobs
           WHERE company_handle = 'c1'`);
        expect(result.rows).toEqual([
            {
                title: "newJob",
                salary: 420,
                equity: "0.123",
                company_handle: "c1"
            },
        ]);
    });
});