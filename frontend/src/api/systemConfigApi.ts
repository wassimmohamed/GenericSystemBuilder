import apiClient from './apiClient';
import type {
  SystemConfigurationSummaryDto,
  SystemConfigurationResponseDto,
  CreateSystemConfigurationDto,
  UpdateSystemConfigurationDto,
  ExportCollectionDto,
  LoginRequest,
  LoginResponse,
} from '../types';

export const systemConfigApi = {
  getAll: () =>
    apiClient.get<SystemConfigurationSummaryDto[]>('/api/system-configurations').then((r) => r.data),

  getByKey: (key: string) =>
    apiClient.get<SystemConfigurationResponseDto>(`/api/system-configurations/${key}`).then((r) => r.data),

  getVersions: (key: string) =>
    apiClient.get<SystemConfigurationSummaryDto[]>(`/api/system-configurations/${key}/versions`).then((r) => r.data),

  getByVersion: (key: string, version: number) =>
    apiClient
      .get<SystemConfigurationResponseDto>(`/api/system-configurations/${key}/versions/${version}`)
      .then((r) => r.data),

  create: (data: CreateSystemConfigurationDto) =>
    apiClient
      .post<SystemConfigurationResponseDto>('/api/system-configurations', data)
      .then((r) => r.data),

  update: (key: string, data: UpdateSystemConfigurationDto) =>
    apiClient
      .put<SystemConfigurationResponseDto>(`/api/system-configurations/${key}`, data)
      .then((r) => r.data),

  delete: (key: string) =>
    apiClient.delete(`/api/system-configurations/${key}`).then(() => null),

  getExportCollection: (systemKey: string, pageKey: string, collectionName: string) =>
    apiClient
      .get<ExportCollectionDto>(
        `/api/system-configurations/${systemKey}/pages/${pageKey}/collections/${collectionName}`
      )
      .then((r) => r.data),

  getAccessibleSystems: (userId: string) =>
    apiClient
      .get<SystemConfigurationSummaryDto[]>(`/api/system-configurations/user/${userId}/accessible`)
      .then((r) => r.data),
};

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/api/auth/login', data).then((r) => r.data),
};

