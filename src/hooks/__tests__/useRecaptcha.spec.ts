import { renderHook } from '@testing-library/react';
import { useRecaptcha } from '../useRecaptcha';
import { recaptchaApiKey } from '../../utils/recaptcha';

describe('useRecaptcha', () => {
  it('should render recaptcha script tag', () => {
    renderHook(() => useRecaptcha());
    const script = document.getElementsByTagName('script')[0];
    expect(script).toBeInTheDocument();
    expect(script).toHaveAttribute(
      'src',
      `https://www.google.com/recaptcha/enterprise.js?render=${recaptchaApiKey}`,
    );
  });
});
