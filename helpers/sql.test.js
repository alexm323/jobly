const { sqlForPartialUpdate } = require("../helpers/sql");
const { BadRequestError } = require("../expressError");

describe("create an output for sql", function () {
    test("returns correct format", function () {
        let data = { num_employees: 10, logo_url: 'https://www.google.com' }
        let jsSql = {
            numEmployees: "num_employees",
            logoUrl: "logo_url",
        }

        let { setCols, values } = sqlForPartialUpdate(data, jsSql)
        expect(setCols).toEqual(`"num_employees"=$1, "logo_url"=$2`)
        expect(values).toEqual([10, 'https://www.google.com'])
    })
    test("throws on empty data", function () {
        let data = {}
        let jsSql = {}

        expect(() => {
            sqlForPartialUpdate(data, jsSql);
        }).toThrow();
    })
})
