import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import {Room} from "./Room";
import {Building} from "./Building";
import {GeoResponse} from "./Building";
import {AbstractInsightDataset} from "./AbstractInsightDataset";


export class RoomSet extends AbstractInsightDataset {
    public rooms: Room[];
    public id: string;
    public kind: InsightDatasetKind;
    public numRows: number;

    public getContents(): Room[] {
        return this.rooms;
    }

    public parseRoomSet (tmplist: object[], id: string, buildings: Building[]): RoomSet {
        let finalRooms: Room[] = [];
        for (let b of buildings) {
            b.getLatLon().then(function (result: GeoResponse) {
            b.lat = result.lat;
            b.lon = result.lon;
            }).catch(function (err: any) {
                let a = 1;
            });
        }

        for (let i in Object.values(tmplist)) {
            if (tmplist[i] !== null) {
                let saves = Object.values(tmplist[i]);
                for (let j in Object.values(saves)) {
                    if (saves[j] !== null) {
                        let sn = saves[j]["shortname"];
                        let building: Building = null;
                        for (let t of buildings) {
                            if (t.shortName === sn) {
                                building = t;
                            }
                        }
                        if (building !== null) {
                            saves[j]["fullname"] = building.fullName;
                            saves[j]["address"] = building.address;
                            saves[j]["lat"] = building.lat;
                            saves[j]["lon"] = building.lon;
                        }
                        let finalRoom: Room = saves[j];
                        if (finalRoom.validateRoom() === true) {
                            finalRooms.push(finalRoom);
                        }
                    }
                }
            }
        }
        this.rooms = finalRooms;
        this.id = id;
        this.kind = InsightDatasetKind.Rooms;
        this.numRows = finalRooms.length;
        return this;
    }

}
