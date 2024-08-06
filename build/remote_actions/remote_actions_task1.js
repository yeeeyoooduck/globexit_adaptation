switch (command) {
    case "eval": {
        RESULT = {
            command: "display_form",
            title: "Введите сообщение",
            width: "600",
            height: "450",
            form_fields: [{
                    name: "message",
                    type: "string",
                    value: "",
                    mandatory: true,
                    validation: "nonempty"
                }],
            buttons: [{
                    name: "submit", label: "Ок", type: "submit"
                }],
            no_buttons: false
        };
        break;
    }
    case "submit_form": {
        var message = ArrayOptFirstElem(ParseJson(form_fields)).value;
        tools.create_notification(Int("6423292989894653736"), curUserID, message);
        RESULT = {
            command: "alert",
            msg: "Сообщение успешно отправлено!",
            confirm_result: {
                command: "close_form"
            }
        };
        break;
    }
}