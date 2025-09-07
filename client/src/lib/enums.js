import _isEmpty from "lodash/isEmpty";

export const BusinessTripStatus = {
  "Нове": 0,
  "Затверджене": 1,
  "Відхилене": 2,
  "Закрите": 3
};

export const BusinessTripTypes = {
  "Область": 1,
  "Україна": 2,
  "Закордонне": 3
};

export const paymentStatusEnum = [
    { "key": 0, "value": "Не розглянуто" },
    { "key": 1, "value": "Відкласти" },
    { "key": 2, "value": "Відхилити" },
    { "key": 3, "value": "Оплатити" },
    { "key": 9, "value": "Імпорт з 1С" }
];


/**
 * Преобразует объект вида ключ - простое значение к типу, совместимому с полями
 * с отображением типа Enumerator
 * @param {*} obj
 */
export function getEnum(obj) {
    let result = [];
    if (!_isEmpty(obj)) {
        for (let key in obj) {
            result.push({ "key": obj[key], "value": key });
        }
    }
    return result;
}