<%
var DEV_MODE = ArrayOptFirstElem(XQuery("sql:\
	SELECT id\
	FROM dbo.custom_web_templates\
	WHERE code = 'web_ex1' --\u041A\u043E\u0434 \u0448\u0430\u0431\u043B\u043E\u043D\u0430\
		AND enable_anonymous_access = 1")) != undefined;
if (DEV_MODE) {
    // Для тестирования, шаблон должен быть анонимным.
    Request.AddRespHeader("Access-Control-Allow-Origin", "*", false);
    Request.AddRespHeader("Access-Control-Expose-Headers", "Error-Message");
    Request.AddRespHeader("Access-Control-Allow-Headers", "origin, content-type, accept");
    Request.AddRespHeader("Access-Control-Allow-Credentials", "true");
}
Request.RespContentType = "application/json";
Request.AddRespHeader("Content-Security-Policy", "frame-ancestors 'self'");
Request.AddRespHeader("X-XSS-Protection", "1");
Request.AddRespHeader("X-Frame-Options", "SAMEORIGIN");
/** @module utils.query start*/
/**
 * Выбирает все записи sql запроса
 * @param {string} query - sql-выражение
 */
function selectAll(query) {
    return ArraySelectAll(tools.xquery("sql: " + query));
}
/**
 * Выбирает первую запись sql запроса
 * @param {string} query - sql-выражение
 * @param {any} defaultObj - значение по умолчанию
 */
function selectOne(query, defaultObj) {
    return ArrayOptFirstElem(tools.xquery("sql: " + query), defaultObj);
}
/** @module utils.query end*/
function getData() {
    return selectAll("sql: SELECT * FROM collaborators");
}
function getDepartments() {
    return selectAll("sql: select * from subdivisions");
}
function getUserXMLInfo(user_id) {
    var collaborator = selectOne("SELECT * FROM collaborator WHERE id=" + user_id);
    return collaborator;
}
function getDetails(user_id) {
    var collaborator = selectOne("SELECT * FROM collaborator WHERE id=" + user_id);
    var xml_collaborator = tools.open_doc(collaborator.id);
    var te_collaborator = xml_collaborator.TopElem;
    var history_states = te_collaborator.history_states.history_state;
    var change_logs = te_collaborator.change_logs.change_log;
    return { 'history_states': history_states, 'change_logs': change_logs };
}
function getUserInfo(user_id) {
    return selectOne("SELECT * FROM collaborators WHERE id=" + user_id);
}
function getSubscriptions() {
    return selectAll("SELECT * FROM subscriptions");
}
function addSubscription(user_id) {
    var collaborator = getUserInfo(user_id);
    var new_subscription = tools.new_doc_by_name("subscription");
    new_subscription.BindToDb();
    var te_subscription = new_subscription.TopElem;
    te_subscription.type = 'blog';
    te_subscription.person_id = collaborator.id;
    te_subscription.person_id.sd.fullname = collaborator.fullname;
    te_subscription.person_id.sd.org_name = collaborator.org_name;
    new_subscription.Save();
    return OptInt(new_subscription.DocID);
}
function removeSubscription(subscription_id) {
    selectOne("DELETE FROM wtdb.dbo.subscriptions WHERE id = " + subscription_id + ";");
    return selectOne("DELETE FROM wtdb.dbo.subscription WHERE id = " + subscription_id + ";");
}
function getTeam() {
    var subscriptions = getSubscriptions();
    var team = [];
    var userInfo;
    var subscription;
    for (subscription in subscriptions) {
        userInfo = getUserInfo(subscription.person_id);
        userInfo.code = subscription.id;
        team.push(userInfo);
    }
    return team;
}
/* --- utils --- */
function getParam(name) {
    return tools_web.get_web_param(curParams, name, undefined, 0);
}
/* --- global --- */
var curUserId = DEV_MODE ? OptInt("7000000000000000") : OptInt(Request.Session.Env.curUserID);
var curUser = DEV_MODE ? tools.open_doc(curUserId) : Request.Session.Env.curUser;
/* --- logic --- */
function handler(body, method, user_id, subscription_id) {
    if (method === "getData")
        return getData();
    if (method === "getDepartments")
        return getDepartments();
    if (method === "getDetails")
        return getDetails(user_id);
    if (method === "addSubscription")
        return addSubscription(user_id);
    if (method === "removeSubscription")
        return removeSubscription(subscription_id);
    if (method === "getTeam")
        return getTeam();
}
/* --- start point --- */
function main(req, res) {
    try {
        var body = req.Query;
        //const body = tools.read_object(req.Body)
        var method = tools_web.convert_xss(body.GetOptProperty("method"));
        var user_id = tools_web.convert_xss(body.GetOptProperty("user_id"));
        var subscription_id = tools_web.convert_xss(body.GetOptProperty("subscription_id"));
        if (method === undefined) {
            throw HttpError({
                code: 400,
                message: "unknown method"
            });
        }
        var payload = handler(body, method, user_id, subscription_id);
        res.Write(tools.object_to_text(payload, "json"));
    }
    catch (error) {
        var errorObject = tools.read_object(error);
        Request.RespContentType = "application/json";
        Request.SetRespStatus(errorObject.GetOptProperty("code", 500), "");
        Response.Write(errorObject.GetOptProperty("message", error));
    }
}
main(Request, Response);
%>
