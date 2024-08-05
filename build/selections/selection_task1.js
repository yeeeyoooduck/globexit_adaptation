function showAdaptations() {
    var query = "sql: \
        select cr.* \
        from career_reserves cr \
        where cr.status = 'passed' \
          and ( \
            select COUNT(*) \
            from career_reserve crx \
              cross apply crx.data.nodes('career_reserve/tasks/task') as tasks(task) \
            where crx.id = cr.id \
          ) = ( \
            select COUNT(*) \
            from career_reserve crx \
              cross apply crx.data.nodes('career_reserve/tasks/task') as tasks(task) \
            where crx.id = cr.id \
              and tasks.task.value('(status)[1]', 'varchar(20)') = 'passed' \
          )";
    return selectAll(query);
}
RESULT = showAdaptations();