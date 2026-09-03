export interface IPlaybackData {    
    is_playing: boolean;
    progress_ms: number;    
    image: string
    artists: [
        {
            name: string
        },
        {
            name: string
        }
    ];
    duration_ms: number;
    trackTitle: string;
}

export interface ITrack {
    id: string;
    trackTitle: string;
    spotifyTrackId: string;
    artists: { name: string }[];
    image: string;
    timeAdded: string;
}