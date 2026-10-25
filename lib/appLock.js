import * as LocalAuthentication from 'expo-local-authentication';
import { createAppLockService } from '../utils/appLock';

export const appLockService = createAppLockService(LocalAuthentication);