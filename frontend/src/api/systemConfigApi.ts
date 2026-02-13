import apiClient from './apiClient';
import type {
  SystemConfigurationSummaryDto,
  SystemConfigurationResponseDto,
  CreateSystemConfigurationDto,
  UpdateSystemConfigurationDto,
  ExportCollectionDto,
  LoginRequest,
  LoginResponse,
  DataEntryResponseDto,
  CreateDataEntryDto,
  UpdateDataEntryDto,
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

export const dataEntryApi = {
  getAll: (systemKey: string, pageKey: string) =>
    apiClient
      .get<DataEntryResponseDto[]>(`/api/data/${systemKey}/${pageKey}`)
      .then((r) => r.data),

  getCollectionData: (systemKey: string, pageKey: string, collectionName: string) =>
    apiClient
      .get<Record<string, any>[]>(
        `/api/data/${systemKey}/${pageKey}/collections/${collectionName}`
      )
      .then((r) => r.data),

  create: (systemKey: string, pageKey: string, data: CreateDataEntryDto) =>
    apiClient
      .post<DataEntryResponseDto>(`/api/data/${systemKey}/${pageKey}`, data)
      .then((r) => r.data),

  update: (systemKey: string, pageKey: string, id: string, data: UpdateDataEntryDto) =>
    apiClient
      .put<DataEntryResponseDto>(`/api/data/${systemKey}/${pageKey}/${id}`, data)
      .then((r) => r.data),

  delete: (systemKey: string, pageKey: string, id: string) =>
    apiClient
      .delete(`/api/data/${systemKey}/${pageKey}/${id}`)
      .then(() => null),
};

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/api/auth/login', data).then((r) => r.data),
};

