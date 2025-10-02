import ApiObjectInitializer from 'd5-api-initializer';
import _isEmpty from "lodash/isEmpty";
import _find from "lodash/find";
import _map from "lodash/map";
import _isArray from "lodash/isArray";
import dayjs from "dayjs";

new ApiObjectInitializer('App_BTRIP_BusinessTrips', {
    
    List: (apiCore, apiRequest, apiResponse) => {

        let filterFirm = apiRequest.getFilter("FirmID");
        let filterID = apiRequest.getFilter("ID");
        let docNameFilter = apiRequest.getFilter("DocName");
        let isOverbudgetFilter = apiRequest.getFilter("IsOverbudget");

        console.log("### filterID",filterID);

        if (_isEmpty(filterFirm) && !_isEmpty(filterID)) {
            setFirmFilter(apiCore, apiRequest);
        } else {
            checkFirmFilter(apiCore, apiRequest, filterFirm);
        }

        if (!_isEmpty(docNameFilter)) {
            apiRequest.setFilters({
                ...apiRequest.filters, 
                ...{
                    "||":[
                        {"PersonID.Name": docNameFilter},
                        {"Destination": docNameFilter}
                    ]
                }
            });
        }

        console.log("### isOverbudgetFilter",isOverbudgetFilter);     
        if (!_isEmpty(isOverbudgetFilter)){
            let isOverbudget = 0;
            if (typeof isOverbudgetFilter === 'object') {
                isOverbudget = isOverbudgetFilter["="]||0;
            } else {
                isOverbudget = isOverbudgetFilter;
            }       
            console.log("### isOverbudget",isOverbudget);     
            if (isOverbudget) {
                let overbudgetIds = returnOverbudjectTrips(apiCore,apiRequest);
                console.log("### overbudgetIds",overbudgetIds);     
                if (_isEmpty(overbudgetIds)) {
                    apiRequest.addFilters({"ID": -1})
                } else {
                    if (!filterID) {
                        apiRequest.addFilters({"ID": overbudgetIds})
                    } else {
                        let mergedIds = [];
                        if (typeof filterID === 'object' && !_isArray(filterID)) {
                            if (filterID['=']) {
                                let existingIds = _isArray(filterID['=']) ? filterID['='] : [filterID['=']];
                                mergedIds = existingIds.filter(id => overbudgetIds.includes(id));
                                apiRequest.addFilters({"ID": {"=": mergedIds}});
                            } else {
                                apiRequest.addFilters({
                                    "ID": [
                                        filterID,
                                        {"=": overbudgetIds}
                                    ]
                                });
                            }
                        } else {
                            // Handle simple value or array format
                            let existingIds = _isArray(filterID) ? filterID : [filterID];
                            mergedIds = existingIds.filter(id => overbudgetIds.includes(id));
                            apiRequest.addFilters({"ID": mergedIds});
                        }
                    }
                }
            }
        }

        let columns = apiRequest.columns;


        if (columns && columns.indexOf("DocName") != -1) {
            columns.push("PersonID.Name");
            columns.push("Destination");
            columns.push("StartDate");
        }

        let resultRequest = apiRequest.invoke().getResponse(apiRequest.objectName);


        if (columns && columns.indexOf("DocName") != -1) {
            for (let row of resultRequest) {
                row["DocName"] = "Відрядження " + row["PersonID.Name"] + " від " + dayjs(row["StartDate"]).format("DD.MM.YYYY") + " у " + (row["Destination"]||"???");
            }
        }

        if (columns && (columns.indexOf("PlanExpensesAmount") != -1 || columns.indexOf("FactExpensesAmount") != -1)) {
            setExpenseAmounts(apiCore, apiRequest,resultRequest);
        }

        let result = { [apiRequest.objectName]: resultRequest };
        apiResponse.response = result;

    },


    Ins: (apiCore, apiRequest, apiResponse) => {
        let request = apiRequest.request;
        let copyIds = [];

        let firmIds = _map(request,"FirmID");
        checkFirmFilter(apiCore, apiRequest, firmIds);

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


    Mod: (apiCore, apiRequest, apiResponse) => {

        let request = apiRequest.request;
        let firmIds = getFirmsByID(apiCore, apiRequest, _map(request,"ID"));
        checkFirmFilter(apiCore, apiRequest, firmIds);

        let result = apiRequest.invoke().getResponse();
        apiResponse.response = { [apiRequest.objectName]: result };
    },


    Del: (apiCore, apiRequest, apiResponse) => {
        let request = apiRequest.request;

        let firmIds = getFirmsByID(apiCore, apiRequest, _map(request,"ID"));
        checkFirmFilter(apiCore, apiRequest, firmIds);

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

/**
 * Валідація фільтру по фірмах та перевірка доступу користувача
 * 
 * Функція перевіряє наявність обов'язкового фільтру FirmID в запиті та валідує,
 * чи має користувач права доступу до всіх вказаних фірм.
 * 
 * @param {Object} apiCore - Ядро API системи для виконання запитів та створення винятків
 * @param {Object} apiRequest - Об'єкт запиту API з фільтрами та даними
 * @param {(string|number|Array)} firms - Ідентифікатор(и) фірм для перевірки доступу
 * @throws {ApiException} Коли фільтр FirmID відсутній у запиті
 * @throws {ApiException} Коли користувач не має доступу до вказаних фірм
 * @returns {void}
 */
function checkFirmFilter(apiCore, apiRequest, firms) {

    let filterArray = [];
    
    // Перевірка наявності обов'язкового фільтру по фірмі
    if (_isEmpty(firms)) {
        throw apiCore.newApiException("Не переданий обов'язковий фільтр по фірмі!");    
    }
    
    // Приведення фільтру до масиву для уніфікованої обробки
    if (!Array.isArray(firms)) {
        filterArray.push(firms);
    } else {
        filterArray = firms; // Виправлено з filterFirm на firms
    }
    
    // Запит до системи для перевірки існування та доступності фірм
    let allowedFirms = apiCore.newApiInvoker("Erp_Firms", "List")
        .setColumns([
            "ID"
        ])
        .setFilters({ "ID": filterArray })
        .setPage(-1)
        .invoke()
        .getResponse();
    
    // Перевірка чи всі передані фірми доступні користувачу
    if (_isEmpty(allowedFirms) || filterArray.length !== allowedFirms.length) {
        throw apiCore.newApiException("Ви не можете формувати запит по переданим фірмам!");    
    }

}

/**
 * Автоматичне встановлення фільтру по всіх доступних фірмах
 * 
 * Функція отримує список всіх фірм, до яких має доступ користувач,
 * та автоматично встановлює їх як фільтр FirmID в запиті.
 * Використовується коли фільтр по фірмі не був переданий явно.
 * 
 * @param {Object} apiCore - Ядро API системи для виконання запитів
 * @param {Object} apiRequest - Об'єкт запиту API, до якого буде додано фільтр
 * @returns {void}
 */
function setFirmFilter(apiCore, apiRequest) {
    // Отримання списку всіх доступних фірм для поточного користувача
    let allowedFirms = apiCore.newApiInvoker("Erp_Firms", "List")
        .setColumns([
            "ID"
        ])
        .setPage(-1) // Отримати всі записи без пагінації
        .invoke()
        .getResponse();
    
    // Встановлення фільтру по ID всіх доступних фірм
    apiRequest.filters["FirmID"] =_map(allowedFirms,"ID");
}

function getFirmsByID(apiCore, apiRequest, ids) {
    if (_isEmpty(ids)) {
        return [];
    }
    let firms = apiCore.newApiInvoker("App_BTRIP_BusinessTrips", "List")
        .setColumns([
            "FirmID"
        ])
        .setFilters({ "ID": ids })
        .setPage(-1) // Отримати всі записи без пагінації
        .invoke()
        .getResponse();
    return _map(firms,"FirmID");
}

function setExpenseAmounts(apiCore, apiRequest,resultRequest) {
    let ids = _map(resultRequest,"ID");
    if (_isEmpty(ids)) {
        return;
    }
    let expenses = apiCore.newApiInvoker("App_BTRIP_BusinessTripExpenses", "List")
        .setColumns([
            "BusinessTripID"
        ])
        .setAggregatedColumns({
            'SumPlanExpensesAmount': 'sum(PlanAmount)',
            'SumFactExpensesAmount': 'sum(FactAmount)'
        })
        .setFilters({ "BusinessTripID": ids })
        .setPage(-1)
        .invoke()
        .getResponse();
    if (!_isEmpty(expenses)) {
        for (let row of resultRequest) {
            let found = _find(expenses,(a)=>Number(a["BusinessTripID"]) == Number(row["ID"]));
            if (!_isEmpty(found)) {
                row["PlanExpensesAmount"] = found["SumPlanExpensesAmount"];
                row["FactExpensesAmount"] = found["SumFactExpensesAmount"];
            }
        }
    }
}


function returnOverbudjectTrips(apiCore, apiRequest) {
    let filters = {...apiRequest.filters};
    delete filters["IsOverbudget"];
    let trips = apiCore.newApiInvoker("App_BTRIP_BusinessTrips", "List")
        .setColumns([
            "ID", "PlanExpensesAmount", "FactExpensesAmount"
        ])
        .setFilters(filters)
        .setPage(-1)
        .invoke()
        .getResponse();
    let result = [];
    for (let row of trips) {
        if (Number(row["FactExpensesAmount"])>Number(row["PlanExpensesAmount"])) {
            result.push(row["ID"]);
        }
    }
    return result;
}