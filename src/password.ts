interface LPMPassword extends Object {
    un: string;
    web: string;
    pw: string;
}

export default class LPMPasswords {
    list: Array<LPMPassword> = [];
}
