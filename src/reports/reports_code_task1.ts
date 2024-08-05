declare let PARAM1: string
const groupId = {PARAM1}

const query = "sql: \
    select \
        c.code, \
        c.fullname,\
        c.email, \
        c.position_name, \
        c.position_parent_name,\
        f.person_fullname,\
        cb.email as manager_email, \
        cb.position_name as manager_position_name \
    from group_collaborators gc \
            join collaborators c on gc.collaborator_id = c.id \
            left join func_managers f on f.object_id = c.id and f.is_native = 'true' \
            left join collaborators cb on cb.id = f.person_id \
    where gc.group_id =" + groupId;

return selectAll(query)