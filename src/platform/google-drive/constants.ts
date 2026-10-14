/**
 * @file src/platform/google-drive/constants.ts
 * 文件职责：定义 Google Drive 同步的公开应用身份、最小权限和文件协议标识。
 * 主要内容：集中为兼容安装保留的扩展公钥与 ID、用于拦截误用的上游 OAuth Client ID、应用数据文件名与同步状态键；默认构建不启用上游 OAuth。
 * 模块边界：只描述公开协议，不包含测试用户、登录令牌、用户口令或浏览器副作用。
 */
// 仅用于识别并拒绝继承的上游客户端，不是 Wild Talker 的默认授权客户端。
export const GOOGLE_DRIVE_DEFAULT_CLIENT_ID = '474699705334-7fua4hnkq1nmfu92cof0kdnmqsk5kth8.apps.googleusercontent.com';
export const GOOGLE_DRIVE_EXTENSION_ID = 'djnlaiohfaaifbibleebjggkghlmcpcj';
export const GOOGLE_DRIVE_SCOPES = [
    'https://www.googleapis.com/auth/drive.appdata',
] as const;
export const GOOGLE_DRIVE_CONFIG_FILE_NAME = 'fluentread-config.encrypted.json';
export const GOOGLE_DRIVE_SYNC_STATE_KEY = 'local:googleDriveEncryptedSyncState';
// 配置 JSON 与云端密文分开预算；预览只额外包含少量账号和期限元数据。
export const GOOGLE_DRIVE_MAX_CONFIG_BYTES = 20 * 1024 * 1024;
export const GOOGLE_DRIVE_MAX_PREVIEW_BYTES = GOOGLE_DRIVE_MAX_CONFIG_BYTES + 1024 * 1024;
export const GOOGLE_DRIVE_MAX_BYTES = 32 * 1024 * 1024;


// Chrome 商店 CRX 签名中的公开公钥；SHA-256 前 16 字节对应上方官方扩展 ID。
export const GOOGLE_DRIVE_EXTENSION_PUBLIC_KEY = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzyYQdG/K1kp2h+orQITmCJYrUP3FkUgay+KYlUMO74J0uaOBJ0A2lz0kooci0epVm3DKIqiFMQs8g5pGxKfwieLYju4/v6jK4X3AnRH+3Wj0WhnY0yMD61IN/HissrFnmBTfApW7BoVfjUUwhsHJ7pYJHMhgpbidJ15SA7X82iRpu+WxE413BKSi2q6TwNSgi7D1Vq6W9Iuaz1tPQW9CGgfir3P5enUqUasLv6icLVXq5xduFISrsJxZW0dJyGxpwOqEBGbg2g9i73M/iFao7N7pZdBvZJh63ZzlZTNM7FshCzkZpM0MJhuJhrLmR1AYCWQ1kiTfwCX+6EvAgBQyrQIDAQAB';

// 固定应用口令是公开的格式兼容参数；拿到密文的人可以据此解密，访问保护依赖 Google 授权。
export const GOOGLE_DRIVE_APPLICATION_PASSPHRASE = 'FluentReadEncryption';
