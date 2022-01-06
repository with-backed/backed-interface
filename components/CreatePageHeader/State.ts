export enum State {
  NotConnected = 0,
  NeedsToSelect,
  NeedsToAuthorize,
  AuthorizationInProgress,
  Form,
  Ready,
  Submitting,
}
