"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u3Token, u1Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /companies */
describe("POST /jobs", function () {
    test("ok for admin", async function () {
        const resp = await request(app)
            .post(`/jobs/`)
            .send({
                title: "newJob",
                salary: 1000,
                equity: "0.0001",
                companyHandle: "c1"
            })
            .set("authorization", `Bearer ${u3Token}`);
        // console.log(resp.body)
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: 'newJob',
                salary: 1000,
                equity: '0.0001',
                companyHandle: 'c1'
            }
        })
    });
    test('rejected if not admin', async function () {
        const resp = await request(app)
            .post(`/jobs/`)
            .send({
                title: "newJob2",
                salary: 2000,
                equity: "0.0002",
                companyHandle: "c1"
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toBe(401)

    });
    test("bad request with invalid data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                title: 'notGonnaWork'
            })
            .set("authorization", `Bearer ${u3Token}`);
        expect(resp.statusCode).toEqual(400);
    });

});

//************************************************************* */ GET /jobs/


describe("GET /companies", function () {
    test("ok for anon", async function () {
        const resp = await request(app).get("/jobs");
        expect(resp.body).toEqual({
            jobs:
                [
                    {
                        id: expect.any(Number),
                        title: "j1",
                        salary: 100,
                        equity: "0",
                        companyHandle: "c1"
                    },
                    {
                        id: expect.any(Number),
                        title: "j2",
                        salary: 200,
                        equity: "0.02",
                        companyHandle: "c2"
                    },
                    {
                        id: expect.any(Number),
                        title: "j3",
                        salary: 300,
                        equity: "0.03",
                        companyHandle: "c3"
                    },
                ],
        });
    }); ``
});

/**GET JOBS WITH FILTERS */

describe("GET /jobs with filter", function () {

    test("filter by title", async function () {
        const resp = await request(app).get("/jobs?title=2");
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual({
            "filteredJobs": [
                {
                    "id": expect.any(Number),
                    "title": "j2",
                    "salary": 200,
                    "equity": "0.02",
                    "companyHandle": "c2"
                }
            ]
        });
    });
    test("filter by equity", async function () {
        const resp = await request(app).get("/jobs?hasEquity=true");
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual({
            "filteredJobs": [
                {
                    "id": expect.any(Number),
                    "title": "j2",
                    "salary": 200,
                    "equity": "0.02",
                    "companyHandle": "c2"
                },
                {
                    "id": expect.any(Number),
                    "title": "j3",
                    "salary": 300,
                    "equity": "0.03",
                    "companyHandle": "c3"
                }
            ]
        });
    });
    test("filter by minSalary", async function () {
        const resp = await request(app).get("/jobs?minSalary=100");
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual({
            "filteredJobs": [
                {
                    "id": expect.any(Number),
                    "title": "j1",
                    "salary": 100,
                    "equity": "0",
                    "companyHandle": "c1"
                },
                {
                    "id": expect.any(Number),
                    "title": "j2",
                    "salary": 200,
                    "equity": "0.02",
                    "companyHandle": "c2"
                },
                {
                    "id": expect.any(Number),
                    "title": "j3",
                    "salary": 300,
                    "equity": "0.03",
                    "companyHandle": "c3"
                }
            ]
        });
    });
    test("filter by higher minSalary", async function () {
        const resp = await request(app).get("/jobs?minSalary=300");
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual({
            "filteredJobs": [
                {
                    "id": expect.any(Number),
                    "title": "j3",
                    "salary": 300,
                    "equity": "0.03",
                    "companyHandle": "c3"
                }
            ]
        });
    });
    test("filter by minSalary and title", async function () {
        const resp = await request(app).get("/jobs?minSalary=200&title=3");
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual({
            "filteredJobs": [
                {
                    "id": expect.any(Number),
                    "title": "j3",
                    "salary": 300,
                    "equity": "0.03",
                    "companyHandle": "c3"
                }
            ]
        });
    });
    test("returns empty array on no matches", async function () {
        const resp = await request(app).get("/jobs?minSalary=400&title=4");
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual({
            "filteredJobs": []
        });
    });
});


/*****************************************GET JOBS/:id */

describe("GET /jobs/:id", function () {
    test("works for anon", async function () {
        const resp = await request(app).get(`/jobs/1`);
        expect(resp.body).toEqual({
            job: {
                "id": 1,
                "title": "j1",
                "salary": 100,
                "equity": "0",
                "companyHandle": "c1"
            }
        });
    });
    test("returns error if id not found", async function () {
        const resp = await request(app).get(`/jobs/0`);
        expect(resp.statusCode).toBe(404);
    });
});

/******************************************************PATCH JOBS
 */

describe("PATCH /companies/:handle", function () {
    test("works for admins", async function () {
        const resp = await request(app)
            .patch(`/jobs/1`)
            .send({
                title: "newJ1",
            })
            .set("authorization", `Bearer ${u3Token}`);
        expect(resp.body).toEqual({
            "job": {
                "id": 1,
                "title": "newJ1",
                "salary": 100,
                "equity": "0",
                "companyHandle": "c1"
            }
        });
    });

    test("unauth for anon", async function () {
        const resp = await request(app)
            .patch(`/jobs/1`)
            .send({
                title: "newJ1",
            });
        expect(resp.statusCode).toEqual(401);
    });

    test("not found on no job id", async function () {
        const resp = await request(app)
            .patch(`/jobs/0`)
            .send({
                title: "newNotJob",
            })
            .set("authorization", `Bearer ${u3Token}`);
        expect(resp.statusCode).toEqual(404);
    });

    test("bad request on id change attempt", async function () {
        const resp = await request(app)
            .patch(`/jobs/1`)
            .send({
                id: 10000000,
            })
            .set("authorization", `Bearer ${u3Token}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request on invalid data", async function () {
        const resp = await request(app)
            .patch(`/jobs/1`)
            .send({
                salary: "A LOT OF MONEY",
            })
            .set("authorization", `Bearer ${u3Token}`);
        expect(resp.statusCode).toEqual(400);
    });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
    test("works for admins", async function () {
        const resp = await request(app)
            .delete(`/jobs/2`)
            .set("authorization", `Bearer ${u3Token}`);
        expect(resp.body).toEqual({ deleted: "2" });
    });

    test("unauth for anon", async function () {
        const resp = await request(app)
            .delete(`/jobs/1`);
        expect(resp.statusCode).toEqual(401);
    });

    test("not found for no such job", async function () {
        const resp = await request(app)
            .delete(`/jobs/0`)
            .set("authorization", `Bearer ${u3Token}`);
        expect(resp.statusCode).toEqual(404);
    });
});