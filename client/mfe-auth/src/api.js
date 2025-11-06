// Stub API. Thay bằng call thật (fetch/axios) khi tích hợp backend.
const sleep = (ms) => new Promise(r => setTimeout(r, ms));


export async function requestOtp(email) {
    await sleep(600);
    // TODO: POST /auth/request-otp { email }
    return { ok: true };
}


export async function verifyOtp(email, code) {
    await sleep(600);
    // TODO: POST /auth/verify-otp { email, code }
    const ok = code === '123456'; // demo: mã đúng là 123456
    return { ok, token: ok ? 'demo-jwt-token' : null };
}