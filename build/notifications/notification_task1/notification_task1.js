/* --- logic --- */
function sendNotificationToCollaborator() {
    var query = "sql: select c.id, STRING_AGG(f.person_fullname, ', ') \
     AS managerNames \
        from collaborators c \
            join func_managers f on f.object_id = c.id \
        where cast(c.hire_date AS DATE) = cast(GETDATE() AS DATE) \
            or cast(c.hire_date AS DATE) = cast(DATEADD(day, -1, GETDATE()) AS DATE) \
        group by c.id";
    var collaborators = ArraySelectAll(XQuery(query));
    var notificationId = OptInt(Param.notification_id);
    var collaborator;
    for (collaborator in collaborators) {
        tools.create_notification(notificationId, collaborator.id, collaborator.managerNames);
    }
}
/* --- start point --- */
function main() {
    try {
        sendNotificationToCollaborator();
    }
    catch (e) {
        logEvent(e.message, "error");
    }
}
/* --- system --- */
var GLOBAL = new Object();
GLOBAL["IS_DEBUG"] = tools_web.is_true(Param.IS_DEBUG);
var agentCode = "notification_task1";
EnableLog(agentCode, true);
/**
 * Вывод сообщения в журнал
 * @param {string} message - Сообщение
 * @param {string} type - Тип сообщения info/error
 */
function logEvent(message, type) {
    type = IsEmptyValue(type) ? "INFO" : StrUpperCase(type);
    if (ObjectType(message) === "JsObject" || ObjectType(message) === "JsArray") {
        message = tools.object_to_text(message, "json");
    }
    var payload = "[" + type + "] " + message;
    if (GLOBAL["IS_DEBUG"])
        LogEvent(agentCode, payload);
    else
        alert(payload);
}
logEvent("----------------Начало. Globexit. Агент для отправления уведомления новым сотрудникам------------------");
var mainTimer = DateToRawSeconds(Date());
try {
    main();
}
catch (e) {
    logEvent(e.message, "error");
}
mainTimer = DateToRawSeconds(Date()) - mainTimer;
logEvent("Агент завершил свою работу за " + mainTimer + " секунд");
logEvent("----------------Конец. Globexit. Агент для отправления уведомления новым сотрудникам------------------");