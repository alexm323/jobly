"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
// const Company = require("./company.js");
const Job = require("./job.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll
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
           WHERE title = 'newJob'`);
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

/*********************************** FIND ALL w/ and w/o filters */
describe("findAll", function () {
    test("works: no filter", async function () {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "j1",
                salary: 100,
                equity: "0",
                companyHandle: 'c1'
            },
            {
                id: expect.any(Number),
                title: "j2",
                salary: 200,
                equity: "0.02",
                companyHandle: 'c2'
            },
            {
                id: expect.any(Number),
                title: "j3",
                salary: 300,
                equity: "0.03",
                companyHandle: 'c3'
            }
        ]
        );
    });
    test("works: equity filter", async function () {
        let jobs = await Job.findAll({ hasEquity: true });
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "j2",
                salary: 200,
                equity: "0.02",
                companyHandle: 'c2'
            },
            {
                id: expect.any(Number),
                title: "j3",
                salary: 300,
                equity: "0.03",
                companyHandle: 'c3'
            }
        ]
        );
    });
    test("works: title filter", async function () {
        let jobs = await Job.findAll({
            title: '2'
        });
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "j2",
                salary: 200,
                equity: "0.02",
                companyHandle: 'c2'
            }
        ]
        );
    });
    test("works: salary filter", async function () {
        let jobs = await Job.findAll({
            minSalary: 200
        });
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "j2",
                salary: 200,
                equity: "0.02",
                companyHandle: 'c2'
            },
            {
                id: expect.any(Number),
                title: "j3",
                salary: 300,
                equity: "0.03",
                companyHandle: 'c3'
            }
        ]
        );
    });
    test("works: salary filter w/ title", async function () {
        let jobs = await Job.findAll({
            minSalary: 200,
            title: '3'
        });
        expect(jobs).toEqual([

            {
                id: expect.any(Number),
                title: "j3",
                salary: 300,
                equity: "0.03",
                companyHandle: 'c3'
            }
        ]
        );
    });
});
describe("/get by id", function () {
    test("works", async function () {
        let job = await Job.get(1);
        expect(job).toEqual(
            {
                id: 1,
                title: "j1",
                salary: 100,
                equity: "0",
                companyHandle: 'c1'
            }


        );
    });

});
describe("/patch by id", function () {
    test("works", async function () {
        let data = {
            "title": "Tech recruiter",
            "salary": 69000
        }
        let job = await Job.update(1, data);
        expect(job).toEqual(
            {
                id: 1,
                title: "Tech recruiter",
                salary: 69000,
                equity: "0",
                companyHandle: 'c1'
            }


        );
    });

});
describe("/delete by id", function () {
    test("works", async function () {
        await Job.remove(3);
        const res = await db.query(
            "SELECT title FROM jobs WHERE title='j3'");
        expect(res.rows.length).toEqual(0);
    });

});
