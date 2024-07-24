/* --- logic --- */
// Функция для создания карточек
function createCards() {
	const filePath = Screen.AskFileOpen("", "JSON (*.json)");
	const data = LoadFileData(filePath.replace("file:///", ""));
	const json = ParseJson(data)

	let chapter
	let newDocument
	let newDocumentTE
	let accessGroupId
	let accessGroup

	for (chapter in json.chapters) {
		newDocument = tools.new_doc_by_name("document");
		newDocument.BindToDb();

		newDocumentTE = newDocument.TopElem

		newDocumentTE.name = chapter.name;
		newDocumentTE.createDate = chapter.createDate;
		newDocumentTE.comment = chapter.comment;
		newDocumentTE.parentDocumentId = chapter.parentDocumentId;

		for (accessGroupId in chapter.accessGroupIds) {
			accessGroup = newDocumentTE.access.access_groups.AddChild();
			accessGroup.group_id = accessGroupId;
		}

		newDocument.Save();
	}
}

/* --- start point --- */
function main() {
	try {
		createCards();
	} catch (e) {
		logEvent(e.message, "error");
	}
}

/* --- system --- */
const GLOBAL = new Object();
GLOBAL["IS_DEBUG"] = tools_web.is_true(Param.IS_DEBUG);

const agentCode = "agnt_task2";
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

logEvent("----------------Начало. Globexit. Агент для создания карточек из json------------------");
let mainTimer = DateToRawSeconds(Date());

try {
	main();
} catch (e) {
	logEvent(e.message, "error");
}

mainTimer = DateToRawSeconds(Date()) - mainTimer;
logEvent("Агент завершил свою работу за " + mainTimer + " секунд");
logEvent("----------------Конец. Globexit. Агент для создания карточек из json------------------");

export {};