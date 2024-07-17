<%
function isArray(value) {
    return (DataType(value) == "object" &&
        IsArray(value) &&
        ObjectType(value) == "JsArray");
}
function isBinary(value) {
    return ObjectType(value) == "JsBinary";
}
function isBoolean(value) {
    return DataType(value) == "bool";
}
function isDate(value) {
    return DataType(value) == "date" || OptDate(value) !== undefined;
}
function isError(value) {
    return ObjectType(value) == "BmErrorInfo";
}
/**
 * Проверяет равна ли функция `null`, `undefined` или ``.
 * @param { any } value Проверяемое значение.
 * @returns { boolean }
 */
function isNull(v) {
    return isObject(v) || isArray(v)
        ? false
        : v === undefined || v === null || StrCharCount(v) === 0;
}
function isNumber(value) {
    return DataType(value) == "integer";
}
function isObject(value) {
    return DataType(value) == "object" && ObjectType(value) == "JsObject";
}
function isPrimitive(value) {
    var type = DataType(value);
    return (type == "integer" ||
        type == "float" ||
        type == "bool" ||
        type == "string" ||
        value === undefined ||
        value === null);
}
function isReal(value) {
    return DataType(value) == "real" && value !== (value ^ 0);
}
function isString(value) {
    return DataType(value) == "string";
}
function isUndef(value) {
    return value === undefined || value === null;
}
/**
 * Возвращает тип переданного значения.
 * @param { any } entity Значение.
 * @param { boolean } [getRValue=false] Возвращать RValue от значения.
 * @returns { string }
 */
function entityType(entity, getRValue) {
    if (getRValue === void 0) { getRValue = false; }
    var type = ObjectType(entity);
    if (type == "XmLdsSeq") {
        return entity.PrimaryKey == ""
            ? "SqlRow"
            : "XQueryRow";
    }
    var dataType = DataType(entity);
    if (dataType == "XmElem" && getRValue) {
        try {
            dataType = DataType(RValue(entity));
            if (!isNull(dataType)) {
                return dataType;
            }
        }
        catch (err) {
            // ...
        }
    }
    if (dataType != "object") {
        return dataType;
    }
    try {
        entity.TopElem;
        return "XmDoc";
    }
    catch (err) {
        try {
            entity.Doc;
            return "XmElem";
        }
        catch (err) {
            if (IsArray(entity)) {
                return "array";
            }
            return type;
        }
    }
}
/**
 * Выполняет функцию `makeSafe` над всеми элементами входного массива.
 * @param { Array } entityArray Входной массив.
 * @param { string } [targetType=string] Целевой тип значния.
 * @param { any } [defaultValue=null] Значение по-умолчанию, если проверка не пройдена.
 */
function makeArraySafe(arr, targetType, defaultValue) {
    var result = [];
    var i;
    for (i = 0; i < arr.length; i++) {
        result.push(makeSafe(arr[i], targetType, defaultValue));
    }
    return result;
}
/**
 * Выполняет коробочные функции "обезвреживания" данных над входным значением.
 * @param { any } entity Входное значение.
 * @param { string } [targetType=string] Целевой тип значния.
 * @param { any } [defaultValue=null] Значение по-умолчанию, если проверка не пройдена.
 * */
function makeSafe(entity, targetType, defaultValue) {
    targetType = targetType != undefined ? StrLowerCase(targetType) : "string";
    defaultValue = defaultValue != undefined ? defaultValue : null;
    var _safetyEntity = tools_web.convert_xss(entity);
    switch (targetType) {
        case "integer":
        case "number":
        case "int":
            _safetyEntity = OptInt(_safetyEntity, defaultValue);
            break;
        case "real":
            _safetyEntity = OptReal(_safetyEntity, defaultValue);
            break;
        case "xquery":
            _safetyEntity = XQueryLiteral(_safetyEntity);
            break;
        case "sql":
            _safetyEntity = SqlLiteral(_safetyEntity);
            break;
        case "boolean":
            _safetyEntity = tools_web.is_true(_safetyEntity);
            break;
        case "date":
            _safetyEntity = OptDate(_safetyEntity, defaultValue);
            break;
    }
    return _safetyEntity;
}
function getValue(value) {
    var type = entityType(value);
    if (type == "XmElem" || type == "string" || type == "integer") {
        return RValue(value);
    }
    return value;
}
%>
