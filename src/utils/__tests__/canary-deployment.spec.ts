import { randomIntFromInterval, redirectUser } from '../canary-deployment';

describe('canary-deployment', () => {
  describe('randomIntFromInterval', () => {
    it('should return a random number in between the provided range', () => {
      const rndInt = randomIntFromInterval(1, 50);
      expect(rndInt).toBeLessThanOrEqual(50);
    });
  });

  describe('redirectUser', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        value: {
          href: 'http://dummy.com',
        },
        writable: true,
      });
    });

    it('user should get redirected if weight is within the threshold', () => {
      redirectUser(10, 50);
      expect(window.location.href).toBe('https://sandbox.redhat.com');
    });
    it('user should not get redirected if weight is not within the threshold', () => {
      redirectUser(30, 20);
      expect(window.location.href).toBe('http://dummy.com');
    });
  });
});
