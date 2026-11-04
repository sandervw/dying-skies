/** Quality tiers that trade sound detail for CPU on weak devices. */
/** Named quality levels; "auto" picks one from the device. */
export type QualityTier = "high" | "medium" | "low";
/** Limits the DSP core applies for a tier. */
export interface TierSettings {
    readonly oversampleLimit: number;
    readonly voiceLimit: number;
    readonly reverbSecondsLimit: number;
    readonly shaperOversample: number;
    readonly fatCountLimit: number;
    readonly controlInterval: number;
}
/** Settings for each tier. */
export declare const TIERS: Readonly<Record<QualityTier, TierSettings>>;
/** Device facts used to guess a tier. */
export interface DeviceFacts {
    readonly cores: number;
    readonly memoryGigabytes: number;
    readonly isMobile: boolean;
}
/** Picks a tier from device facts. */
export declare function chooseTier(device: DeviceFacts): QualityTier;
