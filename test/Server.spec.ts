import Server from "../src/rest/Server";

import InsightFacade from "../src/controller/InsightFacade";
import chai = require("chai");
import chaiHttp = require("chai-http");
import Response = ChaiHttp.Response;
import {expect} from "chai";
import Log from "../src/Util";
import * as fs from "fs-extra";

describe("Facade D3", function () {

    let facade: InsightFacade = null;
    let server: Server = null;
    let datasets: { [id: string]: Buffer } = {};
    let data: Buffer;

    chai.use(chaiHttp);
    const datasetsToLoad: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        rooms: "./test/data/rooms.zip"
    };

    before(function () {
        facade = new InsightFacade();
        server = new Server(4321);
        Log.test(`Before all`);
        for (const id of Object.keys(datasetsToLoad)) {
            datasets[id] = fs.readFileSync(datasetsToLoad[id]);
        }
        server.start();
        // TODO: start server here once and handle errors properly
    });

    after(function () {
        server.stop();
        // TODO: stop server here once!
    });

    beforeEach(function () {
        // might want to add some process logging here to keep track of what"s going on
    });

    afterEach(function () {
        // might want to add some process logging here to keep track of what"s going on
    });

    // Sample on how to format PUT requests

    it("PUT test for courses dataset", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .send(datasets["courses"])
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    expect(res.status).to.be.equal(400);
                })
                .catch(function (err) {
                    // some logging here please!
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
        }
    });

    it("post test for rooms dataset", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/rooms/rooms")
                .send(datasets["rooms"])
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    expect(res.status).to.be.equal(400);
                })
                .catch(function (err) {
                    // some logging here please!
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
        }
    });

    it("delete test for courses dataset", function () {
        try {
            return chai.request("http://localhost:4321")
                .del("/dataset/courses")
                .then(function (res: Response) {
                    // some logging here please!
                    expect(res.status).to.be.equal(400);
                })
                .catch(function (err) {
                    // some logging here please!
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
        }
    });

    it("list test for rooms dataset", function () {
        try {
            return chai.request("http://localhost:4321")
                .get("/datasets")
                .then(function (res: Response) {
                    // some logging here please!
                    expect(res.status).to.be.equal(400);
                })
                .catch(function (err) {
                    // some logging here please!
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
        }
    });

    it("perform an invalid query", function () {
        try {
            return chai.request("http://localhost:4321")
                .post("/query")
                .send("ss")
                .then(function (res: Response) {
                    // some logging here please!
                    expect(res.status).to.be.equal(400);
                })
                .catch(function (err) {
                    // some logging here please!
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
        }
    });
    // The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
