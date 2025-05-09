const RHDH_SANDBOX_UI_FQDN = 'https://sandbox.redhat.com';

export const randomIntFromInterval = (min: number, max: number): number => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const redirectUser = (userWeightValue: number, weightThreshold: number) => {
  if (userWeightValue <= weightThreshold) {
    window.location.href = RHDH_SANDBOX_UI_FQDN;
    return;
  }
};

export const canaryDeploymentCheck = (canaryWeightThreshold: number) => {
  // check if user already has the UI canary deployment weight
  const UICanaryWeightJson = localStorage.getItem('dev-sandbox.ui-canary-weight');
  if (UICanaryWeightJson == null) {
    // generate a new rand number for the user
    const rndInt = randomIntFromInterval(1, 100);
    // store the new rand number for the user in the local storage as a string
    localStorage.setItem('dev-sandbox.ui-canary-weight', JSON.stringify(rndInt)); // numbers must be saved as strings in localstorage
    // check if user should go to new UI and redirect in case
    redirectUser(rndInt, canaryWeightThreshold);
  } else {
    // convert the string back to int
    const UICanaryWeight = JSON.parse(UICanaryWeightJson);
    redirectUser(UICanaryWeight, canaryWeightThreshold);
  }
};
