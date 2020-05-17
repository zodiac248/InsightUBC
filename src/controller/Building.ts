export class Building {
    public shortName: string;
    public fullName: string;
    public address: string;
    public lon: number;
    public lat: number;

    public getLatLon(): Promise<GeoResponse> {
        return new Promise((resolve, reject) => {
            let http = require("http");
            let add = encodeURI(this.address);
            let requestString = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team".concat("150/", add);
            http.get(requestString, (resp: any) => {
                let data = "";

                // A chunk of data has been recieved.
                resp.on("data", (chunk: string) => {
                    data += chunk;
                });

                // The whole response has been received. Print out the result.
                resp.on("end", () => {
                    resolve(JSON.parse(data));
                });

            }).on("error", (err: Error) => {
                reject(err);
            });
        });

    }

    public checkValid(): boolean {
        if (typeof this.address !== "undefined" && typeof this.fullName !== "undefined") {
            if (typeof this.shortName !== "undefined") {
                            if (this.shortName !== null) {
                                if (this.fullName !== null) {
                                    if (this.address !== null) {
                                        return true;
                                    }
                                }
                            }
                }
        }
        return false;
    }
}

export interface GeoResponse {
    lat?: number;
    lon?: number;
    error?: string;
}
