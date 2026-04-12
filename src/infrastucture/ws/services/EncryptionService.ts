import { configProvider } from '@/config/configProvider';

export class EncryptionService {
  private static instance: EncryptionService;

  private keyMapping = new Map<string, string>();

  private constructor() {}

  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  deleteKey(socketId: string) {
    this.keyMapping.delete(socketId);
  }

  isEnabled() {
    return configProvider.get('PAYLOAD_ENCRYPTED');
  }

  setKey(socketId: string, key: string) {
    this.keyMapping.set(socketId, key);
  }
}
