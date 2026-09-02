export interface IPlaybackData {    
    is_playing: boolean;
    progress_ms: number;    
    images: [
        {
            url: string
        }
    ]
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