var setSong = function(songNumber) {
  if (currentSoundFile) {
    currentSoundFile.stop();
}
  currentlyPlayingSongNumber = parseInt(songNumber);
  currentSongFromAlbum = currentAlbum.songs[songNumber - 1];

  currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
    formats: [ 'mp3 '],
    preload: true
});

  setVolume(currentVolume);
};

var seek = function(time) {
  if (currentSoundFile) {
   currentSoundFile.setTime(time);
 }
}

var setVolume = function(volume) {
  if (currentSoundFile) {
      currentSoundFile.setVolume(volume);
  }
};

var getSongNumberCell = function(number) {
    return $('.song-item-number[data-song-number="' + number + '"]');
}

var playPause = function(songNumber, songRow) {
 if (currentlyPlayingSongNumber !== null) {
    var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
    currentlyPlayingCell.html(currentlyPlayingSongNumber);
 }
 if (currentlyPlayingSongNumber !== songNumber) {
    setSong(songNumber);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
    songRow.html(pauseButtonTemplate);

    var $volumeFill = $('.volume .fill');
    var $volumeThumb = $('.volume .thumb');
    $volumeFill.width(currentVolume + '%');
    $volumeThumb.css({left: currentVolume + '%'});

    $(this).html(pauseButtonTemplate);
    updatePlayerBarSong();

 } else if (currentlyPlayingSongNumber === songNumber) {
    if (currentSoundFile.isPaused()) {
        songRow.html(pauseButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPauseButton);
        currentSoundFile.play();
    } else {
        songRow.html(playButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPlayButton);
        currentSoundFile.pause();
    }

  }
};

var createSongRow = function(songNumber, songName, songLength) {
   var template =
      '<tr class="album-view-song-item">'
    + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
    + '  <td class="song-item-title">' + songName + '</td>'
    + '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
    + '</tr>'
    ;
var $row = $(template);
$row.find('.song-item-number').click(clickHandler);
$row.hover(onHover, offHover);
return $row
};

var clickHandler = function() {
   var songNumber = parseInt($(this).attr('data-song-number'));

   playPause(songNumber, $(this));
};

var onHover = function(event) {
 var songNumberCell = $(this).find('.song-item-number');
 var songNumber = parseInt(songNumberCell.attr('data-song-number'));


  if (songNumber !== currentlyPlayingSongNumber) {
     songNumberCell.html(playButtonTemplate);
  }
};

var offHover = function(event) {
   var songNumberCell = $(this).find('.song-item-number');
   var songNumber = parseInt(songNumberCell.attr('data-song-number'));


  if (songNumber !== currentlyPlayingSongNumber) {
      songNumberCell.html(songNumber);
   }
};

var setCurrentAlbum = function(album) {
  currentAlbum = album;
  var $albumTitle = $('.album-view-title');
  var $albumArtist = $('.album-view-artist');
  var $albumReleaseInfo = $('album-view-release-info');
  var $albumImage = $('.album-cover-art');
  var $albumSongList = $('.album-view-song-list');

  // #2
  $albumTitle.text(album.title);
  $albumArtist.text(album.artist);
  $albumReleaseInfo.text(album.year + ' ' + album.label);
  $albumImage.attr('src', album.albumArtUrl);

  // #3
  $albumSongList.empty();

   // #4
   for (var i = 0; i < album.songs.length; i++) {
     var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
     $albumSongList.append($newRow);

   }
};

var setTotalTimeInPlayerBar = function(totalTime) {
  $('.total-time').text(filterTimeCode(totalTime));

}

var filterTimeCode = function(timeInSeconds) {
  //1. string -> number
  var parsedSeconds = parseFloat(timeInSeconds);
  //2. get number of minutes
  var getMinutes = Math.floor(parsedSeconds / 60);
  //3. get number of seconds
  var getSeconds = Math.floor(parsedSeconds % 60);
  getSeconds = getSeconds < 10 ? "0" + getSeconds : getSeconds;
  return getMinutes + ":" + getSeconds;

  setTotalTimeInPlayerBar();

}

var setCurrentTimeInPlayerBar = function(currentTime) {
   $('.current-time').text(filterTimeCode(currentTime));

}

var updateSeekBarWhileSongPlays = function() {
   if (currentSoundFile) {
      currentSoundFile.bind('timeupdate', function(event) {

         var seekBarFillRatio = this.getTime() / this.getDuration();
         var $seekBar = $('.seek-control .seek-bar');

         updateSeekPercentage($seekBar, seekBarFillRatio);
         setCurrentTimeInPlayerBar(this.getTime());
         setTotalTimeInPlayerBar(this.getDuration());
     });
 }
};
var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
  var offsetXPercent = seekBarFillRatio * 100;

  offsetXPercent = Math.max(0, offsetXPercent);
  offsetXPercent = Math.min(100, offsetXPercent);

  var percentageString = offsetXPercent + '%';
  $seekBar.find('.fill').width(percentageString);
  $seekBar.find('.thumb').css({left: percentageString});

};

var setupSeekBars = function() {
   var $seekBars = $('.player-bar .seek-bar');

$seekBars.click(function(event) {
    var offsetX = event.pageX - $(this).offset().left;
    var barWidth = $(this).width();
    var seekBarFillRatio = offsetX / barWidth;

    if ($(this).parent().attr('class') == 'seek-control') {
        seek(seekBarFillRatio * currentSoundFile.getDuration());
    } else {
        setVolume(seekBarFillRatio * 100);
    }

    updateSeekPercentage($(this), seekBarFillRatio);
});

$seekBars.find('.thumb').mousedown(function(event) {

  var $seekBar = $(this).parent();

  $(document).bind('mousemove.thumb', function(event){
      var offsetX = event.pageX - $seekBar.offset().left;
      var barWidth = $seekBar.width();
      var seekBarFillRatio = offsetX / barWidth;

      if ($seekBar.parent().attr('class') == 'seek-control') {
          seek(seekBarFillRatio * currentSoundFile.getDuration());
      } else {
          setVolume(seekBarFillRatio);
      }

      updateSeekPercentage($seekBar, seekBarFillRatio);
    });
      $(document).bind('mouseup.thumb', function() {
      $(document).unbind('mousemove.thumb');
      $(document).unbind('mouseup.thumb');
    });
  });
};

var trackIndex = function (album, song) {
  return album.songs.indexOf(song);
}
var nextSong = function() {
    var getLastSongNumber = function(index) {
    return index == 0 ? currentAlbum.songs.length : index;
};

  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  currentSongIndex++;

  if (currentSongIndex >= currentAlbum.songs.length) {
      currentSongIndex = 0;
  }

  setSong(currentSongIndex + 1);
  currentSoundFile.play();
  updatePlayerBarSong();
  updateSeekBarWhileSongPlays();


  $('.currently-playing .song-name').text(currentSongFromAlbum.title);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.title);
  $('.main-controls .play-pause').html(playerBarPauseButton);

  var lastSongNumber = getLastSongNumber(currentSongIndex);
  var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

  $nextSongNumberCell.html(pauseButtonTemplate);
  $lastSongNumberCell.html(lastSongNumber);

};
var updatePlayerBarSong = function() {

  $('.currently-playing .song-name').text(currentSongFromAlbum.title);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);


  $('main-controls .play-pause').html(playerBarPauseButton);

};

var previousSong = function() {

  var getLastSongNumber = function(index) {
      return index == (currentAlbum.songs.length - 1) ? 1 : index + 2;
  };

  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  currentSongIndex--;

  if (currentSongIndex < 0) {
      currentSongIndex = currentAlbum.songs.length - 1;
  }

   setSong(currentSongIndex + 1);
   currentSoundFile.play();
   updatePlayerBarSong();

  $('.currently-playing .song-name').text(currentSongFromAlbum.title);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.title);
  $('.main-controls .play-pause').html(playerBarPauseButton);

  var lastSongNumber = getLastSongNumber(currentSongIndex);
  var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

  $previousSongNumberCell.html(pauseButtonTemplate);
  $lastSongNumberCell.html(lastSongNumber);
  updateSeekBarWhileSongPlays();

};

var togglePlayFromPlayerBar = function() {

  playPause(currentlyPlayingSongNumber, getSongNumberCell(currentlyPlayingSongNumber));
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';
// state of playing songs
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;
var currentAlbum = null;
var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playPause = $('.main-controls .play-pause');

$(document).ready(function() {
   setCurrentAlbum(albumPicasso);
   setupSeekBars();
   $previousButton.click(previousSong);
   $nextButton.click(nextSong);
   $playPause.click(togglePlayFromPlayerBar);

});
