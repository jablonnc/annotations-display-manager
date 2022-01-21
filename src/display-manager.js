
const isTimeInRange = (currentTime, startTime, endTime) => {
    return currentTime > startTime && currentTime < endTime;
};

const logSearchLevels = (step, shouldLog) => {
    if (shouldLog) console.log(`Searching in step ${step}`);
};

/*
Determine if we are inside the last track we looked in,
avoids searching through other tracks unnecessarily.
*/
const inTrack = (currentTime, currentTrack) => {
    if (currentTrack) {
        const firstAnnotation = currentTrack[0];
        const lastAnnotation = currentTrack[currentTrack.length - 1];

        return currentTime >= firstAnnotation.startTime && currentTime <= lastAnnotation.endTime;
    }

    return false;
}

/*
Find the next track that has actual annotations within it.
*/
const getNextTrack = (tracks, currentIndex) => {
    if (currentIndex < (tracks.length - 1)) {
        return tracks.slice((currentIndex + 1)).find(track => track.length);
    }
};

/*
Use a simple binary search to identify the closest track.
We do this by splitting the tracks in 2, and then identifying
whether we should search to the left or right.
*/
const findTrack = (currentTime, tracks) => {
    const tracksToSearch = tracks.slice();
    let start = 0;
    let end = tracksToSearch.length - 1;

    while (start <= end) {
        let middle = Math.floor((start + end) / 2);

        const currentTrack = tracksToSearch[middle];
        const firstAnnotation = currentTrack && currentTrack[0];
        const lastAnnotation = currentTrack && currentTrack[currentTrack.length - 1];

        // If the track doesn't have an annotation, we want to exclude it from the search
        if (!firstAnnotation && !lastAnnotation) {
            tracksToSearch.splice(middle, 1);

            continue;
        }

        // match found
        if (currentTime >= firstAnnotation.startTime && currentTime <= lastAnnotation.endTime) {
            return {
                currentTrack,
                nextTrack: getNextTrack(tracksToSearch, middle)
            };
        }
        // search right
        else if (currentTime > lastAnnotation.endTime) {
            start = middle + 1;
        }
        // search left
        else {
            end = middle - 1;
        }
    }

    return {};
}

/*
Find the next annotation.  If we're at the end of the current track,
this may imply looking at the next track.
*/
const getNextAnnotation = (currentTrack, nextTrack, currentIndex) => {
    // Is the annotation in the current track
    if (currentIndex < (currentTrack.length - 1)) {
        return currentTrack[currentIndex + 1];
    }
    // Otherwise if the nextTrack exists, return the first annotation
    else if (nextTrack && nextTrack.length) {
        return nextTrack[0];
    }
};

/*
Use a simple binary search to identify the closest annotation.
We do this by splitting the annotation in 2, and then identifying
whether we should search to the left or right.
*/
const findAnnotation = (currentTime, currentTrack, nextTrack) => {
    if (currentTrack) {
        let start = 0;
        let end = currentTrack.length - 1;

        while (start <= end) {
            let middle = Math.floor((start + end) / 2);

            const currentAnnotation = currentTrack[middle];

            // match found
            if (currentTime >= currentAnnotation.startTime && currentTime <= currentAnnotation.endTime) {
                return {
                    currentAnnotation,
                    nextAnnotation: getNextAnnotation(currentTrack, nextTrack, middle)
                };
            }
            // search right
            else if (currentTime > currentAnnotation.endTime) {
                start = middle + 1;
            }
            // search left
            else {
                end = middle - 1;
            }
        }

        return {};
    }
};

const getFirstAnnotationStartTime = (tracks) => {
    if (tracks) {
        const firstApplicableTrack = tracks.find(track => track.length);
        const firstApplicableAnnotation = firstApplicableTrack.find(annotation => annotation.startTime);
    
        return firstApplicableAnnotation.startTime;
    }
};

const getLastAnnotationEndTime = (tracks) => {
    if (tracks) {
        const firstApplicableTrack = tracks.slice().reverse().find(track => track.length);
        const firstApplicableAnnotation = firstApplicableTrack.slice().reverse().find(annotation => annotation.endTime);

        return firstApplicableAnnotation.endTime;
    }
};

class DisplayManager {
    constructor(tracks) {
        this.tracks = tracks;

        this.currentTrack = this.tracks && this.tracks[0];
        this.nextTrack = null;

        this.currentAnnotation = null;
        this.nextAnnotation = this.currentTrack;

        this.firstAnnotationStartTime = getFirstAnnotationStartTime(this.tracks);
        this.lastAnnotationStartTime = getLastAnnotationEndTime(this.tracks);

        this.currentAnnotationVisible = false;
    }

    timeUpdate (currentTime) {
        const { annotationToShow, annotationToHide } = this.searchForAnnotations(currentTime);

        if (annotationToShow.show) annotationToShow.show();
        if (annotationToHide.hide) annotationToHide.hide();
    }

    /*
    The approach below takes a stepped approach to searching for an annotation, with
    the steps increasing in terms of both time and complexity the further along you go.
    */
    searchForAnnotations (currentTime) {
        // Set to true if you want to see the level of search occurring per update
        const LOG_SEARCH_LEVELS = false;

        let annotationToShow = {};
        let annotationToHide = {};
        let continueSearch = true;
        
        if (!this.tracks) {
            console.log('No tracks have been found.');

            continueSearch = false;;
        }

        if (LOG_SEARCH_LEVELS) {
            console.log(`\n\nSearch at ${currentTime}`);
        }

        /*
        Step 1 - If we haven't reached the first annotation or are past the last one, abort the search.
        */
        if (continueSearch && currentTime < this.firstAnnotationStartTime || currentTime > this.lastAnnotationStartTime) {
            logSearchLevels(`1 (abort search, you are outside of all tracks)`, LOG_SEARCH_LEVELS);

            continueSearch = false;
        }

        /*
        Step 2 - If an annotation is still visible, determine if we're still within it or if it needs hidden.
        */
        if (continueSearch && this.currentAnnotation && this.currentAnnotationVisible) {
            const inRange = isTimeInRange(currentTime, this.currentAnnotation.startTime, this.currentAnnotation.endTime);
        
            // If it's visible and we're within it's range, abort the search.
            if (inRange) {
                logSearchLevels(`2 (abort search, you're within a current annotation)`, LOG_SEARCH_LEVELS);

                continueSearch = false;
            } else {
                /*
                If an annotation is visible and we've reached the end of it, go ahead and hide it. Since another
                annotation's startTime may be equal to this annotation's endTime, we do not return here.
                */
                this.currentAnnotationVisible = false;

                annotationToHide = { ...this.currentAnnotation };  
            }
        }
        
        /*
        Step 3 - Identify if we're in between annotations, if so there is no need to perform any of the heavier search operations below.
        */
        if (continueSearch && this.nextAnnotation && this.currentAnnotation && currentTime > this.currentAnnotation.endTime && currentTime < this.nextAnnotation.startTime) {
            logSearchLevels(`3 (abort search, you're in a gap)`, LOG_SEARCH_LEVELS);

            continueSearch = false;
        }

        /*
        Step 4 - Before we attempt to find the track that the annotation is in, first determine
        if we're already in the appropriate track to avoid a needless search.
        */
        if (continueSearch && !inTrack(currentTime, this.currentTrack)) {
            const { currentTrack, nextTrack } = findTrack(currentTime, this.tracks);

            logSearchLevels('4 (find a new track)', LOG_SEARCH_LEVELS);

            this.currentTrack = currentTrack;

            if (nextTrack) this.nextTrack = nextTrack;
        }

        /*
        Step 5 - We only search for an annotation if we're inside a track.
        */
        if (continueSearch && this.currentTrack) {
            const { currentAnnotation, nextAnnotation } = findAnnotation(currentTime, this.currentTrack, this.nextTrack);

            logSearchLevels('5 (find a new annotation)', LOG_SEARCH_LEVELS);

            /*
            If an annotation has been found and it's not currently shown (currentAnnotation does not exists),
            store a reference to the new annotation and then show it.
            */
            if (currentAnnotation && currentAnnotation !== this.currentAnnotation) {
                this.currentAnnotationVisible = true;
                this.currentAnnotation = currentAnnotation;
                this.nextAnnotation = nextAnnotation;

                annotationToShow = { ...this.currentAnnotation };
            }
        }

        return {
            annotationToShow,
            annotationToHide
        }
    }
};

export {
    DisplayManager,
    inTrack,
    getNextTrack,
    findTrack,
    getNextAnnotation,
    findAnnotation,
    getFirstAnnotationStartTime,
    getLastAnnotationEndTime
};