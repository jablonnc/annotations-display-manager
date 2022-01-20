# Description

The purpose of this exercise is to write an efficient algorithm that decides whether to show or hide an annotation as interactive content plays. An annotation may be a highlighted area, a text overlay, or a prompt to the user to take an action.

# Before You Start

Please run `npm install` to install the necessary dependencies.  While this was mostly pure Javascript, I did use babel-node so I could leverage import statements and Jest for the testing piece.

# Run The Player

Run `npm run start` to start the demo player.  This simulates the tick of a video player and calls the `timeUpdate` on each interval.

# Call the timeUpdate method in the displayManager with a specific time

Run `npm run start currentTime=2.0` to start the demo player.  This simulates the tick of a video player and calls the `timeUpdate` on each interval.

# Test

Run `npm run test` to run all the associated tests for the display manager.

# Solution

The approach I took takes a stepped approach to searching for an annotation.  The steps increase in terms of both the time and complexity the further along you go.  The steps are as follows:

1. If we haven't reached the first annotation or are past the last one, abort the search.  This indicates we are completely outside of all tracks, so there is no reason to keep searching.
2. If an annotation is still visible, determine if we're still within it or if it needs hidden.  If we're still in the annotation, there is no need to search any further.
3. Identify if we're in between annotations, if so there is no need to perform any additional searches.
4. Before we attempt to find the track that the annotation is in, first determine if we're already in the appropriate track to avoid a needless search.  Otherwise we proceed to find the track where the annotation must reside in.  To do this, we leverage a binary search where we start our search in the middle of the array, and then move left or right depending on the time we're searching for.
5. Lastly we search for an annotation, but only if we're inside a track.  Similar to our approach with finding a track, we also perform a binary search with our annotations to make this search as efficient as possible.

To accomplish the steps above, I kept track of various state objects that allowed me to know where in the dataset I was at any given time.  Since a normal video player will play in a linear fashion (unless the user intervenes), I made assumptions that the next annotation after the previously shown one was most likely going to be our next match.  So rather than searching through the entire dataset each time, I first checked the next logical annotation to avoid any unnecessary searching.  By taking this approach, the search is efficient and avoids searching through areas of the dataset where we know the annotation cannot be.  This also ensures that as the number of tracks and annotations grows, the search itself should remain performant.
