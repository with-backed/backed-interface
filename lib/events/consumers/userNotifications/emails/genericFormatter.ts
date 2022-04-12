export enum GenericEmailType {
  CONFIRMATION = 'confirmation',
}

export type GenericEmailComponents = {
  mainMessage: string;
  footer: string;
};

export function getSubjectForGenericEmail(type: GenericEmailType): string {
  switch (type) {
    case GenericEmailType.CONFIRMATION:
      return 'Backed: Email request received';
    default:
      return '';
  }
}
