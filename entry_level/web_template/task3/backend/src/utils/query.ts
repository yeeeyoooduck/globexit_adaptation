
/** @module utils.query start*/

/**
 * Выбирает все записи sql запроса
 * @param {string} query - sql-выражение
 */
function selectAll<T>(query: string) {
	return ArraySelectAll<T>(tools.xquery(`sql: ${query}`));
}

/**
 * Выбирает первую запись sql запроса
 * @param {string} query - sql-выражение
 * @param {any} defaultObj - значение по умолчанию
 */
function selectOne<T>(query: string, defaultObj?: any) {
	return ArrayOptFirstElem<T>(tools.xquery(`sql: ${query}`), defaultObj);
}

/** @module utils.query end*/
