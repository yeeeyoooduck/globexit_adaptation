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
%>
