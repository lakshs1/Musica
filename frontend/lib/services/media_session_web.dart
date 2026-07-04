import 'dart:js' as js;
import '../models/track.dart';

void updateMediaSession(Track? activeTrack, String? roomCode, bool isPlaying, Function setPlayState) {
  try {
    final nav = js.context['navigator'];
    if (nav == null) return;
    final mediaSession = nav['mediaSession'];
    if (mediaSession != null) {
      if (activeTrack != null) {
        final metadata = js.JsObject(js.context['MediaMetadata'], [
          js.JsObject.jsify({
            'title': activeTrack.title,
            'artist': 'Musync Room: $roomCode',
            'album': 'Musync App',
            'artwork': [
              {'src': activeTrack.thumbnail, 'sizes': '512x512', 'type': 'image/jpeg'}
            ]
          })
        ]);
        mediaSession['metadata'] = metadata;
      } else {
        mediaSession['metadata'] = null;
      }

      mediaSession['playbackState'] = isPlaying ? 'playing' : 'paused';

      mediaSession.callMethod('setActionHandler', ['play', () {
        setPlayState(true);
      }]);
      mediaSession.callMethod('setActionHandler', ['pause', () {
        setPlayState(false);
      }]);
    }
  } catch (e) {
    // Suppress Web MediaSession errors
  }
}
