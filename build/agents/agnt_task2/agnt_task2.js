/* --- logic --- */
// Функция для создания карточек
function createCards() {
    var filePath = Screen.AskFileOpen("", "JSON (*.json)");
    var data = LoadFileData(filePath.replace("file:///", ""));
    var json = ParseJson(data);
    var chapter;
    var newDocument;
    var newDocumentTE;
    var accessGroupId;
    var accessGroup;
    for (chapter in json.chapters) {
        newDocument = tools.new_doc_by_name("document");
        newDocument.BindToDb();
        newDocumentTE = newDocument.TopElem;
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
    }
    catch (e) {
        logEvent(e.message, "error");
    }
}
/* --- system --- */
var GLOBAL = new Object();
GLOBAL["IS_DEBUG"] = tools_web.is_true(Param.IS_DEBUG);
var agentCode = "agnt_task2";
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
logEvent("----------------Начало. Globexit. Агент для создания карточек из json------------------");
var mainTimer = DateToRawSeconds(Date());
try {
    main();
}
catch (e) {
    logEvent(e.message, "error");
}
mainTimer = DateToRawSeconds(Date()) - mainTimer;
logEvent("Агент завершил свою работу за " + mainTimer + " секунд");
logEvent("----------------Конец. Globexit. Агент для создания карточек из json------------------");