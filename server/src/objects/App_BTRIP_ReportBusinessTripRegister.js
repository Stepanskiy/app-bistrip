import ApiObjectInitializer from 'd5-api-initializer';

import _isEmpty from "lodash/isEmpty";
import dayjs from "dayjs";


new ApiObjectInitializer('App_BTRIP_ReportBusinessTripRegister', {
    List: (apiCore, apiRequest, apiResponse) => {
        let firmID = apiRequest.getFilter("FirmID");
        let period = apiRequest.getFilter("Period");

        
        // Ініціалізуємо масив для результатів звіту
        const reportData = {
            "Table": [{}],
        };

        if (!firmID || !period) {
            apiResponse.setResponse(reportData);
            return;
        }

        response = apiCore.newApiInvoker("App_BTRIP_BusinessTrips", "List")
            .setColumns(
                [
                    "PersonID.Name",                // Повне ім'я працівника
                    "PersonID",                     // ID працівника для подальшого пошуку посади
                    "Destination",                  // Місце призначення відрядження
                    "CountryID.Name",               
                    "CounteragentName",             // Назва контрагента/організації
                    "StartDate",                    // Дата початку відрядження
                    "EndDate",                      // Дата закінчення відрядження
                    "Goal",                         // Мета/завдання відрядження
                    "Number",                      
                    "Date"                          // Дата створення запису
                ]
            )
            .setFilters({ "StartDate": {"between": period}, "FirmID": firmID })     // Фільтруємо по переданих ID відряджень
            .addSorts("Date")
            .setPage(-1)                        // Отримуємо всі записи без пагінації
            .invoke()
            .getResponse();

        // Форматуємо дати у відповіді
        response = response.map(item => ({
            ...item,
            PersonID_Name: item['PersonID.Name'],
            StartDate: item.StartDate ? dayjs(item.StartDate).format('DD.MM.YYYY') : '',
            EndDate: item.EndDate ? dayjs(item.EndDate).format('DD.MM.YYYY') : '',
            Date: item.Date ? dayjs(item.Date).format('DD.MM.YYYY') : ''
        }));

        reportData.Table = response;

        apiResponse.setResponse(reportData);

    },
});

