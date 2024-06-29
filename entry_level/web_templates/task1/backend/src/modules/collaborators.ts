// =include ../utils/query.ts

function getData() {
	return selectAll("sql: SELECT * FROM collaborators")
}
