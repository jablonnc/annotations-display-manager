/*
    Simple utility to dynamically attach the show/hide
    methods to our track data.
*/
const formatTrackData = (trackData) => {
    const trackLength = trackData.length;

    for (var trackIndex = 0; trackIndex < trackLength ; trackIndex++) { 
        const annotations = trackData[trackIndex];
        const annotationLength = annotations.length;

        for (var annotationIndex = 0; annotationIndex < annotationLength; annotationIndex++) { 
            const annotation = annotations[annotationIndex];
            const annotationMessage = `annotation ${annotationIndex + 1} in track ${trackIndex + 1} (start/end = ${annotation.startTime}/${annotation.endTime})`;

            annotation.show = () => console.log(`Show ${annotationMessage}\n`);
            annotation.hide = () => console.log(`Hide ${annotationMessage}\n`);
        }
    }

    return trackData;
};

/*
    Returns a static array of track data for easy analysis.
*/
const staticTracks = (() => {
    const trackData = [
        [
            { startTime: 2.000000, endTime: 3.000000 },
            { startTime: 3.000000, endTime: 4.000000 }
        ],
        [
            { startTime: 5.000000, endTime: 8.000000 },
            { startTime: 9.000000, endTime: 10.000000 }
        ],
        [
            // no annotations
        ],
        [
            { startTime: 12.000000, endTime: 14.000000 },
            { startTime: 17.000000, endTime: 19.000000 }
        ],
        [
            // no annotations  
        ]
    ]

    return formatTrackData(trackData);
})();

export {
    staticTracks
};
