import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";
import * as JSZip from "jszip";
import {JSZipObject} from "jszip";
import * as fs from "fs-extra";
import {Course} from "./Course";
import {Courseset} from "./Courseset";
import {JSZipHandler} from "./JSZipHandler";
import {QueryEngine} from "./queryhandling/QueryEngine";
import {RoomSet} from "./RoomSet";
import {Building, GeoResponse} from "./Building";
import {AbstractInsightDataset} from "./AbstractInsightDataset";
import {Room} from "./Room";
import {isStrictNullChecksEnabled} from "tslint";
export default class InsightFacade implements IInsightFacade {
    public datasets: Course[]; // array of courses
    public allcourseSet: Courseset[]; // array of course arrays
    public allRoomSet: RoomSet[];
    public idList: string[];
    public allBuildings: Building[];

    constructor() {
        this.idList = [];
        this.allcourseSet = [];
        this.datasets = [];
        this.allRoomSet = [];
        const dir = fs.readdirSync("./data");
        for (let i of dir) {
            let info: string[] = i.split("_");
            if (info[0] === "course") {
                let data2 = fs.readFileSync("./data/".concat(i)).toString();
                let obj = JSON.parse(data2);
                if (obj !== null) {
                    let k: Courseset = new Courseset();
                    k.kind = InsightDatasetKind.Courses;
                    k.numRows = obj["numRows"];
                    k.id = obj["id"];
                    let tmplist: Course[] = [];
                    for (let c of obj["courses"]) {
                        let tmp: Course = new Course();
                        tmp.uuid = c["uuid"];
                        tmp.section = c["section"];
                        tmp.avg = c["avg"];
                        tmp.instructor = c["instructor"];
                        tmp.year = c["year"];
                        tmp.title = c["title"];
                        tmp.pass = c["pass"];
                        tmp.fail = c["fail"];
                        tmp.audit = c["audit"];
                        tmp.dept = c["dept"];
                        tmp.id = c["id"];
                        tmplist.push(tmp);
                    }
                    k.courses = tmplist;
                    this.allcourseSet.push(k);
                }
            } else if (info[0] === "room") {
                this.loadRoom(i);
            }
        }
        Log.trace("InsightFacadeImpl::init()");
    }

    public getIdList(): string[] {
        let allList: string[];
        let rooms = this.allRoomSet.map(({id}) => id);
        let courses = this.allcourseSet.map(({id}) => id);
        let final = rooms.concat(courses);
        return final;
    }

    public getDatasetList(): any[] {
        let courses: AbstractInsightDataset[] = this.allcourseSet;
        let rooms: AbstractInsightDataset[] = this.allRoomSet;
        return courses.concat(rooms);
    }

    public idChecker(id: string) {
        let that = this;
        if (id.includes("_") || that.getIdList().includes(id) || typeof id === "undefined") {
            return false;
        } else if (id.trim().length === 0) {
            return false;
        } else {
            return true;
        }
    }

    public addDataset(idl: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        let that = this;
        let allFile: object[] = [];
        return new Promise(function (resolve, reject) {
            try {
                if (that.idChecker(idl) === false) {
                    throw new InsightError();
                }
                if (kind === InsightDatasetKind.Courses) {
                    JSZip.loadAsync(content, {base64: true}).then(function (zip: JSZip) {
                        zip.forEach(function (relativePath: string, file: JSZipObject) {
                            if (file.dir !== true) {
                                let paths = relativePath.split("/");
                                if (paths[0] !== "courses") {
                                    return null;
                                }
                                let parser = new JSZipHandler();
                                try {
                                    parser.parseZip(file, allFile);
                                } catch (e) {
                                    throw(new InsightError());
                                }
                            }
                        });
                        Promise.all(allFile).then(function (tmplist: object[]) {
                            let tmp1: Courseset = new Courseset();
                            tmp1.parseCourseset(tmplist, idl);
                            that.allcourseSet.push(tmp1);
                            fs.writeFileSync("./data/".concat("course_", idl, ".json"), JSON.stringify(tmp1));
                            resolve(that.getIdList());
                        }).catch(function (err: any) {
                            reject(new InsightError());
                        });
                    }).catch(function () {
                        reject(new InsightError());
                    });
                } else if (kind === InsightDatasetKind.Rooms) {
                    that.addRoomSet(idl, content, allFile).then(function (final: string[]) {
                        resolve(final);
                    }).catch(function (err: any) {
                        reject (new InsightError());
                    });
                } else {
                    reject(new InsightError());
                }
            } catch (e) {
                reject(new InsightError());
            }
        });
    }

    public removeDataset(id: string): Promise<string> {
        let that = this;
        return new Promise(function (resolve, reject) {
            try {
                if (id.includes("_") || id.trim().length === 0 || id === null) {
                    throw new InsightError();
                }
                let idlist = that.getIdList();
                if (idlist.includes(id)) {
                    for (let i in that.allcourseSet) {
                        if (that.allcourseSet[i].id === id) {
                            that.allcourseSet.splice(Number(i), 1);
                        }
                    }
                    for (let i in that.allRoomSet) {
                        if (that.allRoomSet[i].id === id) {
                            that.allRoomSet.splice(Number(i), 1);
                        }
                    }
                }
                let path1: string = "./data/".concat("room_", id, ".json");
                let path2: string = "./data/".concat("course_", id, ".json");
                if (fs.existsSync(path1) || fs.existsSync(path2)) {
                    fs.removeSync(path1);
                    fs.removeSync(path2);
                    resolve(id);
                } else if ( !fs.existsSync(path1) || !fs.existsSync(path2)) {
                    reject(new NotFoundError());
                }
            } catch (err) {
                reject (new InsightError());
            }
        });
    }

    public performQuery(query: any): Promise<any[]> {
        let queryEngine = new QueryEngine();
        let result;
        try {
            result = queryEngine.executeQuery(query, this);
            // console.log(result.length);
        } catch (err) {
            return Promise.reject(err);
        }
        return Promise.resolve(result);
    }

    public listDatasets(): Promise<InsightDataset[]> {
        try {
            let that = this;
            let dataset: InsightDataset[] = [];
            return new Promise(function (resolve, reject) {
                for (let i of that.allcourseSet) {
                    let thisSet: InsightDataset = {kind: i.kind, numRows: i.numRows, id: i.id};
                    dataset.push(thisSet);
                }
                for (let i of that.allRoomSet) {
                    let thisSet: InsightDataset = {kind: i.kind, numRows: i.numRows, id: i.id};
                    dataset.push(thisSet);
                }
                resolve(dataset);
            });
        } catch (err) {
            throw new InsightError();
        }
    }

    public addRoomSet(id: string, content: string, allFiles: object[]): Promise<string[]> {
        let that = this;
        return new Promise(function (resolve, reject) {
            try {
                let parse5 = require("parse5");
                let tmpBuildings: any[];
                JSZip.loadAsync(content, {base64: true}).then(function (zip: JSZip) {
                    zip.forEach(function (relativePath: string, file: JSZipObject) {
                        if (file.dir === false) {
                            let parser = new JSZipHandler();
                            try {
                                parser.parseHtml(file, allFiles, relativePath, that);
                            } catch (e) {
                                throw InsightError;
                            }
                        }
                    });
                    Promise.all(allFiles).then(function (tmplist: object[]) {
                        return tmplist;
                    }).then(function (tmp: object[]) {
                        resolve(that.setLocation(new RoomSet(), id, tmp));
                    }).catch(function (err: any) {
                        reject(new InsightError());
                    });
                });
            } catch (e) {
                reject (new InsightError());
            }
        });
    }

    public setLocation(tmp1: RoomSet, id: string, tmplist: object[]): Promise<string[]> {
        let that = this;
        return new Promise<string[]>(function (resolve, reject) {
            try {
                let pro: any[] = [];
                for (let i of that.allBuildings) {
                    pro.push(i.getLatLon().then(function (geolocation: GeoResponse) {
                        if (typeof geolocation.error === "undefined") {
                            i.lat = geolocation.lat;
                            i.lon = geolocation.lon;
                        }
                    }));
                }
                Promise.all(pro).then(function () {
                    tmp1.parseRoomSet(tmplist, id, that.allBuildings);
                    if (tmp1.numRows === 0) {
                        throw( new InsightError());
                    }
                    that.allRoomSet.push(tmp1);
                    fs.writeFileSync("./data/".concat("room_", id, ".json"), JSON.stringify(tmp1));
                    resolve(that.getIdList());
                }).catch(function (err: any) {
                    reject(new InsightError());
                });
            } catch (e) {
                reject (new InsightError());
            }
        });
    }

    public loadRoom(i: string) {
        let data2 = fs.readFileSync("./data/".concat(i)).toString();
        let obj = JSON.parse(data2);
        if (obj !== null) {
            let k: RoomSet = new RoomSet();
            k.kind = InsightDatasetKind.Rooms;
            k.numRows = obj["numRows"];
            k.rooms = obj["rooms"];
            k.id = obj["id"];
            let tmplist: Room[] = [];
            for (let r of obj["rooms"]) {
                let tmp: Room = new Room();
                tmp.name = r["name"];
                tmp.lat = r["lat"];
                tmp.fullname = r["fullname"];
                tmp.address = r["address"];
                tmp.seats = r["seats"];
                tmp.furniture = r["furniture"];
                tmp.type = r["type"];
                tmp.shortname = r["shortname"];
                tmp.num = r["num"];
                tmp.href = r["href"];
                tmp.lon = r["lon"];
                tmplist.push(tmp);
            }
            k.rooms = tmplist;
            this.allRoomSet.push(k);
        }
    }
}
