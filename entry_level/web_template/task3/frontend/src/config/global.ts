declare global {
    interface Window {
        _app: { backendID: string; backendCode: string, appPath: StringConstructor; baseServerPath: string }
    }
}

// export const backendID = window._app?.backendID ?? '7384814640784692684'
export const backendCode = window._app?.backendCode ?? 'web_ex1'

// export const BACKEND_URL = `http://localhost/custom_web_template.html?object_id=${backendID}`
export const BACKEND_URL = `http://localhost/custom_web_template.html?object_code=${backendCode}`