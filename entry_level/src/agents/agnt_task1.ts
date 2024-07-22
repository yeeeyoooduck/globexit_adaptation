/* --- types --- */
interface IError {
	code: number;
	message: string;
}

/* --- logic --- */
// Функция для назначения случайных паролей выбранным сотрудникам
function assignRandomPasswords() {
	const employeeIds = OBJECTS_ID_STR.split(";");
	let employeeDoc;
	let employeeId;

	for (employeeId in employeeIds) {
		employeeDoc = tools.open_doc(OptInt(employeeId));

		employeeDoc.TopElem.password = tools.random_string(8);
		employeeDoc.Save();
	}
}

/* --- start point --- */
function main() {
	try {
		assignRandomPasswords();
	} catch (e) {
		logEvent(e.message, "error");
	}
}

/* --- system --- */
const GLOBAL = new Object();
GLOBAL["IS_DEBUG"] = tools_web.is_true(Param.IS_DEBUG);

const agentCode = "agnt_task1";
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

logEvent("----------------Начало. Globexit. Агент для установки случайных паролей------------------");
let mainTimer = DateToRawSeconds(Date());

try {
	main();
} catch (e) {
	logEvent(e.message, "error");
}

mainTimer = DateToRawSeconds(Date()) - mainTimer;
logEvent("Агент завершил свою работу за " + mainTimer + " секунд");
logEvent("----------------Конец. Globexit. Агент для установки случайных паролей------------------");

export {};