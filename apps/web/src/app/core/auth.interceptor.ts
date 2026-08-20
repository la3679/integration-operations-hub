import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = sessionStorage.getItem('integration_token') ?? 'integration-demo-token';
  const correlationId = crypto.randomUUID();

  return next(request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      'X-Correlation-ID': correlationId
    }
  }));
};

