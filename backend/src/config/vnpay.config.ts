import { VNPay, HashAlgorithm, ignoreLogger } from "vnpay";

export const vnpayConfig = {
    vnp_TmnCode: process.env.VNPAY_TMN_CODE || "7K6ZOGVO",
    vnp_HashSecret: process.env.VNPAY_HASH_SECRET || "YXUSPVOHCBMNRQBPKYMWYPFVGAQRRYFR",
    vnp_Url: process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || "http://localhost:3000/api/orders/vnpay-return",
    vnp_IpnUrl: process.env.VNPAY_IPN_URL || "https://cattishly-snoring-resume.ngrok-free.dev/api/orders/vnpay-ipn",
};

export const vnpay = new VNPay({
    tmnCode: vnpayConfig.vnp_TmnCode,
    secureSecret: vnpayConfig.vnp_HashSecret,
    vnpayHost: "https://sandbox.vnpayment.vn",
    testMode: true,
    hashAlgorithm: HashAlgorithm.SHA512,
    loggerFn: ignoreLogger,
});