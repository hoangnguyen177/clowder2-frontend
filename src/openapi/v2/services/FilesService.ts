/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_save_file_api_v2_files__dataset_id__post } from '../models/Body_save_file_api_v2_files__dataset_id__post';
import type { ClowderFile } from '../models/ClowderFile';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class FilesService {

    /**
     * Save File
     * @param datasetId
     * @param formData
     * @returns ClowderFile Successful Response
     * @throws ApiError
     */
    public static saveFileApiV2FilesDatasetIdPost(
        datasetId: string,
        formData: Body_save_file_api_v2_files__dataset_id__post,
    ): CancelablePromise<ClowderFile> {
        return __request({
            method: 'POST',
            path: `/api/v2/files/${datasetId}`,
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Download File
     * @param fileId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadFileApiV2FilesFileIdGet(
        fileId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/files/${fileId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Edit File
     * @param fileId
     * @param requestBody
     * @returns ClowderFile Successful Response
     * @throws ApiError
     */
    public static editFileApiV2FilesFileIdPut(
        fileId: string,
        requestBody: ClowderFile,
    ): CancelablePromise<ClowderFile> {
        return __request({
            method: 'PUT',
            path: `/api/v2/files/${fileId}`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete File
     * @param fileId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteFileApiV2FilesFileIdDelete(
        fileId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/files/${fileId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get File Summary
     * @param fileId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getFileSummaryApiV2FilesFileIdSummaryGet(
        fileId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/files/${fileId}/summary`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}