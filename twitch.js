// If a different file name is used, change it here.
var filename = "index.html";

// You can change these if you think you need to. They should only be things that are not valid characters of a streamer's name.
// Chat suffix is checked first, in case you want them to use the same characters.
var nochat_suffix = "--";
var novideo_suffix = "-";

var url_path;
function update_URL_bar()
{
	if(!url_path || url_path == "" || !filename || filename == "")
		return false;
	var newURL = url_path + filename;
	$("div.iframe.video").each(function(i,elem){
		var stream = elem.id.substr(6);
		var vod = !isNaN(stream);
		newURL = newURL + "/" + stream;
		if($("#chat_"+ stream).length == 0 && !vod)
			newURL = newURL + nochat_suffix;
	});
	$("div.iframe.chat").each(function(i,elem){
		var stream = elem.id.substr(5);
		if($("#video_"+ stream).length == 0)
			newURL = newURL + "/" + stream + novideo_suffix;
	});
	window.history.pushState({}, "", newURL);
	return true;
}

function add_stream(stream)
{
	var vod = !isNaN(stream);
	var skipchat = vod;
	var skipvideo = false;
	if(!skipchat && nochat_suffix.length && stream.substr(nochat_suffix.length * -1) == nochat_suffix)
	{
		skipchat = true;
		stream = stream.substr(0, stream.length - nochat_suffix.length);
	}
	else if(novideo_suffix.length && stream.substr(novideo_suffix.length * -1) == novideo_suffix)
	{
		skipvideo = true;
		stream = stream.substr(0, stream.length - novideo_suffix.length);
	}
	if(!skipvideo && $("#video_"+ stream).length == 0)
	{
		$("body").append('<div id="video_'+ stream +'" class="iframe video" style="height:720px;width:1280px;"><iframe src="http://player.twitch.tv/?'+ (vod?'video':'channel') +'='+ stream +'" height="720" width="1280" frameborder="0" scrolling="no" allowfullscreen="false"></iframe></div>');
		$("#stream_list").append('<div class="stream-list-item">video_'+ stream +'<button id="remove_video_'+ stream +'">Remove</button></div>');
		$("#remove_video_"+ stream).click(remove_window);
	}
	if(!skipchat && $("#chat_"+ stream).length == 0)
	{
		$("body").append('<div id="chat_'+ stream +'" class="iframe chat" style="height:720px;width:350px;"><iframe frameborder="0" scrolling="no" id="'+ stream +'" src="https://www.twitch.tv/'+ stream +'/chat?popout=" height="720" width="350"></iframe></div>');
		$("#stream_list").append('<div class="stream-list-item">chat_'+ stream +'<button id="remove_chat_'+ stream +'">Remove</button></div>');
		$("#remove_chat_"+ stream).click(remove_window);
	}
	setup_windows();
	arrange_windows();
}

// Call after new HTML elements are added to the page. Adds the necessary jQuery callbacks and functionality to any new video/chat elements.
function setup_windows()
{
	$("div.iframe").each(function(i,element){
		/*if(!$(element).hasClass("ui-draggable"))
		{
			$(element).draggable({
				cancel: "input,textarea,button,select,option,iframe",
				cursor: "crosshair",
				distance: 0,
				grid: [10,10],
				stack: "div.iframe",
				iframeFix: true
			});
		}*/
		if(!$(element).hasClass("ui-resizable"))
		{
			var iframe = $(element).children("iframe");
			$(element).prop("iframe", iframe);
			/*$(element).resizable({
				cancel: "input,textarea,button,select,option,iframe",
				handles: "all",
				distance: 0,
				grid: [10,10],
				autoHide: true,
				start: function(event, ui){
					$(element).prop("height_buffer", ui.size.height - iframe.attr("height"));
					$(element).prop("width_buffer", ui.size.width - iframe.attr("width"));
				},
				resize: function(event, ui){
					$(element).prop("iframe").attr("height", ui.size.height-$(element).prop("height_buffer")).attr("width", ui.size.width-$(element).prop("width_buffer"));
				}
			});*/
		}
	});
}

function set_dimensions(jqI, position, size)
{
	jqI.css("left", (position[0]-10)+"px")
		.css("top", (position[1]-10)+"px")
		.css("width", size[0]+"px")
		.css("height", size[1]+"px")
		.prop("iframe")
			.attr("width", size[0])
			.attr("height", size[1])
	;
}

function get_widescreen_dimensions(width, height)
{
	var dimensions = [width, Math.ceil(width * 9 / 16)];
	if(dimensions[1] > height)
	{
		dimensions[1] = height;
		dimensions[0] = Math.ceil(dimensions[1] * 16 / 9);
	}
	return dimensions;
}

function get_widescreen_dimensions_by_height(height, width_max)
{
	var dimensions = [Math.ceil(height * 16 / 9), height];
	if(dimensions[0] > width_max)
	{
		dimensions[0] = width_max;
		dimensions[1] = Math.ceil(dimensions[0] * 9 / 16);
	}
	return dimensions;
}

function LayoutManager(num_videos, num_chats) {
	this.num_videos = num_videos;
	this.num_chats = num_chats;
	this.element_list = [];
	for(var i=0; i<num_videos+num_chats; i++)
		this.element_list.push([0, 0, 0, 0]);
	this.unused_space = -1;
	this.element_changed = function(i) {
		this.unused_space = -1;
	}
	this.set_video = function(i, definition) {
		this.set_video_position(i, [definition[0], definition[1]], true);
		this.set_video_size(i, [definition[2], definition[3]], false);
	}
	this.set_video_position = function(i, pos, dontnotify) {
		if(i < this.num_videos && i >= 0)
		{
			if(pos[0] != null)
				this.element_list[i][0] = pos[0];
			if(pos[1] != null)
				this.element_list[i][1] = pos[1];
			if(!dontnotify)
				this.element_changed(i);
		}
	}
	this.set_video_size = function(i, size, dontnotify) {
		if(i < this.num_videos && i >= 0)
		{
			if(size[0] != null && size[0] > -1)
				this.element_list[i][2] = size[0];
			if(size[1] != null && size[1] > -1)
				this.element_list[i][3] = size[1];
			if(!dontnotify)
				this.element_changed(i);
		}
	}
	this.set_chat = function(i, definition) {
		this.set_chat_position(i, [definition[0], definition[1]], true);
		this.set_chat_size(i, [definition[2], definition[3]], false);
	}
	this.set_chat_position = function(i, pos, dontnotify) {
		if(i < this.num_chats && i >= 0)
		{
			if(pos[0] != null)
				this.element_list[this.num_videos+i][0] = pos[0];
			if(pos[1] != null)
				this.element_list[this.num_videos+i][1] = pos[1];
			if(!dontnotify)
				this.element_changed(i);
		}
	}
	this.set_chat_size = function(i, size, dontnotify) {
		if(i < this.num_chats && i >= 0)
		{
			if(size[0]/size[1] > chat_max_width/chat_min_height)
				size[0] = size[1] * chat_max_width / chat_min_height;
			if(size[0] != null && size[0] > -1)
				this.element_list[this.num_videos+i][2] = size[0];
			if(size[1] != null && size[1] > -1)
				this.element_list[this.num_videos+i][3] = size[1];
			if(!dontnotify)
				this.element_changed(i);
		}
	}
	this.get_unused_space = function() {
		if(this.unused_space > -1)
			return this.unused_space;
		var total = $(window).width() * $(window).height();
		for(var i=0; i<this.num_videos+this.num_chats; i++)
		{
			total -= this.element_list[i][2] * this.element_list[i][3];
		}
		//TODO: calculate overlapping elements
		this.unused_space = total;
		return total;
	}
	this.get_main_video_space = function() {
		return this.get_video_space(0);
	}
	this.get_video_x = function(i) {
		if(i < this.num_videos && i >= 0)
			return this.element_list[i][0];
		else
			return 0;
	}
	this.get_video_left = function(i) {
		return this.get_video_x(i);
	}
	this.get_video_right = function(i) {
		if(i < this.num_videos && i >= 0)
			return this.element_list[i][0] + this.element_list[i][2];
		else
			return 0;
	}
	this.get_video_y = function(i) {
		if(i < this.num_videos && i >= 0)
			return this.element_list[i][1];
		else
			return 0;
	}
	this.get_video_top = function(i) {
		return this.get_video_x(i);
	}
	this.get_video_bottom = function(i) {
		if(i < this.num_videos && i >= 0)
			return this.element_list[i][1] + this.element_list[i][3];
		else
			return 0;
	}
	this.get_video_width = function(i) {
		if(i < this.num_videos && i >= 0)
			return this.element_list[i][2];
		else
			return 0;
	}
	this.get_video_height = function(i) {
		if(i < this.num_videos && i >= 0)
			return this.element_list[i][3];
		else
			return 0;
	}
	this.get_video_space = function(i) {
		if(this.num_videos > i && i >= 0)
			return this.element_list[i][2] * this.element_list[i][3];
		else
			return 0;
	}
	this.get_chat_x = function(i) {
		if(i < this.num_chats && i >= 0)
			return this.element_list[this.num_videos+i][0];
		else
			return 0;
	}
	this.get_chat_left = function(i) {
		return this.get_chat_x(i);
	}
	this.get_chat_right = function(i) {
		if(i < this.num_chats && i >= 0)
			return this.element_list[this.num_videos+i][0] + this.element_list[this.num_videos+i][2];
		else
			return 0;
	}
	this.get_chat_y = function(i) {
		if(i < this.num_chats && i >= 0)
			return this.element_list[this.num_videos+i][1];
		else
			return 0;
	}
	this.get_chat_top = function(i) {
		return this.get_chat_y(i);
	}
	this.get_chat_bottom = function(i) {
		if(i < this.num_chats && i >= 0)
			return this.element_list[this.num_videos+i][1] + this.element_list[this.num_videos+i][3];
		else
			return 0;
	}
	this.get_chat_width = function(i) {
		if(i < this.num_chats && i >= 0)
			return this.element_list[this.num_videos+i][2];
		else
			return 0;
	}
	this.get_chat_height = function(i) {
		if(i < this.num_chats && i >= 0)
			return this.element_list[this.num_videos+i][3];
		else
			return 0;
	}
	this.apply = function() {
		var jqVideos = $("div.iframe.video");
		var jqChats = $("div.iframe.chat");
		for(var i=0; i<this.num_videos+this.num_chats; i++)
		{
			(i<this.num_videos ? jqVideos.eq(i) : jqChats.eq(i-this.num_videos))
				.css("left", (this.element_list[i][0]-10)+"px")
				.css("top", (this.element_list[i][1]-10)+"px")
				.css("width", this.element_list[i][2]+"px")
				.css("height", this.element_list[i][3]+"px")
				.prop("iframe")
					.attr("width", this.element_list[i][2])
					.attr("height", this.element_list[i][3])
			;
		}
	}
};
var layout_manager_collection = [];
function LayoutManagerFactory(num_videos, num_chats, select)
{
	if(!layout_manager_collection[num_videos])
		layout_manager_collection[num_videos] = [];
	if(!layout_manager_collection[num_videos][num_chats])
		layout_manager_collection[num_videos][num_chats] = [];
	if(!layout_manager_collection[num_videos][num_chats][select])
		layout_manager_collection[num_videos][num_chats][select] = new LayoutManager(num_videos, num_chats);
	return layout_manager_collection[num_videos][num_chats][select];
}
function get_best_layout(layouts_arr)
{
	if(layouts_arr.length == 0)
		return null;
	var best = layouts_arr[0];
	for(var i=1; i<layouts_arr.length; i++)
	{
		var blankspace_comparison = best.get_unused_space() - layouts_arr[i].get_unused_space();
		var video_comparison = best.get_main_video_space() - layouts_arr[i].get_main_video_space();
		//if(blankspace_comparison > 0 || blankspace_comparison == 0 && video_comparison < 0)
		//	best = layouts_arr[i];
		if(video_comparison < 0)
			best = layouts_arr[i];
	}
	return best;
}

var chat_min_width = 251;
var chat_max_width = 350;
var chat_min_height = 300;
function arrange_windows()
{
	var num_videos = $("div.iframe.video").length;
	var num_chats = $("div.iframe.chat").length;
	var local_chat_max_width = Math.min(chat_max_width, $(window).width());
	if(num_videos == 0)
	{
		local_chat_max_width = Math.min(chat_max_width, $(window).width() / num_chats);
		var layout = LayoutManagerFactory(num_videos, num_chats, 0);
		for(var i=0; i<num_chats; i++)
		{
			layout.set_chat_size(i, [local_chat_max_width, $(window).height()]);
			layout.set_chat_position(i, [(i==0?0:layout.get_chat_right(i-1)), 0]);
		}
		layout.apply();
	}
	else if(num_videos == 1)
	{
		var layouts = [];			
		for(var L=0; L<=num_chats; L++)
		{
			local_chat_max_width = Math.min(chat_max_width, $(window).width()/(num_chats+(L?0:1)));
			layouts[L] = LayoutManagerFactory(num_videos, num_chats, L);
			layouts[L].set_video_size(0, get_widescreen_dimensions($(window).width()-local_chat_max_width*(num_chats-L), $(window).height()-(L>0 ? chat_min_height : 0)));
			if(L > 0)
				layouts[L].set_video_position(0, [(L<num_chats ? local_chat_max_width : 0), 0]);
			for(var i=0; i<num_chats; i++)
			{
				var chat_x;
				if(i==0 && num_chats>L) // num_chats>L means at least one chat is beside the video. If this is the first chat, it's the only one on the left.
					chat_x = 0;
				else if(i == num_chats-L) // num_chats-L corresponds to the first chat index "i" that goes under the video, and thus gets centered in the space beneath
					chat_x = (i>0?layouts[L].get_chat_right(0):0) + Math.max(0, (layouts[L].get_video_width(0)-local_chat_max_width*L)/2);
				else if(i==1 && i<num_chats-L) // if this is the second chat and it's still beside the video, it snaps to the video's right, or the bottom chats' right if that's wider
					chat_x = (layouts[L].get_video_width(0)>local_chat_max_width*L ? layouts[L].get_video_right(0) : layouts[L].get_video_x(0)+local_chat_max_width*L);
				else // all other chats just snap next to the previous chat
					chat_x = layouts[L].get_chat_right(i-1);
				
				layouts[L].set_chat(i, [
					chat_x,
					(i<num_chats-L ? 0 : layouts[L].get_video_height(0)),
					local_chat_max_width,
					$(window).height()-(i>=num_chats-L ? layouts[L].get_video_height(0) : 0)
				]);
				// If the window is REALLY short and wide for some reason (layout #0 to the extreme), the chats will be smaller than local_chat_max_width,
				// so video size needs to be recalculated now that we know how wide chats are going to be (since they should all be the same width in layout #0).
				if(i==0 && L == 0)
					layouts[L].set_video_size(0, get_widescreen_dimensions($(window).width()-layouts[L].get_chat_width(0)*num_chats, $(window).height()));
			}
			if(L == 0)
				layouts[L].set_video_position(0, [(L<num_chats ? layouts[L].get_chat_right(0) : 0), ($(window).height()-layouts[L].get_video_height(0))/2]);
		}
		get_best_layout(layouts).apply();
	}
	else if(num_videos == 2)
	{
		local_chat_max_width = Math.min(chat_max_width, $(window).width() / 3);
		var video_size = get_widescreen_dimensions_by_height(Math.floor($(window).height()/2), Math.floor($(window).width() - 2*local_chat_max_width));
		// alternatively, if the window is excessively wider than it is tall, we can arrange the videos side by side instead of one above the other
		if($(window).width() > video_size[0]*2 + local_chat_max_width*2)
			video_size = get_widescreen_dimensions(Math.floor(($(window).width() - 2*local_chat_max_width) / 2), $(window).height());
		
		set_dimensions(
			$("div.iframe.video").eq(0),
			[local_chat_max_width, 0],
			video_size
		);
		set_dimensions(
			$("div.iframe.chat").eq(0),
			[0, 0],
			[local_chat_max_width, $(window).height()]
		);
		set_dimensions(
			$("div.iframe.video").eq(1),
			[$(window).width()-local_chat_max_width-video_size[0], $(window).height()-video_size[1]],
			video_size
		);
		set_dimensions(
			$("div.iframe.chat").eq(1),
			[$(window).width()-local_chat_max_width, 0],
			[local_chat_max_width, $(window).height()]
		);
	}
	else if(num_videos == 3)
	{
		var video_size = get_widescreen_dimensions_by_height(Math.floor($(window).height()/2), Math.floor($(window).width()/2));
		// chats need to be divided among the last quadrant of the window
		local_chat_max_width = Math.min(chat_max_width, ($(window).width()-video_width) / 3 - 10);
		//TODO: triple streams gets pretty complicated with available space
		set_dimensions(
			$("div.iframe.video").eq(0),
			[0, 0],
			video_size
		);
		set_dimensions(
			$("div.iframe.chat").eq(0),
			[$(window).width()-local_chat_max_width*3-20, video_size[1]],
			[local_chat_max_width, video_size[1]]
		);
		set_dimensions(
			$("div.iframe.video").eq(1),
			[video_size[0], 0],
			video_size
		);
		set_dimensions(
			$("div.iframe.chat").eq(1),
			[$(window).width()-local_chat_max_width*2-10, video_size[1]],
			[local_chat_max_width, video_size[1]]
		);
		set_dimensions(
			$("div.iframe.video").eq(2),
			[0, video_size[1]],
			video_size
		);
		set_dimensions(
			$("div.iframe.chat").eq(2),
			[$(window).width()-local_chat_max_width, video_size[1]],
			[local_chat_max_width, video_size[1]]
		);
	}
	else if(num_videos == 4)
	{
		local_chat_max_width = Math.min(chat_max_width, $(window).width() / 4);
		var video_size = get_widescreen_dimensions_by_height(Math.floor($(window).height()/2), Math.floor($(window).width()/2));
		//TODO: a lot, this is not at all designed to work with chats visible
		set_dimensions(
			$("div.iframe.video").eq(0),
			[0, 0],
			video_size
		);
		set_dimensions(
			$("div.iframe.chat").eq(0),
			[0, video_size[1]*2],
			[local_chat_max_width, 540]
		);
		set_dimensions(
			$("div.iframe.video").eq(1),
			[video_size[0], 0],
			video_size
		);
		set_dimensions(
			$("div.iframe.chat").eq(1),
			[local_chat_max_width, video_size[1]*2],
			[local_chat_max_width, 540]
		);
		set_dimensions(
			$("div.iframe.video").eq(2),
			[0, video_size[1]],
			video_size
		);
		set_dimensions(
			$("div.iframe.chat").eq(2),
			[local_chat_max_width*2, video_size[1]*2],
			[local_chat_max_width, 540]
		);
		set_dimensions(
			$("div.iframe.video").eq(3),
			video_size,
			video_size
		);
		set_dimensions(
			$("div.iframe.chat").eq(3),
			[local_chat_max_width*3, video_size[1]*2],
			[local_chat_max_width, 540]
		);
	}
	$("div.iframe.chat").each(function(i,elem){
		var chat_scale = 1;
		if($(elem).width() < chat_min_width)
			chat_scale = $(elem).width() / chat_min_width;
		if($(elem).height() < chat_min_height)
			chat_scale = Math.min(chat_scale, $(elem).height() / chat_min_height);
		$(elem).children("iframe")
			.css("-ms-zoom", chat_scale)
			.css("-moz-transform", "scale("+ chat_scale +")")
			.css("-moz-transform-origin", "0 0")
			.css("-o-transform", "scale("+ chat_scale +")")
			.css("-o-transform-origin", "0 0")
			.css("-webkit-transform", "scale("+ chat_scale +")")
			.css("-webkit-transform-origin", "0 0")
			.css("-webkit-transform-origin", "0 0")
			.css("-webkit-transform-origin", "0 0")
			.css("width", $(elem).width()/chat_scale+"px")
			.css("height", $(elem).height()/chat_scale+"px")
			.attr("width", $(elem).width()/chat_scale)
			.attr("height", $(elem).height()/chat_scale)
		;
	});
}

function add_stream_input()
{
	if($("#add_stream").val() != "")
	{
		add_stream($("#add_stream").val());
	}
	$("#add_stream").val("");
	update_URL_bar();
}

function remove_window()
{
	$(this).parent().remove();
	$("#"+ this.id.substring(7)).remove();
	arrange_windows();
	update_URL_bar();
}

$(function(){
	$("#options").dialog({
		//modal: true,
		width: 600,
		title: "Options"
	});
	$("#add_stream").blur(add_stream_input).keydown(function(event){
		if(event.keyCode == 13)
			add_stream_input.call(this);
	});
	$(document).click(function(e){
		if(e.target.tagName == "BODY" || e.target.nodeName == "BODY" || e.target.tagName == "HTML" || e.target.nodeName == "HTML" || e.target.id == "background")
			$("#options").dialog("open");
	});
	$(window).keyup(function(event){
		if(event.keyCode == 27 && !$("#options").dialog("isOpen"))
			$("#options").dialog("open");
	});
	$(window).resize(arrange_windows);
	
	if(window.location.href == "https://nick-kree.github.io/better-multi-twitch/")
	{
		url_path = window.location.href;
		filename = "index.html";
	}
	else
	{
		console.log(window.location.href);
		var file_start = window.location.href.indexOf(filename);
		if(file_start > -1)
		{
			var params = window.location.href.substring(file_start + filename.length);
			url_path = window.location.href.substring(0, file_start);
			var slash_delimated = params.split("/");
			for(var i in slash_delimated)
			{
				if(slash_delimated[i] != "")
				{
					add_stream(slash_delimated[i]);
				}
			}
		}
		else
			alert("var filename is not set correctly. Change it by editing this file; it's near the top. It should just be the name of this file. Without this value set correctly, the page can not load streams automatically from the ones listed in the URL bar, nor update the URL bar to reflect the currently viewed streams.");
	}
});
