import * as JSZip from "jszip";
import {Course} from "./Course";
import {JSZipObject} from "jszip";
import {InsightError} from "./IInsightFacade";
import {Room} from "./Room";
import {Building, GeoResponse} from "./Building";
import InsightFacade from "./InsightFacade";

export class JSZipHandler {
    public Buildings: Building[];
    public parseZip(file: JSZipObject, allFile: object[]) {
        allFile.push(file.async("text").then(function (result: string) {
                let array: Course[] = [];
                let dataObject = JSON.parse(result);
                let data1 = dataObject["result"];
                let data2 = Object.values(data1);
                for (let val of Object.values(data2)) {
                    let a: Course = new Course();
                    a = a.generateCourse(Object(val));
                    if (a !== null) {
                        array.push(a);
                    }
                }
                if (array.length !== 0) {
                    return array;
                } else {
                    return null;
                }
            }
        ).catch(function ( error: Error) {
            return null;
        }));
    }

    public parseHtml(file: JSZipObject, allFile: object[], path: string, ins: InsightFacade) {
        let that = this;
        allFile.push(file.async("text").then(function (result: string) {
            let parse5 = require("parse5");
            let tmp = parse5.parse(result);
            if (path.includes("index") === true) {
                let resultBuilding = that.extractBuildingTable(tmp);
                ins.allBuildings = resultBuilding;
                return null;
            } else {
                let building = path.split("/")[path.split("/").length - 1];
                let roomInBuilding: Room[] = that.ectractRoomTable(tmp, building);
                if (roomInBuilding === null) {
                    return null;
                }
                if (roomInBuilding.length !== 0) {
                    return roomInBuilding;
                } else {
                    return null;
                }
            }
        }));
    }

    public getRoomInformation (t: any, room: Room): Room {
        let that = this;
        let seatsNode = that.nodeFinder(t, "views-field views-field-field-room-capacity");
        if (that.typeChecker2(seatsNode) && seatsNode !== null) {
            room.seats = Number(seatsNode["childNodes"][0]["value"]);
        }
        let numNode = that.nodeFinder(t,  "views-field views-field-field-room-number");
        if (that.typeChecker1(numNode) && numNode !== null) {
            room.num = numNode["childNodes"][1]["childNodes"][0]["value"];
        }
        let furNode = that.nodeFinder(t, "views-field views-field-field-room-furniture");
        if (that.typeChecker2(furNode) && furNode !== null) {
            room.furniture = String(furNode["childNodes"][0]["value"]).trim();
        }
        let typeNode = that.nodeFinder(t, "views-field views-field-field-room-type");
        if (that.typeChecker2(typeNode) && typeNode !== null) {
            room.type = String(typeNode["childNodes"][0]["value"]).trim();
        }
        let hrefNode = that.nodeFinder(t, "views-field views-field-nothing" );
        if (typeof hrefNode !== "undefined") {
            if (typeof hrefNode["childNodes"] !== "undefined" && hrefNode !== null) {
                let sub = hrefNode["childNodes"];
                for (let z of sub) {
                    if (typeof z["attrs"] !== "undefined") {
                        if (z["attrs"][0]["name"] === "href") {
                            room.href = z["attrs"][0]["value"];
                        }
                    }
                }
            }
        }
        return room;
    }

    public typeChecker1(k: any): boolean {
        if (typeof k === "undefined") {
            return false;
        }
        if (typeof k["childNodes"] !== "undefined") {
            if (typeof k["childNodes"][1] !== "undefined") {
                if (typeof k["childNodes"][1]["childNodes"] !== "undefined") {
                    if (typeof k["childNodes"][1]["childNodes"][0] !== "undefined") {
                        if (typeof k["childNodes"][1]["childNodes"][0]["value"] !== "undefined") {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    public typeChecker2(k: any): boolean {
        if (typeof k === "undefined") {
            return false;
        }
        if (typeof k["childNodes"] !== "undefined") {
            if (typeof k["childNodes"][0] !== "undefined") {
                if (typeof k["childNodes"][0]["value"] !== "undefined") {
                    return true;
                }
            }
        }
        return false;
    }


    public ectractRoomTable(htmlBody: any, building: string): any {
        let that = this;
        if (typeof htmlBody === "undefined" || htmlBody === null) {
            return null;
        }

        if (htmlBody["nodeName"] === "tbody") {
            if (typeof htmlBody["childNodes"] === "undefined") {
                return null;
            }
            let chn = htmlBody["childNodes"];
            let array: Room[] = [];
            if (typeof chn !== "undefined") {
                for (let t of chn) {
                    if (typeof t !== "undefined") {
                        if (typeof t["nodeName"] !== "undefined") {
                            if (t["nodeName"] === "tr") {
                                let room = new Room();
                                room.shortname = building;
                                room = that.getRoomInformation(t, room);
                                room.name = room.shortname.concat("_", room.num);
                                if (room.validateRoomTable() === true) {
                                    array.push(room);
                                }
                            }
                        }
                    }
                }
            }
            if (array.length !== 0) {
                return array;
            } else {
                return null;
            }
        } else {
            let children = htmlBody["childNodes"];
            if (typeof children !== "undefined") {
                for (let i of children) {
                    let b = that.ectractRoomTable(i, building);
                    if (b !== null) {
                        return b;
                    }
                }
            } else {
                return null;
            }
            return null;
        }
    }

    public extractBuildingTable(htmlBody: any): any {
        let that = this;
        if (typeof htmlBody === "undefined" || htmlBody === null) {
            return null;
        }
        if (htmlBody["nodeName"] === "tbody") {
            let chn = htmlBody["childNodes"];
            let builds: Building[] = [];
            if (typeof chn !== "undefined") {
                for (let t of chn) {
                    if (typeof t["nodeName"] !== "undefined") {
                        if (t["nodeName"] === "tr") {
                            let build: Building = new Building();
                            let snNode = that.nodeFinder(t, "views-field views-field-field-building-code");
                            if (that.typeChecker2(snNode) && snNode !== null) {
                                build.shortName = String(snNode["childNodes"][0]["value"]).trim();
                            }
                            let funameNode = that.nodeFinder(t, "views-field views-field-title");
                            if (that.typeChecker1(funameNode) && funameNode !== null) {
                                build.fullName = String(funameNode["childNodes"][1]["childNodes"][0]["value"]).trim();
                            }
                            let addNode = that.nodeFinder(t, "views-field views-field-field-building-address");
                            if (that.typeChecker2(addNode) && addNode !== null) {
                                build.address = String(addNode["childNodes"][0]["value"]).trim();
                            }
                            if (build.checkValid() === true) {
                                builds.push(build);
                            }
                        }
                    }
                }
            }
            if (builds.length !== 0) {
                /*this is a building table*/
                return builds;
            } else {
                /*this is not a building table*/
                return null;
            }
        } else {
            let children = htmlBody["childNodes"];
            if (typeof children !== "undefined" && children !== null) {
                for (let i of children) {
                    let b = that.extractBuildingTable(i);
                    if (b !== null) {
                        return b;
                    }
                }
            } else {
                return null;
            }
            return null;
        }
    }

    public parseHelper(k: any, room: Room) {
        let that = this;
        let seatsNode = that.nodeFinder(k, "views-field views-field-field-room-capacity");
        room.seats = Number(seatsNode["childNodes"][0]["value"]);
        let numNode = that.nodeFinder(k,  "views-field views-field-field-room-number");
        room.num = numNode["childNodes"][1]["childNodes"][0]["value"];
        let furNode = that.nodeFinder(k, "views-field views-field-field-room-furniture");
        room.furniture = String(furNode["childNodes"][0]["value"]).trim();
        let typeNode = that.nodeFinder(k, "views-field views-field-field-room-type");
        room.type = String(typeNode["childNodes"][0]["value"]).trim();
        let hrefNode2 = that.nodeFinder2(k, "href");
        room.href = hrefNode2["attrs"][0]["value"];
    }

    public nodeFinder(node: any, field: string): any {
        let children = node["childNodes"];
        if (typeof children === "undefined") {
            return null;
        }
        let attrs = node["attrs"];
        if (typeof attrs === "undefined") {
            return null;
        }
        for (let i in node["attrs"]) {
            if (node["attrs"][i]["value"] === field) {
                return node;
            }
        }
        for (let t in node["childNodes"]) {
            let result =  this.nodeFinder(node["childNodes"][t], field);
            if (typeof result !== "undefined" && result !== null) {
                return result;
            }
        }
    }

    public nodeFinder2(node: any, field: string): any {
        let children = node["childNodes"];
        if (typeof children === "undefined") {
            return null;
        }
        let attrs = node["attrs"];
        if (typeof attrs === "undefined") {
            return null;
        }
        for (let i in node["attrs"]) {
            if (node["attrs"][i]["name"] === field) {
                return node;
            }
        }
        for (let t in node["childNodes"]) {
            let result =  this.nodeFinder(node["childNodes"][t], field);
            if (typeof result !== "undefined" && result !== null) {
                return result;
            }
        }
    }

}
