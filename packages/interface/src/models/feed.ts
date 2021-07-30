import { ErrorMessage, mergeErrors, validateIf, validateNotEmpty, validateNumberGreaterThanOrEqual, validateNumberLessThanOrEqual, validateNumeric } from '../validator/validators';


export type Point = [ x: number, y: number];
export type MotionRegion = [ x: number, y: number, width: number, height: number];

export interface Feed {
    id: string;
    name: string;

    // stream processing (ffmpeg)
    streamUrl: string;
    maxFps?: number;
    scaleFactor?: number; // multiplied by width and height of video to resize
    videoQuality?: number; // range 2-31, 31 is worst

    // storage
    saveVideo?: boolean;
    savePath?: string;

    // motion detection
    detectMotion?: boolean;
    motionDiffThreshold?: number;
    motionRegions?: MotionRegion[];
}

export namespace Feed {
    export const DEFAULT_VIDEO_QUALITY = 24;
    export const DEFAULT_MAX_FPS = 16;
}

export const validateFeed = (feed: Partial<Feed>): ErrorMessage[] => {
    return mergeErrors(
        validateNotEmpty(feed, 'id'),
        validateNotEmpty(feed, 'name', 'Feed name'),
        validateNotEmpty(feed, 'streamUrl', 'Stream URL'),
        validateNumeric(feed, 'maxFps', 'Max FPS'),
        validateNumeric(feed, 'scaleFactor', 'Scale factor'),
        ...validateIf(
            validateNotEmpty(feed, 'videoQuality', 'Video quality'),
            [
                validateNumeric(feed, 'videoQuality', 'Video quality'),
                validateNumberGreaterThanOrEqual(feed, 'videoQuality', 2, 'Video quality'),
                validateNumberLessThanOrEqual(feed, 'videoQuality', 31, 'Video quality'),
            ]
        ),
        ...validateIf(
            feed.saveVideo === true,
            [
                validateNotEmpty(feed, 'savePath', 'Storage path'),
            ]
        ),
        ...validateIf(
            feed.detectMotion === true,
            validateIf(
                validateNumeric(feed, 'motionDiffThreshold', 'Motion detection threshold'),
                [
                    validateNumberLessThanOrEqual(feed, 'motionDiffThreshold', 1, 'Motion detection threshold'),
                    validateNumberGreaterThanOrEqual(feed, 'motionDiffThreshold', 0, 'Motion detection threshold'),
                ]
            )
        ),
    );
}

export interface Config {
    feeds: Feed[];
}