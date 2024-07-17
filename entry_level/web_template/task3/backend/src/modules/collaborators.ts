// =include ../utils/query.ts

import { file_sources } from "@umbrik/webtutor-types/lib/global_catalogs"

function getData() {
	return selectAll("sql: SELECT * FROM collaborators")
}

function getDepartments() {
	return selectAll("sql: select * from subdivisions")
}

function getUserXMLInfo(user_id: string) {
	const collaborator = selectOne(`SELECT * FROM collaborator WHERE id=${user_id}`)

	return collaborator
}

function getDetails(user_id: string) {
	const collaborator = selectOne(`SELECT * FROM collaborator WHERE id=${user_id}`)

	const xml_collaborator = tools.open_doc(collaborator.id)
	const te_collaborator = xml_collaborator.TopElem

	const history_states = te_collaborator.history_states.history_state
	const change_logs = te_collaborator.change_logs.change_log

	return {'history_states': history_states, 'change_logs': change_logs}
}

function getUserInfo(user_id: string) {
	return selectOne(`SELECT * FROM collaborators WHERE id=${user_id}`)
}

function getSubscriptions() {
	return selectAll("SELECT * FROM subscriptions")
}

function addSubscription(user_id: string) {
	const collaborator = getUserInfo(user_id);

	const new_subscription = tools.new_doc_by_name("subscription");
	new_subscription.BindToDb();

	const te_subscription = new_subscription.TopElem

	te_subscription.type = 'blog'
	te_subscription.person_id = collaborator.id
	te_subscription.person_id.sd.fullname = collaborator.fullname
	te_subscription.person_id.sd.org_name = collaborator.org_name

	new_subscription.Save()

	return OptInt(new_subscription.DocID)

}

function removeSubscription(subscription_id: string) {
	selectOne(`DELETE FROM wtdb.dbo.subscriptions WHERE id = ${subscription_id};`)
	return selectOne(`DELETE FROM wtdb.dbo.subscription WHERE id = ${subscription_id};`)

}

function getTeam() {
	const subscriptions = getSubscriptions();
	
	let team = [];
	let userInfo;
	let subscription: Subscription;
	for (subscription in subscriptions) {
		userInfo = getUserInfo(subscription.person_id);
		userInfo.code = subscription.id
		team.push(userInfo);
	}

	return team;
}
