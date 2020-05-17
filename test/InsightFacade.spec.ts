import {assert, expect} from "chai";
import * as fs from "fs-extra";
import {InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import TestUtil from "./TestUtil";
import Scheduler from "../src/scheduler/Scheduler";
import {SchedRoom, SchedSection} from "../src/scheduler/IScheduler";
// This should match the schema given to TestUtil.validate(..) in TestUtil.readTestQueries(..)
// except 'filename' which is injected when the file is read.
export interface ITestQuery {
    title: string;
    query: any;  // make any to allow testing structurally invalid queries
    isQueryValid: boolean;
    result: any;
    filename: string;  // This is injected when reading the file
}

describe("InsightFacade Add/Remove Dataset", function () {
    // Reference any datasets you've added to test/data here and they will
    // automatically be loaded in the 'before' hook.
    const datasetsToLoad: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        rooms: "./test/data/rooms.zip",
        empty: "./test/data/empty.zip",
        nosection: "./test/data/empty.zip",
        invalid: "./test/data/incorrectstructure.zip",
        courses2: "./test/data/courses.zip",
        onevalid: "./test/data/oneValid.zip"
    };
    let datasets: { [id: string]: string } = {};
    let insightFacade: InsightFacade;
    const cacheDir = __dirname + "/../data";
    before(function () {
        // This section runs once and loads all datasets specified in the datasetsToLoad object
        // into the datasets object
        Log.test(`Before all`);
        for (const id of Object.keys(datasetsToLoad)) {
            datasets[id] = fs.readFileSync(datasetsToLoad[id]).toString("base64");
        }
    });
    beforeEach(function () {
        // This section resets the data directory (removing any cached data) and resets the InsightFacade instance
        // This runs before each test, which should make each test independent from the previous one
        Log.test(`BeforeTest: ${this.currentTest.title}`);
        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });
    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });
    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });
    it("underscore fail", function () {
        const id: string = "courses_";
        const name: string = "courses_";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError, "InsightError");
        });
    });
    it("crash fail 2", function () {
        const id: string = "course";
        const name: string = "course";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError, "InsightError");
        });
    });
    // This is a unit test. You should create more like this!
    it("Should add a valid dataset", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect(result).to.deep.equal(expected);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });
    });
    it("Should add a valid dataset with only one section", function () {
        const id: string = "onevalid";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect(result).to.deep.equal(expected);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });
    });

    it("Should add a rooms dataset", function () {
        const id: string = "rooms";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms).then((result: string[]) => {
            expect(result).to.deep.equal(expected);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });
    });

    it("rooms fail", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError, "InsightError");
        });
    });

    it("empty courses fail", function () {
        const id: string = "empty";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError, "InsightError");
        });
    });

    it("no valid sections fail", function () {
        const id: string = "empty";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError, "InsightError");
        });
    });

    it("wrong structure fail", function () {
        const id: string = "invalid";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError, "InsightError");
        });
    });
    it("whitespace fail", function () {
        const id: string = "   ";
        const name: string = "courses";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError, "InsightError");
        });
    });
    it("crash fail", function () {
        const id: string = "fake";
        const name: string = "fake";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError, "InsightError");
        });
    });
    it("crash fail 3", function () {
        const id: string = "fake2";
        const name: string = "fake2";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError, "InsightError");
        });
    });
    it("crash fail 4", function () {
        const id: string = "course";
        const name: string = "different";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[name], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError, "InsightError");
        });
    });
    it("two addition", function () {
        const id: string = "courses";
        const id2: string = "courses2";
        const expected: string[] = ["courses"];
        const expected2: string[] = ["courses", "courses2"];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((res1: string[]) => {
            return insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses);
        }).then((res2: string[]) => {
            expect(res2).to.deep.equal(expected2);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });
    });
    it("duplicate", function () {
        const id: string = "courses";
        const expected: string[] = ["repeat"];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((res1: string[]) => {
            return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        }).then((res2: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError, "InsightError");
        });
    });
    it("Add two datasets and list them", function () {
        const id: string = "courses";
        const id2: string = "courses2";
        const expectedDataset: string[] = [id];
        expectedDataset.push(id2);
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result1: string[]) => {
            return insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses);
        }).then((result2: string[]) => {
            return insightFacade.listDatasets();
        }).then((result3: InsightDataset[]) => {
            expect(result3.length).to.equal(2);
        }).catch((err: any) => {
            expect.fail(err, 2, "Should not have rejected");
        });
    });
    it("success remove", function () {
        const id: string = "courses";
        const name: string = "courses";
        const expected: string = id;
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((res1: string[]) => {
            return insightFacade.removeDataset(id);
        }).then((res2: string) => {
            expect(res2).to.deep.equal(expected);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });
    });
    it("fail remove", function () {
        const id: string = "notexist";
        const expected: string = id;
        return insightFacade.removeDataset(id).then((result: string) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(NotFoundError, "InsightError");
        });
    });
    it("fail remove after it not exist", function () {
        const id: string = "courses";
        const expected: string = id;
        const name: string = "courses";
        return insightFacade.addDataset(id, datasets[name], InsightDatasetKind.Courses).then((res1) => {
            return insightFacade.removeDataset(id);
        }).then((res2) => {
            return insightFacade.removeDataset(id);
        }).then((res3) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(NotFoundError, "notfound");
        });
    });
});

/*
 * This test suite dynamically generates tests from the JSON files in test/queries.
 * You should not need to modify it; instead, add additional files to the queries directory.
 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
 */
describe("InsightFacade PerformQuery", () => {
    const datasetsToQuery: { [id: string]: {path: string, kind: InsightDatasetKind} } = {
        courses: {path: "./test/data/courses.zip", kind: InsightDatasetKind.Courses},
        rooms: {path: "./test/data/rooms.zip", kind: InsightDatasetKind.Rooms},
    };
    let insightFacade: InsightFacade;
    let testQueries: ITestQuery[] = [];
    // Load all the test queries, and call addDataset on the insightFacade instance for all the datasets
    before(function () {
        Log.test(`Before: ${this.test.parent.title}`);
        // Load the query JSON files under test/queries.
        // Fail if there is a problem reading ANY query.
        try {
            testQueries = TestUtil.readTestQueries();
        } catch (err) {
            expect.fail("", "", `Failed to read one or more test queries. ${err}`);
        }
        // Load the datasets specified in datasetsToQuery and add them to InsightFacade.
        // Will fail* if there is a problem reading ANY dataset.
        const loadDatasetPromises: Array<Promise<string[]>> = [];
        insightFacade = new InsightFacade();
        for (const id of Object.keys(datasetsToQuery)) {
            const ds = datasetsToQuery[id];
            const data = fs.readFileSync(ds.path).toString("base64");
            loadDatasetPromises.push(insightFacade.addDataset(id, data, ds.kind));
        }
        return Promise.all(loadDatasetPromises); // .catch((err) => {
        /* *IMPORTANT NOTE: This catch is to let this run even without the implemented addDataset,
         * for the purposes of seeing all your tests run.
         * TODO For C1, remove this catch block (but keep the Promise.all)
         */
        // return Promise.resolve("HACK TO LET QUERIES RUN");
        // });
    });
    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });
    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });
    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // Dynamically create and run a test for each query in testQueries.
    // Creates an extra "test" called "Should run test queries" as a byproduct.
    it("Should run test queries", function () {
        describe("Dynamic InsightFacade PerformQuery tests", function () {
            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, function (done) {
                    const resultChecker = TestUtil.getQueryChecker(test, done);
                    insightFacade.performQuery(test.query)
                        .then(resultChecker)
                        .catch(resultChecker);
                });
            }
        });
    });
});

describe("Scheduler schedule", function () {
    let scheduler: Scheduler;
    beforeEach(function () {
        // This section resets the data directory (removing any cached data) and resets the InsightFacade instance
        // This runs before each test, which should make each test independent from the previous one
        Log.test(`BeforeTest: ${this.currentTest.title}`);
        try {
            scheduler = new Scheduler();
        } catch (err) {
            Log.error(err);
        }
    });
    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });
    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });
});
