/** @module utils.error start*/

interface IError {
	code: number;
	message:string;
}

/**
 * Создает поток ошибки с объектом error
 * @param {object} errorObject - объект ошибки
 */
function HttpError(errorObject: IError) {
	throw new Error(EncodeJson(errorObject));
}

/** @module utils.error end*/