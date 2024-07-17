<%
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
%>
