alert("Агент для установки случайных паролей запущен...");

// Функция для назначения случайных паролей выбранным сотрудникам
function assignRandomPasswords() {
    var employeeIds = OBJECTS_ID_STR.split(';');

    for (employeeId in employeeIds) {
        var employeeDoc = tools.open_doc(OptInt(employeeId));
        var newPassword = tools.random_string(8);

        employeeDoc.TopElem.password = newPassword;
        employeeDoc.Save();
    }
}

// Запуск основной функции с обработкой ошибок
try {
    assignRandomPasswords();
    alert("Пароли успешно назначены.");
} catch (e) {
    alert("Ошибка при назначении паролей: " + e.message);
}

alert("Агент для установки случайных паролей завершен.");