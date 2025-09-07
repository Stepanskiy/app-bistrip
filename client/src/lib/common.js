import _isEmpty from "lodash/isEmpty";
import _map from "lodash/map";
import _round from "lodash/round";
import _isNumber from "lodash/isNumber";
import _isArray from "lodash/isArray";
import _isObject from "lodash/isObject";
import _isString from "lodash/isString";
import _isBoolean from "lodash/isBoolean";
import _compact from "lodash/compact";
import _isFunction from "lodash/isFunction";
import _find from "lodash/find";
import _values from 'lodash/values';


/**
 * Записывает в хранилище данных форм значение по ключу для указанной формы
 * @param {String} formName Имя формы
 * @param {String} paramName Ключ
 * @param {*} value значение для записи
 */
function saveFormParam(formName, paramName, value) {
    if (!("runtimeParams" in window)) {
        window.runtimeParams = {};
    }
    if (!("forms" in window.runtimeParams)) {
        window.runtimeParams.forms = {};
    }
    if (!(formName in window.runtimeParams.forms)) {
        window.runtimeParams.forms[formName] = {};
    }
    window["runtimeParams"]["forms"][formName][paramName] = value;
}

/**
 * Восстанавливает из хранилища данных форм значение по ключу для указанной формы
 * @param {String} formName Имя формы
 * @param {String} paramName Ключ
 * @returns {?any} Сохранённое значение или null
 */
function restoreFormParam(formName, paramName) {
    if (
        ("runtimeParams" in window) &&
        ("forms" in window.runtimeParams) &&
        (formName in window.runtimeParams.forms)
    ) {
        let value = window.runtimeParams.forms[formName][paramName];
        return value || null;
    }
}

/** Отримання значення полів довідника/документа
 * При пропуску параметра - ставити undefined
 * @param {Object} core
 * @param {String} objName назва об'єкта
 * @param {Object} filters фільтра об'єкта (за замовчуванням без фільтра)
 * @param {String[]} columns масив полів об'єкта (за замовчуванням усі поля)
 * @param {String[]} sorts масив полів для сортування (за замовчуванням без сортування)
 * Якщо перед найменуванням колонки стоїть "-" - сортування в порядку зменшення, інакше, в порядку зростання
 * @param {Boolean} sortByDateDESC сортування по полю "Date" УБВ (за замовчуванням без сортування)
 * @param {Boolean} isAllPages одна або всі сторінки (за замовчуванням усі сторінки)
 * @param {Number} firstRows одна або всі сторінки (за замовчуванням без явної вказівки)
 * @param {Number} hierarchyLevel ознака для ієрархічного запиту. 1 - шукає батьків, 2 - дітей та 3 - дітей та батьків.
 * @param {String} hierarchyField ознака для ієрархічного запиту. Пошук вкладених (child) елементів за вказаним полем
 * При цьому фільтрі крім цього поля ігноруються (за замовчуванням без ієрархії)
 * @param {Object} nestObject вкладений запит до полів типу "nested object"
 * @returns {Object[] || null}
 */
async function getObjectFields(core, objName, filters = null, columns = null, sortByDateDESC = false, sorts = null, isAllPages = true, firstRows = null, hierarchyLevel = null, hierarchyField = null, nestObject = null) {

    let objectFields = null;

    if (objName && _isString(objName)) {
        let page = isAllPages ? -1 : 1;
        let reqBody = { "Page": page };

        if (filters && _isObject(filters)) {
            reqBody.Filters = filters;

            if (filters.ID) {
                if (_isNumber(filters.ID) || _isString(filters.ID)) {
                    reqBody.FirstRows = 1;

                } else if (_isArray(filters.ID)) {
                    reqBody.FirstRows = filters.ID.length;
                }
            }

            if (firstRows && _isNumber(firstRows)) {
                reqBody.FirstRows = firstRows;
            }
        }

        if (columns && _isArray(columns)) {
            reqBody.Columns = columns;
        }

        if (nestObject && _isObject(nestObject)) {
            reqBody.NestedColumns = nestObject;
        }

        if (hierarchyLevel && _isNumber(hierarchyLevel) && hierarchyField && _isString(hierarchyField)) {
            reqBody.HierarchyRequestKind = hierarchyLevel;
            reqBody.HierarchyParentColumn = hierarchyField;
        }

        if (sortByDateDESC && _isBoolean(sortByDateDESC)) {
            reqBody.Sorts = ["-Date"];

        } else if (sorts && _isArray(sorts)) {
            reqBody.Sorts = sorts;
        }

        const response = await core.loadObjectCollection(objName, reqBody);

        if (!_isEmpty(response)) {
            let result = Number(response["ResponseCode"]);
            let message = response["ResponseText"];

            if (result > 400) {
                core.showError(result + ": " + message);

            } else {
                objectFields = response;
            }
        }
    }

    return objectFields;
}


/** Отримує запис про поточного користувача системи
 * https://wiki.erp-director.com/d5wiki/display/D4AP/D4_Profile
 * @param {Object} core
 * @returns {Object|null} userInfo
 */
async function getCurrentUser(core) {

    let userInfo = await getObjectFields(core, "D4_Profile");

    return userInfo[0] || null;
}


export { 
    saveFormParam, 
    restoreFormParam,
    getCurrentUser,
    getObjectFields 
};