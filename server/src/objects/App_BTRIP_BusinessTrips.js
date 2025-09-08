import ApiObjectInitializer from 'd5-api-initializer';
import _isEmpty from "lodash/isEmpty";
import _find from "lodash/find";
import _map from "lodash/map";

new ApiObjectInitializer('App_BTRIP_BusinessTrips', {
    
    Ins: (apiCore, apiRequest, apiResponse) => {
        let request = apiRequest.request;
        let copyIds = [];
        for (let row of request) {
            row["ApproveStatus"] = 0;
            row["ID"] = row["CopyID"];
            if (row["CopyID"]) {
                copyIds.push(row["CopyID"]);
            }
        }
        let result = apiRequest.invoke().getResponse();
        copyExpenses(apiRequest,apiCore,copyIds,result);
        apiResponse.response = { [apiRequest.objectName]: result };
    },

    Del: (apiCore, apiRequest, apiResponse) => {
        let request = apiRequest.request;

        // видалити підлеглі витрати
        let ids = _map(request,"ID");
        let allExpenses = apiCore.newApiInvoker("App_BTRIP_BusinessTripExpenses", "List")
            .setColumns([
                "ID"
            ])
            .setFilters({ "BusinessTripID": ids })
            .setPage(-1)
            .invoke()
            .getResponse();
        if (!_isEmpty(allExpenses)) {      
            apiCore.newApiInvoker("App_BTRIP_BusinessTripExpenses", "Del")
                .setRequest({ "App_BTRIP_BusinessTripExpenses": allExpenses })
                .invoke().getResponse();        
        }
        
        let result = apiRequest.invoke().getResponse();
        apiResponse.response = { [apiRequest.objectName]: result };
    },


    Approve: (apiCore, apiRequest, apiResponse) => {
        let request = apiRequest.request;
        let modRequest = [];
        for (let row of request) {
            if (row["ID"] && (row["ApproveStatus"] || row["ApproveStatus"] === 0) ) {
                modRequest.push({"ID":row["ID"],"ApproveStatus":row["ApproveStatus"]});
            }
        }
        let result = [];
        if (!_isEmpty(modRequest)) {
            result = apiCore.newApiInvoker("App_BTRIP_BusinessTrips", "Mod")
                    .setRequest({ "App_BTRIP_BusinessTrips": modRequest })
                    .invoke().getResponse();        
        }
        apiResponse.response = { [apiRequest.objectName]: result };
    },
});

function copyExpenses(apiRequest,apiCore,copyIds,insResult) {

    if (!_isEmpty(copyIds)) {

        // отримуємо усі записи витрати по  елементам що копіювались
        let allExpenses = apiCore.newApiInvoker("App_BTRIP_BusinessTripExpenses", "List")
            .setColumns([
                "BusinessTripID",
                "Comment",
                "NomenclatureID",
                "PlanAmount",
                "PlanPrice",
                "PlanQuantity"
            ])
            .setFilters({ "BusinessTripID": copyIds })
            .setPage(-1)
            .invoke()
            .getResponse();
        
        if (!_isEmpty(allExpenses)) {
            // заміняємо ІД на нові
            for (let row of allExpenses) {
                let found = _find(insResult, (a) => a["Request.ID"] === row["BusinessTripID"]);
                if (!_isEmpty(found)) {
                    row["BusinessTripID"] = found["ID"];
                }
            }
            apiRequest.newApiInvoker("App_BTRIP_BusinessTripExpenses", "Ins")
                .setRequest({ "App_BTRIP_BusinessTripExpenses": allExpenses })
                .invoke();

        }


    }

}

