import ApiObjectInitializer from 'd5-api-initializer';

import _isEmpty from "lodash/isEmpty";
import _isArray from "lodash/isArray";
import _map from "lodash/map";
import _find from "lodash/find";
import dayjs from "dayjs";


new ApiObjectInitializer('App_BTRIP_ReportBusinessTrip', {
    List: (apiCore, apiRequest, apiResponse) => {
        let btripsID = apiRequest.getFilter("keyvalue");
        if (btripsID) {
            if (!_isArray(btripsID)) {
                btripsID = [btripsID];
            }
        }

        let response = [];

        if (!btripsID || _isEmpty(btripsID)) {

            response.push({
                "PersonID.Name": "Не обране відрядження",
                "PersonID": 0,
                "PersonPosition": "XXXXX",
                "Destination": "XXXXX",
                "CounteragentName": "XXXXXX",
                "StartDate": dayjs().format("DD.MM.YYYY"),
                "EndDate": dayjs().format("DD.MM.YYYY"),
                "Goal": "XXXXXX",
                "Results": "XXXXXX",
                "Date": dayjs().format("DD.MM.YYYY")
            });

        } else {

            response = apiCore.newApiInvoker("App_BTRIP_BusinessTrips", "List")
                .setColumns(
                    [
                        "ActivityDirectionID.Name", 
                        "CurrencyID.Name", 
                        "SaleBillID.CurrencyID",
                        "PersonID.Name", 
                        "PersonID", 
                        "Destination", 
                        "CounteragentName", 
                        "StartDate", 
                        "EndDate", 
                        "Goal",
                        "Results", 
                        "Date"
                    ]
                )
                .setFilters({ "ID": btripsID })
                .setPage(-1)
                .invoke()
                .getResponse();

            // try to find positions
            let persons = _map(response,"PersonID");
            if (!_isEmpty(persons)) {
                let positions = apiCore.newApiInvoker("Erp_Employees", "List")
                    .setColumns(
                        [
                            "StaffingTableID.Name", 
                            "PersonID"
                        ]
                    )
                    .setFilters({ "PersonID": persons })
                    .setOperRightCheck(false)
                    .setPage(-1)
                    .invoke()
                    .getResponse();
                if (!_isEmpty(positions)) {
                    for (let row of response) {
                        let found = _find(positions,(a)=>Number(a["PersonID"]) == Number(row["PersonID"]));
                        if (!_isEmpty(found)) {
                            row["PersonPosition"] = found["StaffingTableID.Name"];
                        } else {
                            row["PersonPosition"] = "";
                        }
                    }
                }
            }



        }

        apiResponse.response = { [apiRequest.objectName]: { "Documents": response } };

    },
});

