/**
 * @fileoverview Модуль форми редагування службових відряджень.
 * Містить логіку для створення та редагування записів про службові відрядження,
 * включаючи управління доступністю полів залежно від статусу затвердження.
 * 
 * @module App_BTRIP_BusinessTripEdit
 * @requires ../lib/common
 * @requires ../lib/enums
 */

import { restoreFormParam } from "../lib/common";
import { getEnum, BusinessTripTypes } from "../lib/enums";

/**
 * Форма редагування службового відрядження.
 * Забезпечує функціональність створення та редагування записів про службові відрядження,
 * включаючи налаштування початкових значень полів та доступності редагування залежно від статусу.
 * 
 * @param {D5TableForm} form - Об'єкт форми D5 для роботи з полями та подіями
 * @param {D5Core} core - Ядро системи D5 для виконання операцій та взаємодії з користувачем
 * @returns {Object} Об'єкт з обробниками подій форми
 * 
 * @author Команда розробки додатку відряджень
 * @since 1.0.0
 */
export const App_BTRIP_BusinessTripEdit = (form, core) => {
    return ({
        /**
         * Обробник ініціалізації форми.
         * Встановлює джерело даних для поля типу відрядження.
         */
        OnInit: () => {
            form.field("TripType").datasource = getEnum(BusinessTripTypes);
        },

        /**
         * Обробник відображення форми.
         * Встановлює початкові значення полів та налаштовує доступність редагування.
         */
        OnShow: () => {
            setFieldInitialValue(form);
            setFieldAvailability(form);
        }
    });
}


/**
 * Встановлює початкові значення полів форми.
 * Відновлює збережене значення FirmID з попередньої сесії та налаштовує фільтрацію поля PersonID.
 * Для нових записів використовує збережене значення FirmID, для існуючих - блокує фільтрацію.
 * 
 * @param {D5TableForm} form - Об'єкт форми D5
 * @private
 */
function setFieldInitialValue(form) {
    let firmID = restoreFormParam("App_BTRIP_BusinessTripEdit", "FirmID");
    if (form.field("ID").value == null) {
        if (firmID instanceof Array) {
            form.field("FirmID").value = firmID[0];
        } else {
            form.field("FirmID").value = firmID;
        }
        form.field("PersonID").filter = { "FirmID": firmID };
    } else {
        form.field("PersonID").filter = { "FirmID": -1 };
    }
}

/**
 * Встановлює доступність полів форми для редагування залежно від статусу затвердження.
 * Блокує редагування всіх полів (крім коментаря для статусу 1) якщо відрядження має статус більше 0.
 * 
 * @param {D5TableForm} form - Об'єкт форми D5
 * @private
 */
function setFieldAvailability(form) {
    if (form.field("ID").value != null) {
        let status = form.field("ApproveStatus").value || 0;
        if (status > 0) {
            for (let field of form.fields) {
                if (status != 1 || field.name != "Comment") {
                    field.isReadOnly = 1;
                }
            }
        }
    }
}

window.userScript = {
    ...window.userScript,
    App_BTRIP_BusinessTripEdit
};
