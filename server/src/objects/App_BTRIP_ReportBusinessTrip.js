/**
 * Серверний скрипт для генерації звіту по відрядженнях
 * Забезпечує формування даних для стандартних звітних форм
 * включаючи інформацію про працівників, їх посади та деталі відрядження
 */

import ApiObjectInitializer from 'd5-api-initializer';

// Утилітарні функції lodash для роботи з колекціями та масивами
import _isEmpty from "lodash/isEmpty";
import _isArray from "lodash/isArray";
import _map from "lodash/map";
import _find from "lodash/find";
// Бібліотека для роботи з датами та форматування
import dayjs from "dayjs";


/**
 * Ініціалізація серверного об'єкта для звіту по відрядженнях
 * Реалізує операцію List для отримання даних звіту
 */
new ApiObjectInitializer('App_BTRIP_ReportBusinessTrip', {
    /**
     * Операція List - формує дані для звіту по відрядженнях
     * @param {Object} apiCore - основний об'єкт API для взаємодії з системою
     * @param {Object} apiRequest - об'єкт запиту з параметрами та фільтрами
     * @param {Object} apiResponse - об'єкт для формування відповіді
     */
    List: (apiCore, apiRequest, apiResponse) => {
        // Отримуємо ID відряджень з фільтра запиту (параметр keyvalue)
        let btripsID = apiRequest.getFilter("keyvalue");
        
        // Якщо ID передано, перевіряємо чи це масив
        if (btripsID) {
            // Перетворюємо одиничне значення у масив для уніфікованої обробки
            if (!_isArray(btripsID)) {
                btripsID = [btripsID];
            }
        }

        // Ініціалізуємо масив для результатів звіту
        let response = [];

        // Якщо ID відряджень не передано або порожній масив
        if (!btripsID || _isEmpty(btripsID)) {
            // Повертаємо заглушку з повідомленням про відсутність вибраних відряджень
            // Використовуємо поточну дату та стандартні заглушки для текстових полів
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
            // Отримуємо дані відряджень з основного об'єкта App_BTRIP_BusinessTrips

            response = apiCore.newApiInvoker("App_BTRIP_BusinessTrips", "List")
                .setColumns(
                    [
                        "PersonID.Name",                // Повне ім'я працівника
                        "PersonID",                     // ID працівника для подальшого пошуку посади
                        "Destination",                  // Місце призначення відрядження
                        "CounteragentName",             // Назва контрагента/організації
                        "StartDate",                    // Дата початку відрядження
                        "EndDate",                      // Дата закінчення відрядження
                        "Goal",                         // Мета/завдання відрядження
                        "Results",                      // Результати виконання завдань
                        "Date"                          // Дата створення запису
                    ]
                )
                .setFilters({ "ID": btripsID })     // Фільтруємо по переданих ID відряджень
                .setPage(-1)                        // Отримуємо всі записи без пагінації
                .invoke()
                .getResponse();

            // Збагачуємо дані посадами працівників з об'єкта Erp_Employees
            // Витягуємо унікальні ID працівників з результатів відряджень
            let persons = _map(response,"PersonID");
            if (!_isEmpty(persons)) {
                // Отримуємо інформацію про посади працівників
                let positions = apiCore.newApiInvoker("Erp_Employees", "List")
                    .setColumns(
                        [
                            "StaffingTableID.Name",     // Назва посади за штатним розписом
                            "PersonID"                  // ID працівника для зв'язку
                        ]
                    )
                    .setFilters({ "PersonID": persons })   // Фільтруємо по ID працівників з відряджень
                    .setOperRightCheck(false)              // Bypass перевірки прав для звітності
                    .setPage(-1)                           // Отримуємо всі записи
                    .invoke()
                    .getResponse();
                // Якщо знайдено посади працівників
                if (!_isEmpty(positions)) {
                    // Проходимо по кожному запису відрядження та додаємо інформацію про посаду
                    for (let row of response) {
                        // Шукаємо відповідну посаду для поточного працівника
                        // Використовуємо числове порівняння ID для надійності
                        let found = _find(positions,(a)=>Number(a["PersonID"]) == Number(row["PersonID"]));
                        if (!_isEmpty(found)) {
                            // Додаємо назву посади до запису
                            row["PersonPosition"] = found["StaffingTableID.Name"];
                        } else {
                            // Встановлюємо порожнє значення, якщо посада не знайдена
                            row["PersonPosition"] = "";
                        }
                    }
                }
            }
        }

        // Формуємо стандартну відповідь для звітної форми
        // Структура: { "App_BTRIP_ReportBusinessTrip": { "Documents": [...] } }
        apiResponse.response = { [apiRequest.objectName]: { "Documents": response } };

    },
});

