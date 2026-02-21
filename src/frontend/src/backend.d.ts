import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface BulkCommentResult {
    usedCount: bigint;
    availableCount: bigint;
    comments: Array<string>;
}
export interface Comment {
    text: string;
    used: boolean;
}
export interface LiveListCheckSummary {
    totalMatches: bigint;
    detailedResults: Array<LiveListCheckResult>;
}
export interface LiveListCheckResult {
    appName: string;
    matchCount: bigint;
    matches: Array<string>;
}
export interface BulkCommentTotals {
    totalLists: bigint;
    unusedComments: bigint;
    usedComments: bigint;
    totalComments: bigint;
}
export interface CommentListSummary {
    name: string;
    locked: boolean;
    usedComments: bigint;
    totalComments: bigint;
}
export interface RatingImage {
    imageBlob: ExternalBlob;
    uploaderName: string;
    uploadTime: bigint;
}
export interface ChatMessage {
    sender: string;
    message: string;
    timestamp: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addChatMessage(sender: string, message: string): Promise<void>;
    addLiveListApp(appName: string): Promise<void>;
    addSingleComment(listName: string, comment: string): Promise<void>;
    addUsernamesToApp(appName: string, newUsernames: Array<string>): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bulkUploadComments(listName: string, comments: Array<string>): Promise<void>;
    checkLiveList(usernamesToCheck: Array<string>): Promise<LiveListCheckSummary>;
    clearAllCommentLists(): Promise<void>;
    createCommentList(listId: string): Promise<void>;
    deleteComment(listName: string, comment: string): Promise<void>;
    deleteList(listName: string): Promise<void>;
    deleteLiveListApp(appName: string): Promise<void>;
    deleteRatingImage(index: bigint): Promise<void>;
    generateBulkComments(listName: string, count: bigint, accessKey: string): Promise<BulkCommentResult>;
    generateSingleComment(listName: string, deviceId: string): Promise<string>;
    getAllChatMessages(): Promise<Array<ChatMessage>>;
    getAllRatingImages(): Promise<Array<RatingImage>>;
    getAvailableCommentLists(): Promise<Array<string>>;
    getAvailableLiveListApps(): Promise<Array<string>>;
    getBulkCommentTotals(): Promise<BulkCommentTotals>;
    getBulkGeneratorKeyMasked(): Promise<string | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommentList(listName: string): Promise<Array<Comment> | null>;
    getCommentListSummary(listName: string): Promise<CommentListSummary | null>;
    getListsWithLockStatus(): Promise<Array<CommentListSummary>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasBulkGeneratorKey(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    resetAllLiveListApps(): Promise<void>;
    resetBulkGeneratorKey(): Promise<void>;
    resetList(listName: string): Promise<void>;
    resetUsernamesForApp(appName: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setBulkGeneratorKey(newKey: string): Promise<void>;
    toggleLockList(listName: string): Promise<boolean>;
    uploadRatingImage(uploaderName: string, image: ExternalBlob): Promise<void>;
}
