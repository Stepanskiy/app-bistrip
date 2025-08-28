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

export { saveFormParam, restoreFormParam };