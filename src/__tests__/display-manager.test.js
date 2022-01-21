import {
    DisplayManager,
    inTrack,
    getNextTrack,
    findTrack,
    getNextAnnotation,
    findAnnotation,
    getFirstAnnotationStartTime,
    getLastAnnotationEndTime
} from '../display-manager.js';

import { staticTracks } from '../../data/tracks.js';

const displayManager = new DisplayManager(staticTracks);

describe('DisplayManager', () => {
    describe('searchForAnnotations', () => {
        test('finds the correct annotation to show based on the timestamp', () => {
            const { annotationToShow } = displayManager.searchForAnnotations(2.5);
            const expectedAnnotation = staticTracks[0][1];
        
            expect(annotationToShow.startTime).toEqual(expectedAnnotation.startTime);
            expect(annotationToShow.endTime).toBe(expectedAnnotation.endTime);
        });
    
        test('finds the correct annotation to hide based on the timestamp', () => {
            displayManager.currentAnnotation = staticTracks[0][1];
    
            const { annotationToHide } = displayManager.searchForAnnotations(4);
            const expectedAnnotation = staticTracks[0][1];
        
            expect(annotationToHide.startTime).toEqual(expectedAnnotation.startTime);
            expect(annotationToHide.endTime).toBe(expectedAnnotation.endTime);
        });
    });

    describe('inTrack', () => {
        test('determines if the current times resides within the track', () => {
            const isInTrack = inTrack(2.5, staticTracks[0]);

            expect(isInTrack).toBe(true);
        });
    });

    describe('getNextTrack', () => {
        test('returns the next logical track that has annotations', () => {
            const nextTrack = getNextTrack(staticTracks, 0);
            const exepctedNextTrack = staticTracks[1];

            expect(nextTrack).toEqual(exepctedNextTrack);
        });
    });

    describe('findTrack', () => {
        test('determines the track where the current time resides in', () => {
            const { currentTrack } = findTrack(6, staticTracks);
            const expectedTrack = staticTracks[1];

            expect(currentTrack).toEqual(expectedTrack);
        });
    });

    describe('getNextAnnotation', () => {
        test('returns the next logical annotation', () => {
            const currentTrack = staticTracks[0];
            const nextTrack = staticTracks[1];
            const annotation = getNextAnnotation(currentTrack, nextTrack, 1);
            const expectedAnnotation = staticTracks[1][0];

            expect(annotation).toEqual(expectedAnnotation);
        });
    });

    describe('findAnnotation', () => {
        test('find the annotation based on the currentTime', () => {
            const currentTrack = staticTracks[0];
            const nextTrack = staticTracks[1];
            const { currentAnnotation } = findAnnotation(1.5, currentTrack, nextTrack);
            const expectedAnnotation = staticTracks[0][0];

            expect(currentAnnotation).toEqual(expectedAnnotation);
        });
    });

    describe('getFirstAnnotationStartTime', () => {
        test('finds the start time of the very first annotation in a series of tracks', () => {
            const startTime = getFirstAnnotationStartTime(staticTracks);
            const expectedAnnotation = staticTracks[0][0];
    
            expect(startTime).toEqual(expectedAnnotation.startTime);
        });
    });

    describe('getLastAnnotationEndTime', () => {
        test('finds the start time of the very first annotation in a series of tracks', () => {
            const endTime = getLastAnnotationEndTime(staticTracks);
            const expectedAnnotation = staticTracks[4][1];
            
            expect(endTime).toEqual(expectedAnnotation.endTime);
        });
    });
});