export interface IPlaybackData {    
    idTrack: string;
    is_playing: boolean;
    progress_ms: number;    
    image: string
    artists: string[];
    duration_ms: number;
    trackTitle: string;
}