import { Exception } from "./Exception";

export const VerificationCodeExpired: Exception = {
    statusCode: 401,
    message: [
        "verification code has expired"
    ],
    error: "Unauthorized"
}

export const NoVerificationCodes: Exception = {
    statusCode: 401,
    message: [
        "could not find any verification codes"
    ],
    error: "Unauthorized"
}

export const VerificationCodeMismatch: Exception = {
    statusCode: 401,
    message: [
        "verification code does not match"
    ],
    error: "Unauthorized"
}

export const VerificationTypeMismatch: Exception = {
    statusCode: 401,
    message: [
        "given verification type does not match requested"
    ],
    error: "Unauthorized"
}