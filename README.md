# better-multi-twitch
A multiple Twitch.tv stream viewer with robust viewing options, stream layouts, and usage of the legacy chat* so that FFZ and BTTV actually work like they used to. Streams will adapt to any browser window size and automatically change layouts to give you the best view of all the streams and chats that you have selected. Also allows you to manually place and resize any video or chat yourself (though these positions are lost upon page refresh).

**I suspect one day Twitch will remove legacy chat as well, but until then, rejoice.*

To actually use the app, go here: https://kree-nickm.github.io/better-multi-twitch/

You can also download it and use it on your computer if you feel like it. You just need the HTML, JS, and CSS files in the same directory. Might be useful if you've got improvements you'd like to make. Maybe one day I will allow contributors, and you can show them off.

## Usage
* Enter a streamer name or VOD ID number into the input box on the options popup. VODs do not have chat support.
* When hovering over a chat or video, a border will appear. Drag this border to manually resize and move windows. Must have "Place Manually" algorithm selected or your placements will be overwritten.
* Click anywhere outside of a stream or chat window to reopen the options popup. You can also press Escape, but this will not work if the most recent thing you clicked on was the inside of a chat or video.
* Placement algorithm determines where the page will place each window depending on your preferences:
	* Minimize Blank Space will place and size windows to make sure as much of the browser window is used as possible by the chats and videos.
	* Maximize Video Size will make sure the video windows are as large as possible while still keeping the desired chats on the page somewhere.
	* Place Manually will disable the algorithms entirely so that they don't interfere with your own manual placement of the windows. The windows will also not react to changes in the browser window size.

## Status Apr 8, 2018
Should work with up to 4 streams, but may be buggy as I haven't rewritten the code for any more than 1 stream to use the new layout algorithms. Yeah, yeah, "multi" Twitch LUL; I was literally in the middle of rewriting the app when I decided to upload it to GitHub, so it is what it is. I haven't decided on how the layout algorithms will work for additional streams yet.
