/**
 * @fileoverview Модуль форми списку службових відряджень.
 * Містить логіку для відображення, фільтрації та управління службовими відрядженнями,
 * включаючи функції затвердження, відхилення та групового редагування записів.
 * 
 * @module App_BTRIP_BusinessTripList
 * @requires lodash/find
 * @requires lodash/map
 * @requires lodash/isEmpty
 * @requires ../lib/common
 * @requires ../lib/enums
 */

import _find from "lodash/find";
import _map from "lodash/map";
import _isEmpty from "lodash/isEmpty";
import { saveFormParam } from "../lib/common";
import { getEnum, BusinessTripStatus, BusinessTripTypes } from "../lib/enums";

/**
 * Форма списку службових відряджень.
 * Забезпечує функціональність перегляду, фільтрації та управління службовими відрядженнями,
 * включаючи можливості затвердження, відхилення та редагування записів.
 * 
 * @param {D5TableForm} form - Об'єкт форми D5 для роботи з таблицею та фільтрами
 * @param {D5Core} core - Ядро системи D5 для виконання операцій та взаємодії з користувачем
 * @returns {Object} Об'єкт з обробниками подій форми та кнопок
 * 
 * @author Команда розробки додатку відряджень
 * @since 1.0.0
 */
const App_BTRIP_BusinessTripList = (form, core) => {
    return ({
        /**
         * Обробник ініціалізації форми.
         * Встановлює початкові значення фільтрів та джерела даних для полів-довідників.
         */
        OnInit: () => {
            form.filterField("IsPassed").defaultValue = 0;
            setFieldInitialValue(form);
            form.field("TripType").datasource = getEnum(BusinessTripTypes);
            form.field("ApproveStatus").datasource = getEnum(BusinessTripStatus);
            form.filterField("TripType").datasource = getEnum(BusinessTripTypes);
            form.filterField("ApproveStatus").datasource = getEnum(BusinessTripStatus);
        },

        /**
         * Обробник відображення форми.
         * Зберігає параметри фільтра та встановлює початкові значення полів.
         */
        OnShow: () => {
            saveParamsForEditForms(form);
            setFieldInitialValue(form);
            setButtonVisibility(form);
            syncFilter(form);
        },

        /**
         * Обробник застосування фільтра.
         * Зберігає параметри фільтра та оновлює початкові значення полів.
         */
        OnApplyFilter: () => {
            saveParamsForEditForms(form);
            setFieldInitialValue(form);
        },

        /**
         * Обробник зміни значення поля FirmID.
         * Оновлює фільтрацію залежних полів.
         */
        FirmIDOnValueChanged: () => {
            setFieldInitialValue(form);
        },

        /**
         * Обробник кнопки затвердження відряджень.
         * Встановлює статус затвердження для обраних записів.
         */
        btnSetApprovedOnClick: async () => {
            await setApprove(form, core, 1)
        },

        /**
         * Обробник кнопки відхилення відряджень.
         * Встановлює статус відхилення для обраних записів.
         */
        btnSetRejectedOnClick: async () => {
            await setApprove(form, core, 2)
        },

        /**
         * Обробник кнопки скидання статусу відряджень.
         * Встановлює статус "нове" для обраних записів.
         */
        btnSetNewOnClick: async () => {
            await setApprove(form, core, 0)
        },

        /**
         * Обробник зміни вибору записів у таблиці.
         * Оновлює доступність кнопок управління статусами залежно від обраних записів.
         */
        OnSelectionChanged: () => {
            setButtonVisibility(form);
            saveParamsForEditForms(form);
            syncFilter(form);
        },


        /**
         * Обробник кнопки групового редагування.
         * Перевіряє можливість редагування обраних записів та викликає стандартний обробник.
         * 
         * @param {Object} button - Об'єкт кнопки
         * @param {Function} defaultHandler - Стандартний обробник кнопки
         */
        btnGrEditOnClick: async (button, defaultHandler) => {
            let selectedRows = form.selectedRows;
            let notNewTrips = _find(selectedRows, (a) => a.data.ApproveStatus > 0);
            if (!_isEmpty(notNewTrips)) {
                return core.showWarning("Серед обраних є затверджені або закриті. Операція не можлива!");
            } else {
                await defaultHandler();
            }
        }

    });
}


/**
 * Встановлює початкові значення та фільтри для полів форми.
 * Налаштовує фільтрацію полів PersonID, ApprovedByPersonID та NomenclatureID 
 * на основі обраної організації (FirmID).
 * 
 * @param {D5TableForm} form - Об'єкт форми D5
 * @private
 */
function setFieldInitialValue(form) {
    let firmID = form.filterField("FirmID").value || -1;
    form.filterField("PersonID").filter = { "FirmID": firmID };
    form.filterField("ApprovedByPersonID").filter = { "FirmID": firmID };
    form.subForm("TableExpenses").filterField("NomenclatureID").filter = { "FirmID": firmID, "NomenclatureKindID": 4 };
}

/**
 * Встановлює статус затвердження для обраних службових відряджень.
 * Виконує валідацію обраних записів, запитує підтвердження у користувача
 * та оновлює статуси через серверну операцію.
 * 
 * @param {D5TableForm} form - Об'єкт форми D5
 * @param {D5Core} core - Ядро системи D5
 * @param {number} status - Новий статус затвердження (0 - нове, 1 - затверджено, 2 - відхилено)
 * @returns {Promise<void>} Промис, що завершується після виконання операції
 * @private
 */
async function setApprove(form, core, status) {
    let selRows = form.selectedRows;
    let keys = _map(selRows, (a) => a.key);
    if (_isEmpty(selRows)) {
        core.showWarning("Не обрано жодного рядка!");
        return;
    }

    // Формування тексту підтвердження операції
    let question = "";
    if (status === 0) {
        question = "Зробити обрані відрядження новими?";
    } else if (status === 1) {
        question = "Затвердити обрані відрядження?";
    } else if (status === 2) {
        question = "Відхилити обрані відрядження?";
    }

    let userAnswer = await core.showConfirmDialog(
        question,
        ["no", "yes"],
        "Питання"
    );
    if (userAnswer !== "yes") {
        return;
    }

    // Підготовка запиту для модифікації записів
    let modRequest = [];
    for (let row of selRows) {
        modRequest.push({ "ID": row.data["ID"], "ApproveStatus": status });
    }

    if (!_isEmpty(modRequest)) {
        let modResult = await core.execObjectOperation("App_BTRIP_BusinessTrips", "Approve",
            { "Request": { "App_BTRIP_BusinessTrips": modRequest } }
        );
        let isError = false;

        // Обробка результату операції
        if (!_isEmpty(modResult)) {
            let result = Number(modResult["ResponseCode"]);
            let message = modResult["ResponseText"];
            if (result > 400) {
                core.showError(message);
                isError = true;
            } else {
                showSuccessMessage(core, status);
            }
        } else {
            showSuccessMessage(core, status);
        }
    }

    // Оновлення записів у формі у разі успіху
    if (!isError) {
        await form.refreshRecords(keys);
    }
}

/**
 * Відображає повідомлення про успішне виконання операції зміни статусу.
 * 
 * @param {D5Core} core - Ядро системи D5
 * @param {number} status - Статус операції (0 - нове, 1 - затверджено, 2 - відхилено)
 * @private
 */
function showSuccessMessage(core, status) {
    if (status === 0) {
        core.showSuccess("Обрані відрядження стали новими");
    } else if (status === 1) {
        core.showSuccess("Обрані відрядження затверджені");
    } else if (status === 2) {
        core.showSuccess("Обрані відрядження відхилені");
    }
}

/**
 * Встановлює видимість та доступність кнопок управління статусами відряджень.
 * Блокує кнопки залежно від обраних записів та їх поточних статусів:
 * - Кнопка "Затвердити" блокується, якщо серед обраних є вже затверджені або завершені відрядження
 * - Кнопка "Відхилити" блокується, якщо серед обраних є вже відхилені або завершені відрядження  
 * - Кнопка "Зробити новими" блокується, якщо серед обраних є вже нові або завершені відрядження
 * Всі кнопки блокуються, якщо не обрано жодного запису.
 * 
 * @param {D5TableForm} form - Об'єкт форми D5 з кнопками управління
 * @private
 */
function setButtonVisibility(form) {
    let selRows = form.selectedRows;
    form.button("btnSetApproved").isDisabled = _isEmpty(selRows) || _find(selRows, (row) => row.data.ApproveStatus === 1 || row.data.IsPassed);
    form.button("btnSetRejected").isDisabled = _isEmpty(selRows) || _find(selRows, (row) => row.data.ApproveStatus === 2 || row.data.IsPassed);
    form.button("btnSetNew").isDisabled = _isEmpty(selRows) || _find(selRows, (row) => row.data.ApproveStatus === 0 || row.data.IsPassed);
    // якщо відрядження закрите, сховати кнопки редагування
    let showEditButtonsInExpenses = !_isEmpty(selRows) && !_find(selRows, (row) => row.data.IsPassed);
    form.subForm("TableExpenses").button("btnAdd").isDisabled = !showEditButtonsInExpenses;
    form.subForm("TableExpenses").button("btnEdit").isDisabled = !showEditButtonsInExpenses;
    form.subForm("TableExpenses").button("btnCopy").isDisabled = !showEditButtonsInExpenses;
    form.subForm("TableExpenses").button("btnDelete").isDisabled = !showEditButtonsInExpenses;
    // видимість кнопок у таблиці платежів
    form.subForm("TablePayments").button("btnAdd").isDisabled = !showEditButtonsInExpenses;
    form.subForm("TablePayments").button("btnEdit").isDisabled = !showEditButtonsInExpenses;
    form.subForm("TablePayments").button("btnDelete").isDisabled = !showEditButtonsInExpenses;
}

/**
 * Зберігає параметри для форм редагування відряджень та платежів.
 * Функція передає значення з поточної форми до форм редагування через механізм
 * збереження параметрів форми. Це забезпечує передачу контексту між формами.
 * 
 * Зберігає наступні параметри:
 * - FirmID для форм App_BTRIP_BusinessTripEdit та App_BTRIP_PaymentEdit
 * - BusinessTripID для форми App_BTRIP_PaymentEdit (якщо обрано запис)
 * 
 * @param {D5TableForm} form - Об'єкт форми D5 з фільтрами та обраними записами
 * @private
 */
function saveParamsForEditForms(form) {
    // Зберігаємо ID організації для форм редагування
    saveFormParam("App_BTRIP_BusinessTripEdit", "FirmID", form.filterField("FirmID").value);
    saveFormParam("App_BTRIP_PaymentEdit", "FirmID", form.filterField("FirmID").value);

    // Отримуємо перший обраний запис
    let selRow = form.selectedRows[0];
    if (!_isEmpty(selRow)) {
        // Якщо є обраний запис, зберігаємо його ID для форми редагування платежів
        saveFormParam("App_BTRIP_PaymentEdit", "BusinessTripID", selRow.data["ID"]);
    } else {
        // Якщо немає обраного запису, очищуємо параметр
        saveFormParam("App_BTRIP_PaymentEdit", "BusinessTripID", null);
    }
}

/**
 * Синхронізує фільтри підформи платежів з головною формою.
 * Функція автоматично встановлює фільтри для таблиці платежів на основі:
 * - Обраної організації (FirmID) з головної форми
 * - Обраного службового відрядження (BusinessTripID)
 * 
 * Це забезпечує відображення лише тих платежів, які відносяться до 
 * поточної організації та обраного відрядження.
 * 
 * @param {D5TableForm} form - Об'єкт головної форми з підформою TablePayments
 * @private
 */
function syncFilter(form) {
    let selRow = form.selectedRows[0];

    if (!_isEmpty(selRow)) {
        // Якщо обрано запис відрядження, фільтруємо платежі по організації та відрядженню
        form.subForm("TablePayments").filterField("FirmID").value = form.filterField("FirmID").value;
        form.subForm("TablePayments").filterField("FirmID").operation = "=";

        form.subForm("TablePayments").filterField("BusinessTripID").value = selRow.data["ID"];
        form.subForm("TablePayments").filterField("BusinessTripID").operation = "=";
    } else {
        // Якщо не обрано жодного відрядження, показуємо порожню таблицю платежів
        form.subForm("TablePayments").filterField("FirmID").value = form.filterField("FirmID").value;
        form.subForm("TablePayments").filterField("FirmID").operation = "=";

        // Встановлюємо неіснуючий ID, щоб не показувати жодних платежів
        form.subForm("TablePayments").filterField("BusinessTripID").value = -1;
        form.subForm("TablePayments").filterField("BusinessTripID").operation = "=";
    }
}

window.userScript = {
    ...window.userScript,
    App_BTRIP_BusinessTripList
};
