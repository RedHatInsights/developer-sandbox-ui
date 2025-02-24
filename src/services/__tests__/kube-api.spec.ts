import { AxiosInstance } from 'axios';
import {
  getAAP,
  getDeployments,
  getPersistentVolumeClaims,
  getSecret,
  getStatefulSets,
} from '../kube-api';

const getMock = jest.fn() as jest.Mock;
const putMock = jest.fn() as jest.Mock;
const postMock = jest.fn() as jest.Mock;

const axiosInstance = {
  get: getMock,
  put: putMock,
  post: postMock,
} as unknown as AxiosInstance;

describe('kube-api', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });
  const mockData = {
    foo: 'bar',
  };
  getMock.mockReturnValue({ data: mockData });

  describe('getDeployments', () => {
    it('should get deployments', async () => {
      const data = await getDeployments(axiosInstance, 'mynamespace-dev');
      expect(getMock).toHaveBeenCalledWith('/apis/apps/v1/namespaces/mynamespace-dev/deployments');
      expect(data).toEqual(mockData);
    });
    it('should get deployments with labels', async () => {
      const data = await getDeployments(axiosInstance, 'mynamespace-dev', 'mylabel=value');
      expect(getMock).toHaveBeenCalledWith(
        '/apis/apps/v1/namespaces/mynamespace-dev/deployments?labelSelector=mylabel=value',
      );
      expect(data).toEqual(mockData);
    });
  });

  describe('getPersistentVolumeClaims', () => {
    it('should get PVCs', async () => {
      const data = await getPersistentVolumeClaims(axiosInstance, 'mynamespace-dev');
      expect(getMock).toHaveBeenCalledWith(
        '/api/v1/namespaces/mynamespace-dev/persistentvolumeclaims',
      );
      expect(data).toEqual(mockData);
    });
    it('should get PVCs with labels', async () => {
      const data = await getPersistentVolumeClaims(
        axiosInstance,
        'mynamespace-dev',
        'mylabel=value',
      );
      expect(getMock).toHaveBeenCalledWith(
        '/api/v1/namespaces/mynamespace-dev/persistentvolumeclaims?labelSelector=mylabel=value',
      );
      expect(data).toEqual(mockData);
    });
  });

  describe('getStatefulSets', () => {
    it('should get StatefulSets', async () => {
      const data = await getStatefulSets(axiosInstance, 'mynamespace-dev');
      expect(getMock).toHaveBeenCalledWith('/apis/apps/v1/namespaces/mynamespace-dev/statefulsets');
      expect(data).toEqual(mockData);
    });

    it('should get StatefulSets with labels', async () => {
      const data = await getStatefulSets(axiosInstance, 'mynamespace-dev', 'mylabel=value');
      expect(getMock).toHaveBeenCalledWith(
        '/apis/apps/v1/namespaces/mynamespace-dev/statefulsets?labelSelector=mylabel=value',
      );
      expect(data).toEqual(mockData);
    });
  });

  describe('getSecret', () => {
    it('should get Secret', async () => {
      const data = await getSecret(axiosInstance, 'mynamespace-dev', 'mysecret');
      expect(getMock).toHaveBeenCalledWith('/api/v1/namespaces/mynamespace-dev/secrets/mysecret');
      expect(data).toEqual(mockData);
    });
  });

  describe('getAAP', () => {
    it('should get AnsibleAutomationPlatform', async () => {
      const mockData = {
        foo: 'bar',
      };
      getMock.mockReturnValue({ data: mockData });
      const data = await getAAP(axiosInstance, 'mynamespace-dev');
      expect(getMock).toHaveBeenCalledWith(
        '/apis/aap.ansible.com/v1alpha1/namespaces/mynamespace-dev/ansibleautomationplatforms',
      );
      expect(data).toEqual(mockData);
    });
  });
});
