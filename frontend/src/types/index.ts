// ---- Field-level types ----

export interface FieldOptionDto {
  value: string;
  label: string;
  labelAr?: string;
}

export interface AutocompleteConfigDto {
  sourceType: string;
  collectionRef?: string;
  displayField?: string;
  valueField?: string;
  staticOptions?: FieldOptionDto[];
}

export interface SliderConfigDto {
  min: number;
  max: number;
  step: number;
}

export interface CustomValidationRuleDto {
  ruleName: string;
  errorMessage?: string;
  parameters?: Record<string, unknown>;
}

export interface FieldValidationDto {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  unique: boolean;
  regex?: string;
  regexMessage?: string;
  disabledOnEdit: boolean;
  customRules?: CustomValidationRuleDto[];
}

export interface FieldPermissionDto {
  viewUsers: string[];
  editUsers: string[];
}

export interface FieldConfigDto {
  fieldKey: string;
  label: string;
  labelAr: string;
  fieldType: string;
  defaultValue?: string;
  placeholder?: string;
  options?: FieldOptionDto[];
  autocompleteConfig?: AutocompleteConfigDto;
  sliderConfig?: SliderConfigDto;
  validation: FieldValidationDto;
  permission?: FieldPermissionDto;
  order: number;
}

// ---- Page-level types ----

export interface FormConfigDto {
  title: string;
  fields: FieldConfigDto[];
}

export interface ListConfigDto {
  displayFields: string[];
  enableSearch: boolean;
  enablePagination: boolean;
  pageSize: number;
  defaultSortField?: string;
  defaultSortDirection: string;
}

export interface ExportCollectionDto {
  collectionName: string;
  fields: string[];
}

export interface PagePermissionsDto {
  listAccess: string[];
  createAccess: string[];
  editAccess: string[];
  deleteAccess: string[];
}

export interface PageConfigDto {
  pageKey: string;
  title: string;
  titleAr: string;
  form?: FormConfigDto;
  list?: ListConfigDto;
  exportCollections: ExportCollectionDto[];
  permissions?: PagePermissionsDto;
}

// ---- System-level types ----

export interface PermissionConfigDto {
  userId: string;
  role: string;
  accessiblePages: string[];
}

export interface SystemConfigDataDto {
  icon: string;
  title: string;
  titleAr: string;
  description: string;
  pages: PageConfigDto[];
  permissions: PermissionConfigDto[];
}

export interface SystemConfigurationResponseDto {
  id: string;
  systemKey: string;
  version: number;
  isActive: boolean;
  configuration: SystemConfigDataDto;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface SystemConfigurationSummaryDto {
  id: string;
  systemKey: string;
  version: number;
  isActive: boolean;
  title: string;
  titleAr: string;
  icon: string;
  description: string;
  pageCount: number;
  createdAt: string;
  createdBy: string;
}

export interface CreateSystemConfigurationDto {
  systemKey: string;
  configuration: SystemConfigDataDto;
  createdBy: string;
}

export interface UpdateSystemConfigurationDto {
  configuration: SystemConfigDataDto;
  updatedBy: string;
}

// ---- Auth types ----

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiration: string;
}
