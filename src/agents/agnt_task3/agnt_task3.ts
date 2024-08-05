//=include ../utils/query.ts

/* --- logic --- */
// Функция для получения данных из Excel документа
function GetExcelData() {
	const xmlFileUrl = Screen.AskFileOpen("", "Excel файл");

	if (xmlFileUrl != null) {
		let data = undefined;
		let sourceList;
		try {
			sourceList = OpenDoc(xmlFileUrl, "format=excel");
			data = ArrayFirstElem(sourceList.TopElem);

			return data;
		} catch (e) {
			alert("Файл не найден: " + e);
		}
	}
}

// Функция для вызова создания карточек
function createCards(data: []) {
	let i
	for (i = 1; i <= ArrayCount(data); i++) {
		checkExist(data[i][0], data[i][1])
	}
}

// Функция для проверки существования сотрудника с должностью
function checkExist(collaborator: string, position: string) {
	const collaboratorElement = XQuery("for $elem in collaborators where $elem/fullname = '" + collaborator + "' return $elem")

	if (ArrayCount(collaboratorElement) == 0) {
		alert("Не имеется человек");
		createCollaborator(collaborator);
		setPosition(collaborator, position);

		return
	}

	if (collaboratorElement[0].fullname == collaborator && collaboratorElement[0].position_name == position) {
		alert("Имеется человек с должностью")
	} else if (collaboratorElement[0].fullname == collaborator && collaboratorElement[0].position_name != position) {
		alert("Имеется человек без должности")
		setPosition(collaborator, position)
	}
}

// Функция чтобы установить должность для сотрудника. Если должности не существует, то она создастся
function setPosition(collaborator: string, position: string) {
	const positionElement = XQuery("for $elem in positions where $elem/name = '" + position + "' return $elem")

	let collaboratorElement
	let collaboratorDoc

	if (ArrayCount(positionElement) != 0) {
		collaboratorElement = XQuery("for $elem in collaborators where $elem/fullname = '" + collaborator + "' return $elem")
		collaboratorDoc = tools.open_doc(collaboratorElement[0].id)
		collaboratorDoc.TopElem.position_id = positionElement[0].id
		collaboratorDoc.Save()
	} else {
		createPosition(position)
		setPosition(collaborator, position)
	}
}

// Функция для создания сотрудников
function createCollaborator(name: string) {
	const newCollaborator = tools.new_doc_by_name("collaborator");
	newCollaborator.BindToDb();
	newCollaborator.TopElem.firstname = name;
	newCollaborator.Save()
}

// Функция для создания должностей
function createPosition(name: string) {
	const newPosition = tools.new_doc_by_name("position");
	newPosition.BindToDb();

	newPosition.TopElem.name = name

	newPosition.Save()
}


/* --- start point --- */
function main() {
	let dataFromExcel
	try {
		dataFromExcel = GetExcelData()
		createCards(dataFromExcel);
	} catch (e) {
		logEvent(e.message, "error");
	}
}

/* --- system --- */
const GLOBAL = new Object();
GLOBAL["IS_DEBUG"] = tools_web.is_true(Param.IS_DEBUG);

const agentCode = "agnt_task3";
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

logEvent("----------------Начало. Globexit. Агент для создания карточек из xlsx------------------");
let mainTimer = DateToRawSeconds(Date());

try {
	main();
} catch (e) {
	logEvent(e.message, "error");
}

mainTimer = DateToRawSeconds(Date()) - mainTimer;
logEvent("Агент завершил свою работу за " + mainTimer + " секунд");
logEvent("----------------Конец. Globexit. Агент для создания карточек из xlsx------------------");

export {};