//=require ./modules/devmode.ts
//=require ./modules/collaborators.ts

/* --- types --- */

/* --- utils --- */
function getParam(name: string) {
	return tools_web.get_web_param(curParams, name, undefined, 0);
}

/* --- global --- */
const curUserId: number = DEV_MODE ? OptInt("7000000000000000") : OptInt(Request.Session.Env.curUserID);
const curUser = DEV_MODE ? tools.open_doc(curUserId) : Request.Session.Env.curUser;

/* --- logic --- */
function getDepartments() {
	return selectAll<SubdivisionCatalogDocumentTopElem>("select * from subdivisions")
}

function handler(body: object, method: string) {

	if (method === "getData")
		return getData()

	if (method === "getDepartments")
		return getDepartments()
}

/* --- start point --- */
function main(req: Request, res: Response) {
	try {
		const body = req.Query;
		//const body = tools.read_object(req.Body)
		const method = tools_web.convert_xss(body.GetOptProperty("method"))

		if (method === undefined) {
			throw HttpError({
				code: 400,
				message: "unknown method"
			});
		}

		const payload = handler(body, method);

		res.Write(tools.object_to_text(payload, "json"));

	} catch (error) {
		const errorObject = tools.read_object(error);
		Request.RespContentType = "application/json";
		Request.SetRespStatus(errorObject.GetOptProperty("code", 500), "");
		Response.Write(errorObject.GetOptProperty("message", error));
	}
}

main(Request, Response);

export {}