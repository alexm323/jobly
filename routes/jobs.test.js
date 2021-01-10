"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u3Token
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
        console.log(resp.body)
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

});
