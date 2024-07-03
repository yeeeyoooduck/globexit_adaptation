// =include ../utils/query.ts

function getData() {
	return selectAll("sql: SELECT * FROM collaborators")
}

function getDepartments() {
	return selectAll<SubdivisionCatalogDocumentTopElem>("select * from subdivisions")
}

function getUserInfo(user_id: string) {
	return selectOne(`SELECT * FROM collaborator WHERE id=${user_id}`)
}