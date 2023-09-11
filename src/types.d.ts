export type SignupData = {
  status: {
    ready: boolean;
    verificationRequired: boolean;
    reason?: 'Provisioning' | string;
  };
  consoleURL: string;
  cheDashboardURL: string;
  rhodsMemberURL: string;
  compliantUsername: string;
  defaultUserNamespace: string;
};
