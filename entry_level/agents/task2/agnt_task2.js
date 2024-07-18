﻿alert("Агент для создания карточек запущен...");

// Функция для создания карточек
function createCards(path) {
    var data = LoadFileData(path.replace('file:///', ''));
    var json = ParseJson(data)

    for (chapter in json.chapters) {
        new_document = tools.new_doc_by_name('document');
        new_document.BindToDb();

        new_document_te = new_document.TopElem

        new_document_te.name = chapter.name;
        new_document_te.create_date = chapter.create_date;
        new_document_te.comment = chapter.comment;
        new_document_te.parent_document_id = chapter.parent_document_id;

        for (accessGroupId in chapter.accessGroupIds) {
            accessGroup = new_document_te.access.access_groups.AddChild();
            accessGroup.group_id = accessGroupId;
        }

        new_document.Save();
    }
}

// Запуск основной функции с обработкой ошибок
try {
    var filePath = Screen.AskFileOpen('', 'JSON (*.json)');
    createCards(filePath);
} catch (e) {
    alert("Произошла ошибка: " + e.message)
}

alert("Агент для установки создания карточек завершен.");