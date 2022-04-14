export enum GenericEmailType {
  CONFIRMATION = 'confirmation',
}

export type GenericEmailComponents = {
  mainMessage: string;
  footer: string;
};

const throwInvalidGenericEmailType = (_: never): never => {
  throw new Error('Invalid generic email type passed');
};

export function getSubjectForGenericEmail(type: GenericEmailType): string {
  switch (type) {
    case GenericEmailType.CONFIRMATION:
      return 'Backed: Email request received';
    default:
      return throwInvalidGenericEmailType(type);
  }
}
