export class Address {
  constructor(
    public street: string,
    public postCode: string,
    public city: string,
    public additional?: string,
  ) {}
}
