import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  if (!sessionStorage.getItem('integration_token')) {
    sessionStorage.setItem('integration_token', 'integration-demo-token');
  }
  return true;
};

