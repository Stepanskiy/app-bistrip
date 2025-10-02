# Переопределение операции удаления объекта

## Обзор

Данная документация описывает процесс переопределения операции удаления (`Del`) для серверных объектов в системе D5 с использованием `ApiObjectInitializer`. Переопределение позволяет выполнять дополнительную бизнес-логику перед или после стандартного процесса удаления.

## Основные принципы

### ApiObjectInitializer

`ApiObjectInitializer` - класс для создания и регистрации серверных скриптов объектов. Позволяет переопределять стандартные операции:
- `Ins` - вставка (создание новых записей)
- `Mod` - модификация (изменение существующих записей)  
- `Del` - удаление записей
- Пользовательские операции

### Структура операции Del

```javascript
import ApiObjectInitializer from 'd5-api-initializer';

new ApiObjectInitializer('ObjectName', {
    Del: (apiCore, apiRequest, apiResponse) => {
        // Логика перед удалением
        
        // Стандартное удаление
        let result = apiRequest.invoke().getResponse();
        
        // Логика после удаления
        
        // Установка ответа
        apiResponse.response = { [apiRequest.objectName]: result };
    }
});
```

## Параметры функции Del

### apiCore
Основной объект API, предоставляющий доступ к системным функциям:
- `newApiInvoker(objectName, operation)` - создание нового вызова API
- Доступ к другим объектам системы

### apiRequest
Объект запроса, содержащий:
- `request` - массив записей для удаления (с полем `ID`)
- `objectName` - название текущего объекта
- `invoke()` - выполнение стандартной операции удаления

### apiResponse
Объект ответа:
- `response` - результат операции для возврата клиенту

## Практический пример

Рассмотрим реальный пример из `App_BTRIP_BusinessTrips.js`:

```javascript
import ApiObjectInitializer from 'd5-api-initializer';
import _isEmpty from "lodash/isEmpty";
import _map from "lodash/map";

new ApiObjectInitializer('App_BTRIP_BusinessTrips', {
    Del: (apiCore, apiRequest, apiResponse) => {
        let request = apiRequest.request;

        // 1. Получаем ID записей для удаления
        let ids = _map(request, "ID");
        
        // 2. Находим связанные записи (расходы по командировкам)
        let allExpenses = apiCore.newApiInvoker("App_BTRIP_BusinessTripExpenses", "List")
            .setColumns([
                "ID"
            ])
            .setFilters({ "BusinessTripID": ids })
            .setPage(-1)
            .invoke()
            .getResponse();
            
        // 3. Удаляем связанные записи, если они существуют
        if (!_isEmpty(allExpenses)) {      
            apiCore.newApiInvoker("App_BTRIP_BusinessTripExpenses", "Del")
                .setRequest({ "App_BTRIP_BusinessTripExpenses": allExpenses })
                .invoke().getResponse();        
        }
        
        // 4. Выполняем стандартное удаление основных записей
        let result = apiRequest.invoke().getResponse();
        
        // 5. Возвращаем результат
        apiResponse.response = { [apiRequest.objectName]: result };
    }
});
```

## Пошаговый разбор операции

### Шаг 1: Извлечение ID записей
```javascript
let request = apiRequest.request;
let ids = _map(request, "ID");
```
- `request` содержит массив объектов с полем `ID`
- Извлекаем все ID для последующего использования

### Шаг 2: Поиск связанных данных
```javascript
let allExpenses = apiCore.newApiInvoker("App_BTRIP_BusinessTripExpenses", "List")
    .setColumns(["ID"])
    .setFilters({ "BusinessTripID": ids })
    .setPage(-1)
    .invoke()
    .getResponse();
```
- Создаем новый API вызов к связанному объекту
- `setColumns()` - указываем нужные колонки
- `setFilters()` - устанавливаем фильтры поиска
- `setPage(-1)` - получаем все записи без пагинации

### Шаг 3: Каскадное удаление
```javascript
if (!_isEmpty(allExpenses)) {      
    apiCore.newApiInvoker("App_BTRIP_BusinessTripExpenses", "Del")
        .setRequest({ "App_BTRIP_BusinessTripExpenses": allExpenses })
        .invoke().getResponse();        
}
```
- Проверяем наличие связанных записей
- Удаляем их перед удалением основных записей

### Шаг 4: Стандартное удаление
```javascript
let result = apiRequest.invoke().getResponse();
```
- Выполняем стандартную операцию удаления
- Получаем результат операции

### Шаг 5: Формирование ответа
```javascript
apiResponse.response = { [apiRequest.objectName]: result };
```
- Устанавливаем результат в правильном формате
- Ключ объекта должен совпадать с именем объекта

## Лучшие практики

### 1. Обработка ошибок
```javascript
Del: (apiCore, apiRequest, apiResponse) => {
    try {
        let request = apiRequest.request;
        
        // Валидация входных данных
        if (!request || !Array.isArray(request)) {
            throw new Error("Некорректный формат запроса");
        }
        
        // Основная логика...
        
        let result = apiRequest.invoke().getResponse();
        apiResponse.response = { [apiRequest.objectName]: result };
        
    } catch (error) {
        // Логирование ошибки
        console.error("Ошибка при удалении:", error);
        throw error;
    }
}
```

### 2. Транзакционность
```javascript
Del: (apiCore, apiRequest, apiResponse) => {
    let request = apiRequest.request;
    
    // Сначала проверяем возможность удаления
    let canDelete = checkDeletionConstraints(apiCore, request);
    if (!canDelete) {
        throw new Error("Удаление невозможно из-за связанных данных");
    }
    
    // Удаляем связанные данные
    deleteRelatedData(apiCore, request);
    
    // Основное удаление
    let result = apiRequest.invoke().getResponse();
    apiResponse.response = { [apiRequest.objectName]: result };
}
```

### 3. Логирование операций
```javascript
Del: (apiCore, apiRequest, apiResponse) => {
    let request = apiRequest.request;
    let ids = _map(request, "ID");
    
    console.log(`Начало удаления записей: ${ids.join(', ')}`);
    
    // Основная логика...
    
    let result = apiRequest.invoke().getResponse();
    
    console.log(`Успешно удалено записей: ${result.length}`);
    
    apiResponse.response = { [apiRequest.objectName]: result };
}
```

## Расширенные сценарии

### Условное удаление
```javascript
Del: (apiCore, apiRequest, apiResponse) => {
    let request = apiRequest.request;
    
    // Фильтруем записи, которые можно удалять
    let allowedToDelete = request.filter(item => {
        return checkBusinessRules(apiCore, item);
    });
    
    if (allowedToDelete.length !== request.length) {
        throw new Error("Некоторые записи не могут быть удалены");
    }
    
    let result = apiRequest.invoke().getResponse();
    apiResponse.response = { [apiRequest.objectName]: result };
}
```

### Soft Delete (мягкое удаление)
```javascript
Del: (apiCore, apiRequest, apiResponse) => {
    let request = apiRequest.request;
    
    // Вместо физического удаления помечаем как удаленные
    let modRequest = request.map(item => ({
        ID: item.ID,
        IsDeleted: true,
        DeletedDate: new Date().toISOString()
    }));
    
    let result = apiCore.newApiInvoker(apiRequest.objectName, "Mod")
        .setRequest({ [apiRequest.objectName]: modRequest })
        .invoke()
        .getResponse();
    
    apiResponse.response = { [apiRequest.objectName]: result };
}
```

### Архивирование перед удалением
```javascript
Del: (apiCore, apiRequest, apiResponse) => {
    let request = apiRequest.request;
    let ids = _map(request, "ID");
    
    // Получаем полные данные записей
    let fullRecords = apiCore.newApiInvoker(apiRequest.objectName, "List")
        .setFilters({ "ID": ids })
        .setPage(-1)
        .invoke()
        .getResponse();
    
    // Архивируем данные
    if (!_isEmpty(fullRecords)) {
        let archiveRecords = fullRecords.map(record => ({
            ...record,
            OriginalID: record.ID,
            ArchivedDate: new Date().toISOString()
        }));
        
        apiCore.newApiInvoker("Archive_" + apiRequest.objectName, "Ins")
            .setRequest({ ["Archive_" + apiRequest.objectName]: archiveRecords })
            .invoke();
    }
    
    // Выполняем удаление
    let result = apiRequest.invoke().getResponse();
    apiResponse.response = { [apiRequest.objectName]: result };
}
```

## Интеграция с другими операциями

### Пример файла с множественными операциями
```javascript
import ApiObjectInitializer from 'd5-api-initializer';
import _isEmpty from "lodash/isEmpty";
import _map from "lodash/map";
import _find from "lodash/find";

new ApiObjectInitializer('App_BTRIP_BusinessTrips', {
    
    Ins: (apiCore, apiRequest, apiResponse) => {
        // Логика создания
        let request = apiRequest.request;
        
        // Предобработка данных
        for (let row of request) {
            row["ApproveStatus"] = 0;
            row["CreatedDate"] = new Date().toISOString();
        }
        
        let result = apiRequest.invoke().getResponse();
        apiResponse.response = { [apiRequest.objectName]: result };
    },

    Mod: (apiCore, apiRequest, apiResponse) => {
        // Логика изменения
        let request = apiRequest.request;
        
        // Валидация изменений
        validateModifications(apiCore, request);
        
        let result = apiRequest.invoke().getResponse();
        apiResponse.response = { [apiRequest.objectName]: result };
    },

    Del: (apiCore, apiRequest, apiResponse) => {
        // Логика удаления (как описано выше)
        let request = apiRequest.request;
        let ids = _map(request, "ID");
        
        // Удаление связанных данных
        deleteRelatedRecords(apiCore, ids);
        
        let result = apiRequest.invoke().getResponse();
        apiResponse.response = { [apiRequest.objectName]: result };
    },

    // Пользовательская операция
    Approve: (apiCore, apiRequest, apiResponse) => {
        let request = apiRequest.request;
        let modRequest = [];
        
        for (let row of request) {
            if (row["ID"] && (row["ApproveStatus"] || row["ApproveStatus"] === 0)) {
                modRequest.push({
                    "ID": row["ID"],
                    "ApproveStatus": row["ApproveStatus"],
                    "ApprovedDate": new Date().toISOString()
                });
            }
        }
        
        let result = [];
        if (!_isEmpty(modRequest)) {
            result = apiCore.newApiInvoker(apiRequest.objectName, "Mod")
                .setRequest({ [apiRequest.objectName]: modRequest })
                .invoke()
                .getResponse();        
        }
        
        apiResponse.response = { [apiRequest.objectName]: result };
    }
});

// Вспомогательные функции
function deleteRelatedRecords(apiCore, ids) {
    // Удаление расходов
    let expenses = apiCore.newApiInvoker("App_BTRIP_BusinessTripExpenses", "List")
        .setFilters({ "BusinessTripID": ids })
        .setPage(-1)
        .invoke()
        .getResponse();
        
    if (!_isEmpty(expenses)) {
        apiCore.newApiInvoker("App_BTRIP_BusinessTripExpenses", "Del")
            .setRequest({ "App_BTRIP_BusinessTripExpenses": expenses })
            .invoke();
    }
}

function validateModifications(apiCore, request) {
    // Проверка бизнес-правил
    for (let item of request) {
        if (item.Status === 'Approved' && !item.ApprovalDate) {
            throw new Error(`Для записи ${item.ID} требуется дата утверждения`);
        }
    }
}
```

## Заключение

Переопределение операции удаления в D5 позволяет:

1. **Обеспечить целостность данных** - каскадное удаление связанных записей
2. **Реализовать бизнес-логику** - проверки и валидации перед удалением
3. **Логировать операции** - ведение аудита изменений
4. **Интегрироваться с внешними системами** - уведомления об удалении

Основные принципы:
- Всегда вызывайте `apiRequest.invoke()` для выполнения стандартного удаления
- Правильно формируйте ответ через `apiResponse.response`
- Обрабатывайте ошибки и валидируйте входные данные
- Используйте транзакционный подход для сложных операций

Данный подход обеспечивает гибкость и контроль над процессом удаления записей при сохранении стандартной функциональности системы.
