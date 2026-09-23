export class GoogleUser {
    id?: string;
    name?: string;
    email?: string;
    photoUrl?: string;
    firstName?: string;
    lastName?: string;

    constructor(public idToken: string) {
    }
}
