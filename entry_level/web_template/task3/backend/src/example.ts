//=require ./modules/devmode.ts
//=require ./modules/collaborators.ts

/* --- types --- */

type Subscription = {
	id: number;
};

/* --- utils --- */
function getParam(name: string) {
	return tools_web.get_web_param(curParams, name, undefined, 0);
}

/* --- global --- */
const curUserId: number = DEV_MODE ? OptInt("7000000000000000") : OptInt(Request.Session.Env.curUserID);
const curUser = DEV_MODE ? tools.open_doc(curUserId) : Request.Session.Env.curUser;

/* --- logic --- */
function handler(body: object, method: string, user_id: string, subscription_id: string) {

	if (method === "getData")
		return getData()

	if (method === "getDepartments")
		return getDepartments()

	if (method === "getDetails")
		return getDetails(user_id)

	if (method === "addSubscription")
		return addSubscription(user_id)

	if (method === "removeSubscription")
		return removeSubscription(subscription_id)

	if (method === "getTeam")
		return getTeam()

}

/* --- start point --- */
function main(req: Request, res: Response) {
	try {
		const body = req.Query;
		//const body = tools.read_object(req.Body)
		const method = tools_web.convert_xss(body.GetOptProperty("method"))
		const user_id = tools_web.convert_xss(body.GetOptProperty("user_id"))
		const subscription_id = tools_web.convert_xss(body.GetOptProperty("subscription_id"))

		if (method === undefined) {
			throw HttpError({
				code: 400,
				message: "unknown method"
			});
		}

		const payload = handler(body, method, user_id, subscription_id);

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