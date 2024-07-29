/* --- logic --- */
function sendNotificationToCollaborator() {
	const collaborators = ArraySelectAll(XQuery(
		"sql: \
        select c.id, STRING_AGG(f.person_fullname, ', ') \
        AS managerNames \
            from collaborators c \
                join func_managers f on f.object_id = c.id \
            where cast(c.hire_date AS DATE) = cast(GETDATE() AS DATE) \
                or cast(c.hire_date AS DATE) = cast(DATEADD(day, -1, GETDATE()) AS DATE) \
            group by c.id"
	))

	let collaborator
	for (collaborator in collaborators) {
		tools.create_notification(OptInt(Param.notification_id), collaborator.id, collaborator.managerNames)
	}
}

function sendNotificationToManager() {
	const managerData = ArraySelectAll(XQuery(
		"sql: \
        with Data as (\
            select\
                f.person_id as manager_id,\
                cs.fullname,\
                cs.hire_date\
            from func_managers f\
            join collaborators cs on cs.id = f.object_id\
        )\
        select manager_id AS id,\
            STRING_AGG(fullname, ', ') as collNames\
        from Data\
        where cast(hire_date as DATE) = cast(GETDATE() as DATE)\
            or cast(hire_date as DATE) = cast(DATEADD(day, -1, GETDATE()) as DATE)\
        group by manager_id"
	))

	let manager
	for (manager in managerData) {
		tools.create_notification(OptInt(Param.notification_managers_id), manager.id, manager.collNames)
	}
}

/* --- start point --- */
function main() {
	try {
		sendNotificationToCollaborator();
		sendNotificationToManager();
	} catch (e) {
		logEvent(e.message, "error");
	}
}

/* --- system --- */
const GLOBAL = new Object();
GLOBAL["IS_DEBUG"] = tools_web.is_true(Param.IS_DEBUG);

const agentCode = "notification_task2";
EnableLog(agentCode, true);

/**
 * Вывод сообщения в журнал
 * @param {string} message - Сообщение
 * @param {string} type - Тип сообщения info/error
 */
function logEvent(message: string, type?: string) {
	type = IsEmptyValue(type) ? "INFO" : StrUpperCase(type);

	if (ObjectType(message) === "JsObject" || ObjectType(message) === "JsArray") {
		message = tools.object_to_text(message, "json")
	}

	const payload = "[" + type + "] " + message;
	if (GLOBAL["IS_DEBUG"])
		LogEvent(agentCode, payload);
	else alert(payload)
}

logEvent("----------------Начало. Globexit. Агент для отправления уведомления новым сотрудникам и их менеджерамм------------------");
let mainTimer = DateToRawSeconds(Date());

try {
	main();
} catch (e) {
	logEvent(e.message, "error");
}

mainTimer = DateToRawSeconds(Date()) - mainTimer;
logEvent("Агент завершил свою работу за " + mainTimer + " секунд");
logEvent("----------------Конец. Globexit. Агент для отправления уведомления новым сотрудникам и их менеджерам------------------");

export {};