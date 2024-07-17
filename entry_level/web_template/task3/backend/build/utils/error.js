<%
/** @module utils.error start*/
/**
 * Создает поток ошибки с объектом error
 * @param {object} errorObject - объект ошибки
 */
function HttpError(errorObject) {
    throw new Error(EncodeJson(errorObject));
}
/** @module utils.error end*/ 
%>
