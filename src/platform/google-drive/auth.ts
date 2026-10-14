/**
 * @file src/platform/google-drive/auth.ts
 * 文件职责：连接 Chrome 原生身份 API，并将一次同步绑定到同一个 Google 账号。
 * 主要内容：仅允许配置自有 OAuth 客户端的构建发起单项 Drive 授权，拒绝沿用上游公开客户端；处理 Drive 账号识别、短期令牌刷新与账号切换保护。
 * 模块边界：不保存令牌、不读取配置；账号和令牌只在后台请求期间使用。
 */
import {GOOGLE_DRIVE_DEFAULT_CLIENT_ID, GOOGLE_DRIVE_SCOPES} from './constants';

// 邮箱仅用于预览展示；账号绑定始终使用 Drive permissionId，不依赖邮箱或额外身份授权。
export interface DriveAccount {id: string; email: string}
export interface DriveSession {
    account: DriveAccount;
    request<T>(operation: (token: string) => Promise<T>): Promise<T>;
}
export interface DriveIdentity {
    getAuthToken(details: {interactive: boolean; enableGranularPermissions: boolean; scopes: string[]}): Promise<{token?: string; grantedScopes?: string[]}>;
    removeCachedAuthToken(details: {token: string}): Promise<void>;
    clearAllCachedAuthTokens(): Promise<void>;
}
export class DriveError extends Error {
    constructor(message: string, readonly status?: number) {super(message); this.name = 'DriveError';}
}
export interface DriveAuthPorts {
    userAgent(): string;
    identity?: DriveIdentity;
    runtime: {id: string; getManifest(): {oauth2?: {client_id?: string; scopes?: string[]}}};
    fetch: typeof fetch;
}

export function createDriveAuth(ports: DriveAuthPorts) {
    function availability(): {available: boolean; reason: string} {
        const oauth = ports.runtime.getManifest().oauth2;
        if (!/\bChrome\//u.test(ports.userAgent()) || /\b(?:Edg|OPR)\//u.test(ports.userAgent())) return {available: false, reason: 'Google Drive 同步目前支持 Chrome 扩展；其他浏览器可使用下方完整数据备份。'};
        if (!oauth?.client_id?.trim() || oauth.client_id.trim() === GOOGLE_DRIVE_DEFAULT_CLIENT_ID) return {available: false, reason: '此版本未配置 Wild Talker 自有的 Google Drive 授权，暂不可同步。请使用下方本地备份或自行配置 WebDAV。'};
        if (!ports.identity?.getAuthToken) return {available: false, reason: '当前 Chrome 构建缺少身份 API，请重新构建后使用 Google Drive 同步。'};
        if (!GOOGLE_DRIVE_SCOPES.every(scope => oauth.scopes?.includes(scope))) return {available: false, reason: '扩展缺少 Google Drive 应用数据授权范围，请重新构建。'};
        return {available: true, reason: ''};
    }
    async function token(interactive: boolean): Promise<string> {
        const state = availability();
        if (!state.available) throw new DriveError(state.reason);
        let result: Awaited<ReturnType<DriveIdentity['getAuthToken']>>;
        try {result = await ports.identity!.getAuthToken({interactive, enableGranularPermissions: true, scopes: [...GOOGLE_DRIVE_SCOPES]});}
        catch {throw new DriveError('Google 授权未完成，请点击同步按钮后重试。');}
        if (!result.token) throw new DriveError('Google 未返回有效授权，请点击同步按钮重试。');
        if (result.grantedScopes && !result.grantedScopes.includes(GOOGLE_DRIVE_SCOPES[0])) throw new DriveError('未允许 Google Drive 配置数据权限，请重新同步并在 Google 授权页面允许访问配置数据。');
        return result.token;
    }
    async function account(accessToken: string): Promise<DriveAccount> {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30_000);
        const operation = (async () => {
            let response: Response | undefined;
            try {
                response = await ports.fetch('https://www.googleapis.com/drive/v3/about?fields=user(permissionId,emailAddress)', {headers: {Authorization: `Bearer ${accessToken}`}, signal: controller.signal});
                if (!response.ok) throw new DriveError(`读取 Google 账号失败（HTTP ${response.status}）。`, response.status);
                const data: unknown = await response.json();
                const user = data && typeof data === 'object' && 'user' in data ? data.user : null;
                if (!user || typeof user !== 'object' || !('permissionId' in user) || typeof user.permissionId !== 'string' || !user.permissionId) throw new DriveError('Google 账号响应无效，请重新同步。');
                // 与旧 OAuth 身份 ID 分开命名，旧基线回到明确选方向的首次同步，不能按邮箱冒认同一账号。
                return {id: `drive:${user.permissionId}`, email: 'emailAddress' in user && typeof user.emailAddress === 'string' ? user.emailAddress : ''};
            } finally {
                if (response?.body && !response.body.locked) await response.body.cancel().catch(() => undefined);
            }
        })();
        return operation.catch(error => {
            if (error instanceof DriveError) throw error;
            throw new DriveError('无法读取 Google 账号，请检查网络后重试。');
        }).finally(() => clearTimeout(timer));
    }
    async function open(interactive = false): Promise<DriveSession> {
        let accessToken = await token(interactive);
        let owner: DriveAccount;
        try {owner = await account(accessToken);} catch (error) {
            if (!(error instanceof DriveError) || error.status !== 401) throw error;
            await ports.identity!.removeCachedAuthToken({token: accessToken});
            accessToken = await token(false);
            owner = await account(accessToken);
        }
        return {
            account: owner,
            async request(operation) {
                const requestToken = accessToken;
                try {return await operation(requestToken);} catch (error) {
                    if (!(error instanceof DriveError) || error.status !== 401) throw error;
                    await ports.identity!.removeCachedAuthToken({token: requestToken});
                    const refreshedToken = await token(false);
                    const refreshed = await account(refreshedToken);
                    if (refreshed.id !== owner.id) throw new DriveError('Google 账号已切换，请重新生成同步预览。');
                    // 只有验证属于本会话账号的令牌才可成为后续请求的凭据。
                    accessToken = refreshedToken;
                    return operation(refreshedToken);
                }
            },
        };
    }
    async function disconnect() {
        if (ports.identity) await ports.identity.clearAllCachedAuthTokens();
    }
    return {availability, open, disconnect};
}
