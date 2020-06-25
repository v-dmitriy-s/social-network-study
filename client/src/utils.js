import Hashids from 'hashids'

const hashids = new Hashids("b8y}ATw~<[c_=Q2JF.bZWWD.", 10);

export function encodeId(id) {
    return hashids.encode(id);
}

export function decodeId(id) {
    return hashids.decode(id);
}

export const SUCCESS = 'success';
export const ERROR = 'error';

export const MALE = "м";
export const FEMALE = "ж";

export function getGenderString(gender) {
    switch (gender) {
        case MALE:
            return "Мужской";
        case FEMALE:
            return "Женский";
        default:
            throw new Error("It doesn't exist gender type");
    }
}